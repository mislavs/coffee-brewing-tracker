using System.Linq.Expressions;
using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Infrastructure.Persistence;

namespace CoffeeTracker.Application.Features.Beans.Queries;

public static class BeanSummaryProjection
{
    public static Expression<Func<Bean, BeanSummaryData>> ToData(ApplicationDbContext dbContext) => entity =>
        new BeanSummaryData(
            entity.Id,
            entity.Name,
            entity.Roaster.Name,
            entity.RoastProfile,
            entity.RoastDate,
            entity.BagWeight,
            entity.Price.HasValue && entity.BagWeight > 0
                ? entity.Price.Value / (entity.BagWeight / 1000m)
                : null,
            entity.ImageData != null,
            entity.IsAvailable,
            Math.Max(0m, entity.BagWeight - (dbContext.BrewLogEntries
                .Where(entry => entry.BeanId == entity.Id)
                .Sum(entry => (decimal?)entry.Dose) ?? 0m)));

    public static BeanSummaryDto ToDto(BeanSummaryData entity) =>
        new(
            entity.Id,
            entity.Name,
            entity.RoasterName,
            entity.RoastProfile,
            entity.RoastDate,
            entity.BagWeight,
            entity.PricePerKg,
            entity.HasImage,
            entity.HasImage ? $"/api/beans/{entity.Id}/image" : null,
            entity.IsAvailable,
            entity.RemainingQuantity);
}

public sealed record BeanSummaryData(
    Guid Id,
    string Name,
    string RoasterName,
    RoastProfile RoastProfile,
    DateOnly? RoastDate,
    decimal BagWeight,
    decimal? PricePerKg,
    bool HasImage,
    bool IsAvailable,
    decimal RemainingQuantity);
