using CoffeeTracker.Infrastructure.AI.Extraction.Shared;
using Microsoft.Extensions.Logging;

namespace CoffeeTracker.Infrastructure.AI.Extraction.BeanImage;

public sealed class BeanImageExtractionService(
    IDataExtractor extractor,
    ILogger<BeanImageExtractionService> logger) : IBeanImageExtractionService
{
    public async Task<BeanImageExtractionResult> ExtractAsync(
        Stream imageStream,
        string contentType,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(imageStream);
        ArgumentException.ThrowIfNullOrWhiteSpace(contentType);

        await using var buffer = new MemoryStream();
        await imageStream.CopyToAsync(buffer, cancellationToken);
        var imageBytes = buffer.ToArray();

        if (imageBytes.Length == 0)
        {
            logger.LogWarning("Bean image extraction received an empty image stream.");
            return BeanImageExtractionResult.Empty;
        }

        var result = await extractor.ExtractFromImageAsync<BeanImageExtractionResult>(
            BuildExtractionInstructions(),
            imageBytes,
            contentType,
            userText: null,
            cancellationToken);

        if (result is null)
        {
            logger.LogWarning("LLM returned null response for bean image extraction.");
            return BeanImageExtractionResult.Empty;
        }

        var normalized = Normalize(result);
        logger.LogInformation(
            "Bean image extraction completed. Bean: {BeanName}, Roaster: {RoasterName}, Unmatched references: {UnmatchedCount}.",
            normalized.BeanName,
            normalized.RoasterName,
            normalized.UnmatchedReferences.Count);

        return normalized;
    }

    private static BeanImageExtractionResult Normalize(BeanImageExtractionResult result) =>
        new(
            result.BeanName,
            result.RoasterName,
            result.OriginCountries ?? [],
            result.Variety,
            result.ProcessingMethod,
            result.RoastProfile,
            result.RoastDate,
            result.Altitude,
            result.BagWeight,
            result.Price,
            result.FlavorNotes ?? [],
            result.UnmatchedReferences ?? [],
            NormalizeOptionalText(result.Region));

    private static string? NormalizeOptionalText(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string BuildExtractionInstructions()
    {
        return
            """
            You extract structured coffee bean information from a coffee bag label image.
            Return a single valid JSON object only. No markdown and no comments.

            Rules:
            1) Use only text visible in the image.
            2) Do not invent values that are not explicitly visible or strongly implied.
            3) If a field is not visible or uncertain, set it to null.
            4) Use originCountries, flavorNotes, and unmatchedReferences as arrays (never null).
            5) Put uncertain label fragments into unmatchedReferences.

            Output requirements:
            - Include ALL keys every time.
            - Use these keys exactly:
              beanName, roasterName, originCountries, region, variety, processingMethod,
              roastProfile, roastDate, altitude, bagWeight, price, flavorNotes, unmatchedReferences
            - region should be a producing region or local area visible on the label, such as "Huila", "Nyeri", or "Yirgacheffe"; do not use a country name as region
            - roastProfile should be one of: "Filter", "Espresso", "Omni", or null
            - altitude should be an integer number (meters) or null
            - bagWeight and price should be numeric values when visible, otherwise null
            """;
    }
}
