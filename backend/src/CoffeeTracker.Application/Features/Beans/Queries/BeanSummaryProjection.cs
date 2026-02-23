using System.Linq.Expressions;
using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Infrastructure.Persistence;

namespace CoffeeTracker.Application.Features.Beans.Queries;

public static class BeanSummaryProjection
{
    public static Expression<Func<Bean, BeanSummaryDto>> ToDto(ApplicationDbContext dbContext) => entity =>
        new BeanSummaryDto(
            entity.Id,
            entity.Name,
            entity.Roaster.Name,
            entity.RoastProfile,
            entity.BagWeight,
            entity.Price.HasValue && entity.BagWeight > 0
                ? entity.Price.Value / (entity.BagWeight / 1000m)
                : null,
            entity.BagWeight - (dbContext.BrewLogEntries
                .Where(entry => entry.BeanId == entity.Id)
                .Sum(entry => (decimal?)entry.Dose) ?? 0m));
}
