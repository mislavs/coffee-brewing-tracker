using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Application.Features.FlavorNotes.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Queries;

public sealed record GetBeanByIdQuery(Guid Id) : IRequest<BeanDto>;

public sealed class GetBeanByIdHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetBeanByIdQuery, BeanDto>
{
    public async Task<BeanDto> Handle(GetBeanByIdQuery request, CancellationToken cancellationToken)
    {
        var bean = await dbContext.Beans
            .AsNoTracking()
            .Include(entity => entity.Roaster)
            .Include(entity => entity.OriginCountries)
            .Include(entity => entity.FlavorNotes)
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (bean is null)
        {
            throw new NotFoundException($"Bean '{request.Id}' was not found.");
        }

        var totalDose = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entry => entry.BeanId == request.Id)
            .SumAsync(entry => (decimal?)entry.Dose, cancellationToken) ?? 0m;

        return new BeanDto(
            bean.Id,
            bean.Name,
            bean.RoasterId,
            bean.Roaster.Name,
            bean.OriginType,
            bean.OriginCountries.Select(country => country.Name).ToList(),
            bean.Variety,
            bean.ProcessingMethod,
            bean.RoastProfile,
            bean.RoastDate,
            bean.Altitude,
            bean.BagWeight,
            bean.Price,
            bean.PricePerKg,
            bean.FlavorNotes
                .OrderBy(entity => entity.Name)
                .Select(entity => new FlavorNoteDto(entity.Id, entity.Name))
                .ToList(),
            bean.IsAvailable,
            bean.BagWeight - totalDose);
    }
}
