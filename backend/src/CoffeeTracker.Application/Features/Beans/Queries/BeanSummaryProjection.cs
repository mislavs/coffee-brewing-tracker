using System.Linq.Expressions;
using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Domain.Entities;

namespace CoffeeTracker.Application.Features.Beans.Queries;

public static class BeanSummaryProjection
{
    public static readonly Expression<Func<Bean, BeanSummaryDto>> ToDto = entity =>
        new BeanSummaryDto(
            entity.Id,
            entity.Name,
            entity.Roaster.Name,
            entity.RoastProfile,
            entity.BagWeight,
            entity.Price.HasValue && entity.BagWeight > 0
                ? entity.Price.Value / (entity.BagWeight / 1000m)
                : null);
}
