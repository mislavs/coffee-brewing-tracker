namespace CoffeeTracker.Infrastructure.AI.Extraction.BeanImage;

public sealed record BeanImageExtractionResult(
    string? BeanName,
    string? RoasterName,
    List<string> OriginCountries,
    string? Variety,
    string? ProcessingMethod,
    string? RoastProfile,
    string? RoastDate,
    int? Altitude,
    decimal? BagWeight,
    decimal? Price,
    List<string> FlavorNotes,
    List<string> UnmatchedReferences,
    string? Region = null)
{
    public static BeanImageExtractionResult Empty =>
        new(
            BeanName: null,
            RoasterName: null,
            OriginCountries: [],
            Variety: null,
            ProcessingMethod: null,
            RoastProfile: null,
            RoastDate: null,
            Altitude: null,
            BagWeight: null,
            Price: null,
            FlavorNotes: [],
            UnmatchedReferences: []);
}
