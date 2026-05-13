using CoffeeTracker.Application.Features.FlavorNotes;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Commands;

public sealed record UpdateBeanCommand(
    Guid Id,
    string Name,
    Guid RoasterId,
    OriginType OriginType,
    IReadOnlyList<Guid>? OriginCountryIds,
    string? Variety,
    string? ProcessingMethod,
    RoastProfile RoastProfile,
    DateOnly? RoastDate,
    int? Altitude,
    decimal BagWeight,
    decimal? Price,
    bool IsAvailable,
    IReadOnlyList<string>? FlavorNoteNames,
    string? Region = null) : IRequest, IBeanCommand;

public sealed class UpdateBeanValidator : AbstractValidator<UpdateBeanCommand>
{
    public UpdateBeanValidator()
    {
        Include(new BeanCommandValidationRules<UpdateBeanCommand>());
        RuleFor(c => c.Id).NotEmpty();
    }
}

public sealed class UpdateBeanHandler(ApplicationDbContext dbContext)
    : IRequestHandler<UpdateBeanCommand>
{
    public async Task Handle(UpdateBeanCommand request, CancellationToken cancellationToken)
    {
        var bean = await dbContext.Beans
            .Include(entity => entity.FlavorNotes)
            .Include(entity => entity.OriginCountries)
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (bean is null)
        {
            throw new NotFoundException($"Bean '{request.Id}' was not found.");
        }

        var roasterExists = await dbContext.Roasters
            .AnyAsync(entity => entity.Id == request.RoasterId, cancellationToken);

        if (!roasterExists)
        {
            throw new NotFoundException($"Roaster '{request.RoasterId}' was not found.");
        }

        var flavorNotes = await dbContext.ResolveFlavorNotesAsync(request.FlavorNoteNames, cancellationToken);
        var requestedOriginCountryIds = request.OriginCountryIds?
            .Distinct()
            .ToList() ?? [];
        var originCountries = requestedOriginCountryIds.Count > 0
            ? await dbContext.Countries
                .Where(entity => requestedOriginCountryIds.Contains(entity.Id))
                .ToListAsync(cancellationToken)
            : [];

        if (originCountries.Count != requestedOriginCountryIds.Count)
        {
            throw new NotFoundException("One or more origin countries were not found.");
        }

        bean.Update(
            request.Name,
            request.RoasterId,
            request.OriginType,
            originCountries,
            request.Variety,
            request.ProcessingMethod,
            request.RoastProfile,
            request.RoastDate,
            request.Altitude,
            request.BagWeight,
            request.Price,
            request.IsAvailable,
            request.Region);

        bean.SetFlavorNotes(flavorNotes);

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
