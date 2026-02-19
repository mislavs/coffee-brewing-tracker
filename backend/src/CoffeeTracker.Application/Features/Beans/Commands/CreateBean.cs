using CoffeeTracker.Application.Features.FlavorNotes;
using CoffeeTracker.Application.Features.Countries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Commands;

public sealed record CreateBeanCommand(
    string Name,
    Guid RoasterId,
    OriginType OriginType,
    IReadOnlyList<string>? OriginCountries,
    string? Variety,
    string? ProcessingMethod,
    RoastProfile RoastProfile,
    DateOnly? RoastDate,
    int? Altitude,
    decimal BagWeight,
    decimal? Price,
    IReadOnlyList<string>? FlavorNoteNames) : IRequest<Guid>, IBeanCommand;

public sealed class CreateBeanValidator : AbstractValidator<CreateBeanCommand>
{
    public CreateBeanValidator() => Include(new BeanCommandValidationRules<CreateBeanCommand>());
}

public sealed class CreateBeanHandler(ApplicationDbContext dbContext)
    : IRequestHandler<CreateBeanCommand, Guid>
{
    public async Task<Guid> Handle(CreateBeanCommand request, CancellationToken cancellationToken)
    {
        var roasterExists = await dbContext.Roasters
            .AnyAsync(entity => entity.Id == request.RoasterId, cancellationToken);

        if (!roasterExists)
        {
            throw new NotFoundException($"Roaster '{request.RoasterId}' was not found.");
        }

        var flavorNotes = await dbContext.ResolveFlavorNotesAsync(request.FlavorNoteNames, cancellationToken);
        var originCountries = await dbContext.ResolveCountriesAsync(request.OriginCountries, cancellationToken);

        var bean = Bean.Create(
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
            request.Price);

        bean.SetFlavorNotes(flavorNotes);

        dbContext.Beans.Add(bean);
        await dbContext.SaveChangesAsync(cancellationToken);

        return bean.Id;
    }
}
