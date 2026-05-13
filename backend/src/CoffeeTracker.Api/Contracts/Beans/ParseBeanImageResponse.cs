using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Domain.Enums;

namespace CoffeeTracker.Api.Contracts.Beans;

public sealed record ParseBeanImageResponse(
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
    public static ParseBeanImageResponse FromResult(ParseBeanImageResult result)
    {
        return new ParseBeanImageResponse(
            result.BeanName,
            result.RoasterId,
            result.RoasterName,
            result.OriginType,
            result.OriginCountries,
            result.Variety,
            result.ProcessingMethod,
            result.RoastProfile,
            result.RoastDate,
            result.Altitude,
            result.BagWeight,
            result.Price,
            result.FlavorNotes,
            result.UnmatchedReferences,
            result.Region);
    }
}
