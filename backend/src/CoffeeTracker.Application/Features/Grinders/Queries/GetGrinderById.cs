using CoffeeTracker.Application.Features.Grinders.Dtos;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Grinders.Queries;

public sealed record GetGrinderByIdQuery(Guid Id) : IRequest<GrinderDto>;

public sealed class GetGrinderByIdHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetGrinderByIdQuery, GrinderDto>
{
    public async Task<GrinderDto> Handle(GetGrinderByIdQuery request, CancellationToken cancellationToken)
    {
        var grinder = await dbContext.Grinders
            .AsNoTracking()
            .Where(entity => entity.Id == request.Id)
            .Select(entity => new { entity.Id, entity.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (grinder is null)
        {
            throw new NotFoundException($"Grinder '{request.Id}' was not found.");
        }

        var brewStats = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entity => entity.GrinderId == request.Id)
            .Select(entity => new
            {
                entity.Dose,
                entity.GrindSize,
                Rating = entity.Rating.HasValue ? (int?)entity.Rating.Value : null
            })
            .ToListAsync(cancellationToken);

        var totalBrews = brewStats.Count;
        var totalCoffeeGround = brewStats.Sum(entity => entity.Dose);

        var grindSettings = brewStats
            .Where(entity => entity.GrindSize.HasValue)
            .Select(entity => entity.GrindSize!.Value)
            .ToList();

        decimal? mostCommonGrindSetting = grindSettings.Count == 0
            ? null
            : grindSettings
                .GroupBy(setting => setting)
                .OrderByDescending(group => group.Count())
                .ThenBy(group => group.Key)
                .Select(group => group.Key)
                .First();

        decimal? grindSettingMin = grindSettings.Count == 0
            ? null
            : grindSettings.Min();

        decimal? grindSettingMax = grindSettings.Count == 0
            ? null
            : grindSettings.Max();

        var bestRatedGrindSetting = brewStats
            .Where(entity => entity.GrindSize.HasValue && entity.Rating.HasValue)
            .GroupBy(entity => entity.GrindSize!.Value)
            .Select(group => new
            {
                GrindSize = group.Key,
                AverageRating = group.Average(entity => entity.Rating!.Value)
            })
            .OrderByDescending(group => group.AverageRating)
            .ThenBy(group => group.GrindSize)
            .Select(group => group.GrindSize)
            .Cast<decimal?>()
            .FirstOrDefault();

        return new GrinderDto(
            grinder.Id,
            grinder.Name,
            totalBrews,
            totalCoffeeGround,
            mostCommonGrindSetting,
            grindSettingMin,
            grindSettingMax,
            bestRatedGrindSetting);
    }
}
