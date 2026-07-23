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
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new
            {
                entity.Id,
                entity.Name,
                entity.RoasterId,
                RoasterName = entity.Roaster.Name,
                entity.OriginType,
                OriginCountries = entity.OriginCountries
                    .Select(country => new { country.Id, country.Name })
                    .ToList(),
                entity.Variety,
                entity.ProcessingMethod,
                entity.Region,
                entity.RoastProfile,
                entity.RoastDate,
                entity.Altitude,
                entity.BagWeight,
                entity.Price,
                Rating = entity.Rating.HasValue ? (int?)entity.Rating.Value : null,
                entity.Notes,
                FlavorNotes = entity.FlavorNotes
                    .Select(note => new { note.Id, note.Name })
                    .ToList(),
                HasImage = entity.ImageData != null,
                entity.IsAvailable
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (bean is null)
        {
            throw new NotFoundException($"Bean '{request.Id}' was not found.");
        }

        var totalDose = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entry => entry.BeanId == request.Id)
            .SumAsync(entry => (decimal?)entry.Dose, cancellationToken) ?? 0m;

        var suggestedRating = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entry => entry.BeanId == request.Id)
            .MaxAsync(
                entry => entry.Rating.HasValue ? (int?)entry.Rating.Value : null,
                cancellationToken);

        var pricePerKg = bean.Price.HasValue && bean.BagWeight > 0
            ? bean.Price.Value / (bean.BagWeight / 1000m)
            : (decimal?)null;

        return new BeanDto(
            bean.Id,
            bean.Name,
            bean.RoasterId,
            bean.RoasterName,
            bean.OriginType,
            bean.OriginCountries
                .OrderBy(country => country.Name)
                .Select(country => new BeanOriginCountryDto(country.Id, country.Name))
                .ToList(),
            bean.Variety,
            bean.ProcessingMethod,
            bean.Region,
            bean.RoastProfile,
            bean.RoastDate,
            bean.Altitude,
            bean.BagWeight,
            bean.Price,
            bean.Rating,
            suggestedRating,
            bean.Notes,
            pricePerKg,
            bean.FlavorNotes
                .OrderBy(note => note.Name)
                .Select(note => new FlavorNoteDto(note.Id, note.Name))
                .ToList(),
            bean.HasImage,
            bean.HasImage ? $"/api/beans/{request.Id}/image" : null,
            bean.IsAvailable,
            Math.Max(0m, bean.BagWeight - totalDose));
    }
}
