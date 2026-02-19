using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Application.Features.Countries.Dtos;
using CoffeeTracker.Application.Features.Countries.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class CountryEndpoints
{
    public static IEndpointRouteBuilder MapCountryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/countries")
            .WithTags("Countries");

        group.MapGet("/", GetCountries)
            .WithName("GetCountries");

        group.MapGet("/{countryId:guid}/beans", GetCountryBeans)
            .WithName("GetCountryBeans");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<CountryDto>>> GetCountries(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var countries = await sender.Send(new GetCountriesListQuery(), cancellationToken);
        return TypedResults.Ok(countries);
    }

    private static async Task<Ok<IReadOnlyList<BeanSummaryDto>>> GetCountryBeans(
        Guid countryId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var beans = await sender.Send(new GetCountryBeansListQuery(countryId), cancellationToken);
        return TypedResults.Ok(beans);
    }
}
