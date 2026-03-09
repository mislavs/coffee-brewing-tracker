using CoffeeTracker.Infrastructure.AI.Extraction.Shared;
using Microsoft.Extensions.Logging;
using System.Text;

namespace CoffeeTracker.Infrastructure.AI.Extraction.BrewLog;

public sealed class BrewLogExtractionService(
    IDataExtractor extractor,
    ILogger<BrewLogExtractionService> logger) : IBrewLogExtractionService
{
    public async Task<BrewLogExtractionResult> ExtractAsync(
        string transcript,
        EntityCatalog catalog,
        CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(transcript);
        ArgumentNullException.ThrowIfNull(catalog);

        var instructions = BuildExtractionInstructions(catalog);
        var result = await extractor.ExtractFromTextAsync<BrewLogExtractionResult>(
            instructions,
            transcript,
            cancellationToken);

        if (result is null)
        {
            logger.LogWarning("LLM returned null response for brew log extraction.");
            return BrewLogExtractionResult.Empty;
        }

        var normalized = Normalize(result);
        logger.LogInformation(
            "Brew log extraction completed. Matched bean: {BeanName}, brewer: {BrewerName}, grinder: {GrinderName}. Unmatched references: {UnmatchedCount}.",
            normalized.BeanName,
            normalized.BrewerName,
            normalized.GrinderName,
            normalized.UnmatchedReferences.Count);

        return normalized;
    }

    private static BrewLogExtractionResult Normalize(BrewLogExtractionResult result) =>
        new(
            result.BeanId,
            result.BeanName,
            result.BrewerId,
            result.BrewerName,
            result.GrinderId,
            result.GrinderName,
            result.RecipeId,
            result.RecipeName,
            result.AccessoryIds ?? [],
            result.AccessoryNames ?? [],
            result.Dose,
            result.WaterAmount,
            result.WaterTemperature,
            result.GrindSize,
            result.BrewTimeSeconds,
            result.Rating,
            result.Notes,
            result.AdjustmentIdeas,
            result.BrewedAt,
            result.UnmatchedReferences ?? []);

    private static string BuildExtractionInstructions(EntityCatalog catalog)
    {
        var builder = new StringBuilder();
        builder.Append(
            """
            You extract structured coffee brew log data from a user transcript.
            Return a single valid JSON object only. No markdown, no comments.

            Rules:
            1) Use ONLY entities from the provided catalog.
            2) If an entity match is uncertain, set the corresponding Id and Name to null.
            3) Put unmatched spoken entity names in unmatchedReferences.
            4) Do not invent values not present or strongly implied by the transcript.
            5) If multiple candidates match, prefer null over guessing.

            Output requirements:
            - Include ALL keys every time.
            - Use these keys exactly:
              beanId, beanName, brewerId, brewerName, grinderId, grinderName, recipeId, recipeName,
              accessoryIds, accessoryNames, dose, waterAmount, waterTemperature, grindSize,
              brewTimeSeconds, notes, adjustmentIdeas, unmatchedReferences
            - Null/defaults:
              - Unknown scalar fields => null
              - accessoryIds, accessoryNames, unmatchedReferences => [] (never null)
            - Types/formats:
              - Id fields => UUID strings or null
              - brewTimeSeconds => integers or null
              - dose, waterAmount, waterTemperature, grindSize => numbers or null
              - notes, adjustmentIdeas => strings or null (never arrays)

            Entity catalog:
            """);
        AppendEntities(builder, "beans", catalog.Beans);
        AppendEntities(builder, "brewers", catalog.Brewers);
        AppendEntities(builder, "grinders", catalog.Grinders);
        AppendEntities(builder, "recipes", catalog.Recipes);
        AppendEntities(builder, "accessories", catalog.Accessories);

        return builder.ToString();
    }

    private static void AppendEntities(StringBuilder builder, string entityType, IReadOnlyCollection<EntityRef> entities)
    {
        builder.AppendLine($"{entityType}:");
        foreach (var entity in entities)
        {
            builder.AppendLine($"- {entity.Id}: {entity.Name}");
        }

        if (entities.Count == 0)
        {
            builder.AppendLine("- none");
        }
    }
}
