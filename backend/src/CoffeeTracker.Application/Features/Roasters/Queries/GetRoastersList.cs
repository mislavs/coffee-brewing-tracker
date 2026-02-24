using CoffeeTracker.Application.Features.Roasters.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Queries;

public sealed record GetRoastersListQuery : IRequest<IReadOnlyList<RoasterSummaryDto>>;

public sealed class GetRoastersListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetRoastersListQuery, IReadOnlyList<RoasterSummaryDto>>
{
    public async Task<IReadOnlyList<RoasterSummaryDto>> Handle(
        GetRoastersListQuery request,
        CancellationToken cancellationToken)
    {
        var roasters = await dbContext.Roasters
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new
            {
                entity.Id,
                entity.Name,
                entity.City,
                entity.CountryId,
                CountryName = entity.Country != null ? entity.Country.Name : null,
                BeanCount = entity.Beans.Count(),
                AvgPricePerKg = entity.Beans
                    .Where(bean => bean.Price.HasValue && bean.BagWeight > 0)
                    .Select(bean => (decimal?)(bean.Price!.Value / (bean.BagWeight / 1000m)))
                    .Average(),
                HasLogo = entity.LogoData != null
            })
            .ToListAsync(cancellationToken);

        return roasters
            .Select(entity => new RoasterSummaryDto(
                entity.Id,
                entity.Name,
                entity.City,
                entity.CountryId,
                entity.CountryName,
                entity.BeanCount,
                entity.AvgPricePerKg,
                entity.HasLogo,
                entity.HasLogo ? $"/api/roasters/{entity.Id}/logo" : null))
            .ToList();
    }
}
