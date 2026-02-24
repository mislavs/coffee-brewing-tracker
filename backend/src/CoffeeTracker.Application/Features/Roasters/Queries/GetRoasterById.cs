using CoffeeTracker.Application.Features.Roasters.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Queries;

public sealed record GetRoasterByIdQuery(Guid Id) : IRequest<RoasterDto>;

public sealed class GetRoasterByIdHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetRoasterByIdQuery, RoasterDto>
{
    public async Task<RoasterDto> Handle(GetRoasterByIdQuery request, CancellationToken cancellationToken)
    {
        var roaster = await dbContext.Roasters
            .AsNoTracking()
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new
            {
                entity.Id,
                entity.Name,
                entity.City,
                entity.CountryId,
                CountryName = entity.Country != null ? entity.Country.Name : null,
                HasLogo = entity.LogoData != null
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (roaster is null)
        {
            throw new NotFoundException($"Roaster '{request.Id}' was not found.");
        }

        var beans = await dbContext.Beans
            .AsNoTracking()
            .Where(bean => bean.RoasterId == request.Id)
            .Select(bean => new
            {
                bean.Id,
                bean.Name,
                bean.BagWeight,
                bean.Price,
                bean.RoastProfile
            })
            .ToListAsync(cancellationToken);

        var beanSummaries = beans
            .OrderBy(bean => bean.Name)
            .Select(bean => new RoasterBeanSummaryDto(bean.Id, bean.Name))
            .ToList();

        var beanCount = beans.Count;
        var pricedBeans = beans
            .Where(bean => bean.Price.HasValue && bean.BagWeight > 0)
            .Select(bean => bean.Price!.Value / (bean.BagWeight / 1000m))
            .ToList();
        decimal? avgPricePerKgResult = pricedBeans.Count == 0 ? null : pricedBeans.Average();

        var totalPurchasedWeightGrams = beans.Sum(bean => bean.BagWeight);

        var topRoastProfile = beans
            .GroupBy(bean => bean.RoastProfile)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key)
            .Select(group => group.Key.ToString())
            .FirstOrDefault();

        var brewStats = await (from brew in dbContext.BrewLogEntries.AsNoTracking()
                               join bean in dbContext.Beans.AsNoTracking()
                                   on brew.BeanId equals bean.Id
                               where bean.RoasterId == request.Id
                               select new
                               {
                                   Rating = brew.Rating.HasValue ? (int?)brew.Rating.Value : null
                               })
            .ToListAsync(cancellationToken);

        var brewCount = brewStats.Count;
        var avgBrewRating = brewStats
            .Where(entry => entry.Rating.HasValue)
            .Select(entry => (decimal?)entry.Rating!.Value)
            .Average();

        return new RoasterDto(
            roaster.Id,
            roaster.Name,
            roaster.City,
            roaster.CountryId,
            roaster.CountryName,
            beanSummaries,
            beanCount,
            avgPricePerKgResult,
            totalPurchasedWeightGrams,
            topRoastProfile,
            brewCount,
            avgBrewRating,
            roaster.HasLogo,
            roaster.HasLogo ? $"/api/roasters/{request.Id}/logo" : null);
    }
}
