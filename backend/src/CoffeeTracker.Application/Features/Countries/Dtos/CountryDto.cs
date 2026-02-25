namespace CoffeeTracker.Application.Features.Countries.Dtos;

public sealed record CountryDto(Guid Id, string Name, string IsoAlpha2, string IsoNumericCode);
