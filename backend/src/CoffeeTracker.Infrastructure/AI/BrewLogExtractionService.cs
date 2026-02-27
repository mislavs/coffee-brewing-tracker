using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace CoffeeTracker.Infrastructure.AI;

public sealed class BrewLogExtractionService(
    IChatClient chatClient,
    ILogger<BrewLogExtractionService> logger) : IBrewLogExtractionService
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new(JsonSerializerDefaults.Web);

    public async Task<BrewLogExtractionResult> ExtractAsync(
        string transcript,
        EntityCatalog catalog,
        CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(transcript);
        ArgumentNullException.ThrowIfNull(catalog);

        var messages = new[]
        {
            new ChatMessage(ChatRole.System, BuildSystemPrompt(catalog)),
            new ChatMessage(ChatRole.User, transcript)
        };

        var response = await chatClient.GetResponseAsync(
            messages,
            new ChatOptions
            {
                ResponseFormat = ChatResponseFormat.Json
            },
            cancellationToken);

        if (string.IsNullOrWhiteSpace(response.Text))
        {
            return BrewLogExtractionResult.Empty;
        }

        try
        {
            var result = JsonSerializer.Deserialize<BrewLogExtractionResult>(response.Text, JsonSerializerOptions);
            return result is null ? BrewLogExtractionResult.Empty : Normalize(result);
        }
        catch (JsonException jsonException)
        {
            logger.LogWarning(jsonException, "Failed to parse brew extraction JSON response.");
            return BrewLogExtractionResult.Empty with
            {
                UnmatchedReferences = [$"Could not parse AI extraction response: {jsonException.Message}"]
            };
        }
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

    private static string BuildSystemPrompt(EntityCatalog catalog)
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
              brewTimeSeconds, rating, notes, adjustmentIdeas, brewedAt, unmatchedReferences
            - Null/defaults:
              - Unknown scalar fields => null
              - accessoryIds, accessoryNames, unmatchedReferences => [] (never null)
            - Types/formats:
              - Id fields => UUID strings or null
              - brewTimeSeconds, rating => integers or null
              - dose, waterAmount, waterTemperature => numbers or null
              - brewedAt => ISO-8601 datetime string or null

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
