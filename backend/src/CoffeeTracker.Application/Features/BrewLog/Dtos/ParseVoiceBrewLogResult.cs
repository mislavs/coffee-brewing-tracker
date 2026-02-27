namespace CoffeeTracker.Application.Features.BrewLog.Dtos;

public sealed record ParseVoiceBrewLogResult(
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
    public static ParseVoiceBrewLogResult Empty =>
        new(
            Transcript: string.Empty,
            BeanId: null,
            BeanName: null,
            BrewerId: null,
            BrewerName: null,
            GrinderId: null,
            GrinderName: null,
            RecipeId: null,
            RecipeName: null,
            AccessoryIds: [],
            AccessoryNames: [],
            Dose: null,
            WaterAmount: null,
            WaterTemperature: null,
            GrindSize: null,
            BrewTimeSeconds: null,
            Rating: null,
            Notes: null,
            AdjustmentIdeas: null,
            BrewedAt: null,
            UnmatchedReferences: []);
}
