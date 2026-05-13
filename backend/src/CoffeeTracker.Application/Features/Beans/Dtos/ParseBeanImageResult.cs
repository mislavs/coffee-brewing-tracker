using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Application.Features.Beans.Dtos;

public sealed record ParseBeanImageResult(
    string? BeanName,
    Guid? RoasterId,
    string? RoasterName,
    OriginType? OriginType,
    List<string> OriginCountries,
    string? Variety,
    string? ProcessingMethod,
    RoastProfile? RoastProfile,
    DateOnly? RoastDate,
    int? Altitude,
    decimal? BagWeight,
    decimal? Price,
    List<string> FlavorNotes,
    List<string> UnmatchedReferences,
    string? Region = null)
{
    public static ParseBeanImageResult Empty =>
        new(
            BeanName: null,
            RoasterId: null,
            RoasterName: null,
            OriginType: null,
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
