using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.BrewLog.Commands;

public sealed record UpdateBrewLogCommand(
    Guid Id,
    Guid BeanId,
    Guid BrewerId,
    Guid GrinderId,
    Guid? RecipeId,
    List<Guid>? AccessoryIds,
    decimal Dose,
    decimal WaterAmount,
    decimal? WaterTemperature,
    string? GrindSize,
    int? BrewTimeSeconds,
    int? Rating,
    string? Notes,
    string? AdjustmentIdeas,
    DateTime BrewedAt) : IRequest;

public sealed class UpdateBrewLogValidator : AbstractValidator<UpdateBrewLogCommand>
{
    public UpdateBrewLogValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.BeanId)
            .NotEmpty();

        RuleFor(command => command.BrewerId)
            .NotEmpty();

        RuleFor(command => command.GrinderId)
            .NotEmpty();

        RuleFor(command => command.Dose)
            .GreaterThan(0m);

        RuleFor(command => command.WaterAmount)
            .GreaterThan(0m);

        RuleFor(command => command.WaterTemperature)
            .InclusiveBetween(0m, 100m)
            .When(command => command.WaterTemperature.HasValue);

        RuleFor(command => command.GrindSize)
            .MaximumLength(10);

        RuleFor(command => command.BrewTimeSeconds)
            .GreaterThanOrEqualTo(0)
            .When(command => command.BrewTimeSeconds.HasValue);

        RuleFor(command => command.Rating)
            .InclusiveBetween(1, 5)
            .When(command => command.Rating.HasValue);

        RuleFor(command => command.Notes)
            .MaximumLength(2000);

        RuleFor(command => command.AdjustmentIdeas)
            .MaximumLength(1000);

        RuleFor(command => command.BrewedAt)
            .NotEmpty();

        RuleForEach(command => command.AccessoryIds)
            .NotEmpty();
    }
}

public sealed class UpdateBrewLogHandler(ApplicationDbContext dbContext)
    : IRequestHandler<UpdateBrewLogCommand>
{
    public async Task Handle(UpdateBrewLogCommand request, CancellationToken cancellationToken)
    {
        var brewLogEntry = await dbContext.BrewLogEntries
            .Include(entity => entity.Accessories)
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (brewLogEntry is null)
        {
            throw new NotFoundException($"Brew log '{request.Id}' was not found.");
        }

        await EnsureRequiredEntitiesExist(request, cancellationToken);
        await EnsureRecipeConsistency(request.RecipeId, request.BrewerId, cancellationToken);

        var accessories = await ResolveAccessories(request.AccessoryIds, cancellationToken);
        var rating = request.Rating.HasValue ? (BrewRating?)request.Rating.Value : null;

        brewLogEntry.Update(
            request.BeanId,
            request.BrewerId,
            request.GrinderId,
            request.RecipeId,
            request.Dose,
            request.WaterAmount,
            request.WaterTemperature,
            request.GrindSize,
            request.BrewTimeSeconds,
            rating,
            request.Notes,
            request.AdjustmentIdeas,
            request.BrewedAt);

        brewLogEntry.SetAccessories(accessories);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureRequiredEntitiesExist(UpdateBrewLogCommand request, CancellationToken cancellationToken)
    {
        var beanExists = await dbContext.Beans
            .AnyAsync(entity => entity.Id == request.BeanId, cancellationToken);

        if (!beanExists)
        {
            throw new NotFoundException($"Bean '{request.BeanId}' was not found.");
        }

        var brewerExists = await dbContext.Brewers
            .AnyAsync(entity => entity.Id == request.BrewerId, cancellationToken);

        if (!brewerExists)
        {
            throw new NotFoundException($"Brewer '{request.BrewerId}' was not found.");
        }

        var grinderExists = await dbContext.Grinders
            .AnyAsync(entity => entity.Id == request.GrinderId, cancellationToken);

        if (!grinderExists)
        {
            throw new NotFoundException($"Grinder '{request.GrinderId}' was not found.");
        }
    }

    private async Task EnsureRecipeConsistency(Guid? recipeId, Guid brewerId, CancellationToken cancellationToken)
    {
        if (!recipeId.HasValue)
        {
            return;
        }

        var recipe = await dbContext.Recipes
            .AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.Id == recipeId.Value, cancellationToken);

        if (recipe is null)
        {
            throw new NotFoundException($"Recipe '{recipeId.Value}' was not found.");
        }

        if (recipe.BrewerId != brewerId)
        {
            throw new ConflictException("Recipe brewer must match the selected brewer.");
        }
    }

    private async Task<IReadOnlyList<Accessory>> ResolveAccessories(
        List<Guid>? accessoryIds,
        CancellationToken cancellationToken)
    {
        var ids = accessoryIds?
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList() ?? [];

        if (ids.Count == 0)
        {
            return [];
        }

        var accessories = await dbContext.Accessories
            .Where(entity => ids.Contains(entity.Id))
            .ToListAsync(cancellationToken);

        if (accessories.Count != ids.Count)
        {
            throw new NotFoundException("One or more accessories were not found.");
        }

        return accessories;
    }
}
