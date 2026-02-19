using CoffeeTracker.Application.Features.FlavorNotes.Dtos;
using CoffeeTracker.Application.Features.FlavorNotes.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class FlavorNoteEndpoints
{
    public static IEndpointRouteBuilder MapFlavorNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/flavor-notes")
            .WithTags("FlavorNotes");

        group.MapGet("/", GetFlavorNotes)
            .WithName("GetFlavorNotes");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<FlavorNoteDto>>> GetFlavorNotes(
        ISender sender,
        CancellationToken cancellationToken)
    {
        var flavorNotes = await sender.Send(new GetFlavorNotesListQuery(), cancellationToken);
        return TypedResults.Ok(flavorNotes);
    }
}
