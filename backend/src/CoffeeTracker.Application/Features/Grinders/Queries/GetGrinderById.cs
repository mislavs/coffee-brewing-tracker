using System.Globalization;
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
            .Where(entity => !string.IsNullOrWhiteSpace(entity.GrindSize))
            .Select(entity => entity.GrindSize!)
            .ToList();

        var mostCommonGrindSetting = grindSettings
            .GroupBy(setting => setting, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key, StringComparer.OrdinalIgnoreCase)
            .Select(group => group.First())
            .FirstOrDefault();

        var grindSettingMin = grindSettings
            .OrderBy(setting => decimal.TryParse(setting, CultureInfo.InvariantCulture, out var v) ? v : decimal.MaxValue)
            .FirstOrDefault();

        var grindSettingMax = grindSettings
            .OrderByDescending(setting => decimal.TryParse(setting, CultureInfo.InvariantCulture, out var v) ? v : decimal.MinValue)
            .FirstOrDefault();

        var bestRatedGrindSetting = brewStats
            .Where(entity => !string.IsNullOrWhiteSpace(entity.GrindSize) && entity.Rating.HasValue)
            .GroupBy(entity => entity.GrindSize!, StringComparer.OrdinalIgnoreCase)
            .Select(group => new
            {
                GrindSize = group.First().GrindSize!,
                AverageRating = group.Average(entity => entity.Rating!.Value)
            })
            .OrderByDescending(group => group.AverageRating)
            .ThenBy(group => group.GrindSize, StringComparer.OrdinalIgnoreCase)
            .Select(group => group.GrindSize)
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
