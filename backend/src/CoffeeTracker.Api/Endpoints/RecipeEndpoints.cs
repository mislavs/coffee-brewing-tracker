using CoffeeTracker.Api.Contracts.Recipes;
using CoffeeTracker.Application.Features.Recipes.Commands;
using CoffeeTracker.Application.Features.Recipes.Dtos;
using CoffeeTracker.Application.Features.Recipes.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoffeeTracker.Api.Endpoints;

public static class RecipeEndpoints
{
    public static IEndpointRouteBuilder MapRecipeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/recipes")
            .WithTags("Recipes");

        group.MapGet("/", GetRecipes)
            .WithName("GetRecipes");

        group.MapGet("/{id:guid}", GetRecipeById)
            .WithName("GetRecipeById");

        group.MapPost("/", CreateRecipe)
            .WithName("CreateRecipe");

        group.MapPut("/{id:guid}", UpdateRecipe)
            .WithName("UpdateRecipe");

        group.MapDelete("/{id:guid}", DeleteRecipe)
            .WithName("DeleteRecipe");

        return app;
    }

    private static async Task<Ok<IReadOnlyList<RecipeSummaryDto>>> GetRecipes(
        Guid? brewerId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var recipes = await sender.Send(new GetRecipesListQuery(brewerId), cancellationToken);
        return TypedResults.Ok(recipes);
    }

    private static async Task<Ok<RecipeDto>> GetRecipeById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var recipe = await sender.Send(new GetRecipeByIdQuery(id), cancellationToken);
        return TypedResults.Ok(recipe);
    }

    private static async Task<Created<CreateRecipeResponse>> CreateRecipe(
        CreateRecipeRequest request,
        LinkGenerator linkGenerator,
        HttpContext context,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var recipeId = await sender.Send(
            new CreateRecipeCommand(request.Name, request.BrewerId, request.Description),
            cancellationToken);

        var location = linkGenerator.GetPathByName(
                           context,
                           "GetRecipeById",
                           new { id = recipeId }) ??
                       $"/api/recipes/{recipeId}";

        return TypedResults.Created(location, new CreateRecipeResponse(recipeId));
    }

    private static async Task<Ok> UpdateRecipe(
        Guid id,
        UpdateRecipeRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(
            new UpdateRecipeCommand(id, request.Name, request.BrewerId, request.Description),
            cancellationToken);

        return TypedResults.Ok();
    }

    private static async Task<NoContent> DeleteRecipe(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(new DeleteRecipeCommand(id), cancellationToken);
        return TypedResults.NoContent();
    }
}
