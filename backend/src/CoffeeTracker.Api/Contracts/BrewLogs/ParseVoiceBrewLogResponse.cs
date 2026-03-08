using CoffeeTracker.Application.Features.BrewLog.Dtos;

namespace CoffeeTracker.Api.Contracts.BrewLogs;

public sealed record ParseVoiceBrewLogResponse(
    string Transcript,
    Guid? BeanId,
    string? BeanName,
    Guid? BrewerId,
    string? BrewerName,
    Guid? GrinderId,
    string? GrinderName,
    Guid? RecipeId,
    string? RecipeName,
    List<Guid> AccessoryIds,
    List<string> AccessoryNames,
    decimal? Dose,
    decimal? WaterAmount,
    decimal? WaterTemperature,
    string? GrindSize,
    int? BrewTimeSeconds,
    int? Rating,
    string? Notes,
    string? AdjustmentIdeas,
    DateTime? BrewedAt,
    List<string> UnmatchedReferences)
{
    public static ParseVoiceBrewLogResponse FromResult(ParseVoiceBrewLogResult result)
    {
        return new ParseVoiceBrewLogResponse(
            result.Transcript,
            result.BeanId,
            result.BeanName,
            result.BrewerId,
            result.BrewerName,
            result.GrinderId,
            result.GrinderName,
            result.RecipeId,
            result.RecipeName,
            result.AccessoryIds,
            result.AccessoryNames,
            result.Dose,
            result.WaterAmount,
            result.WaterTemperature,
            result.GrindSize,
            result.BrewTimeSeconds,
            result.Rating,
            result.Notes,
            result.AdjustmentIdeas,
            result.BrewedAt,
            result.UnmatchedReferences);
    }
}
