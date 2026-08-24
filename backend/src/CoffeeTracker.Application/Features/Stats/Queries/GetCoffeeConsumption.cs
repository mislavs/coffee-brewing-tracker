using CoffeeTracker.Application.Features.Stats.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Stats.Queries;

public sealed record GetCoffeeConsumptionQuery(
    DateOnly From,
    DateOnly To,
    CoffeeConsumptionGranularity Granularity,
    string TimeZone) : IRequest<CoffeeConsumptionSeriesDto>;

public sealed class GetCoffeeConsumptionHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetCoffeeConsumptionQuery, CoffeeConsumptionSeriesDto>
{
    public async Task<CoffeeConsumptionSeriesDto> Handle(
        GetCoffeeConsumptionQuery request,
        CancellationToken cancellationToken)
    {
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(request.TimeZone);
        var rangeStartUtc = ConvertLocalDateToUtc(request.From, timeZone);
        var rangeEndUtc = ConvertLocalDateToUtc(request.To.AddDays(1), timeZone);

        var brews = await dbContext.BrewLogEntries
            .AsNoTracking()
            .Where(entry => entry.BrewedAt >= rangeStartUtc && entry.BrewedAt < rangeEndUtc)
            .Select(entry => new CoffeeConsumptionRecord(entry.BrewedAt, entry.Dose))
            .ToListAsync(cancellationToken);

        var consumptionByBucket = brews
            .GroupBy(brew => GetBucketStart(GetLocalDate(brew.BrewedAt, timeZone), request.Granularity))
            .ToDictionary(
                group => group.Key,
                group => new BucketTotals(group.Sum(brew => brew.Dose), group.Count()));

        var today = GetLocalDate(DateTime.UtcNow, timeZone);
        var buckets = CreateBuckets(request, consumptionByBucket, today);

        return new CoffeeConsumptionSeriesDto(
            request.From,
            request.To,
            request.Granularity,
            request.TimeZone,
            brews.Sum(brew => brew.Dose),
            brews.Count,
            buckets);
    }

    private static IReadOnlyList<CoffeeConsumptionBucketDto> CreateBuckets(
        GetCoffeeConsumptionQuery request,
        IReadOnlyDictionary<DateOnly, BucketTotals> consumptionByBucket,
        DateOnly today)
    {
        var buckets = new List<CoffeeConsumptionBucketDto>();
        var bucketStart = GetBucketStart(request.From, request.Granularity);

        while (bucketStart <= request.To)
        {
            var nextBucketStart = GetNextBucketStart(bucketStart, request.Granularity);
            var bucketEnd = nextBucketStart.AddDays(-1);
            var visibleStart = bucketStart < request.From ? request.From : bucketStart;
            var visibleEnd = bucketEnd > request.To ? request.To : bucketEnd;
            var totals = consumptionByBucket.GetValueOrDefault(bucketStart);
            var isPartial = visibleStart != bucketStart || visibleEnd != bucketEnd || bucketEnd >= today;

            buckets.Add(new CoffeeConsumptionBucketDto(
                visibleStart,
                visibleEnd,
                totals?.ConsumedGrams ?? 0m,
                totals?.BrewCount ?? 0,
                isPartial));

            bucketStart = nextBucketStart;
        }

        return buckets;
    }

    private static DateOnly GetBucketStart(
        DateOnly date,
        CoffeeConsumptionGranularity granularity) => granularity switch
        {
            CoffeeConsumptionGranularity.Daily => date,
            CoffeeConsumptionGranularity.Weekly => date.AddDays(-GetDaysSinceMonday(date.DayOfWeek)),
            CoffeeConsumptionGranularity.Monthly => new DateOnly(date.Year, date.Month, 1),
            _ => throw new ArgumentOutOfRangeException(nameof(granularity), granularity, null)
        };

    private static DateOnly GetNextBucketStart(
        DateOnly bucketStart,
        CoffeeConsumptionGranularity granularity) => granularity switch
        {
            CoffeeConsumptionGranularity.Daily => bucketStart.AddDays(1),
            CoffeeConsumptionGranularity.Weekly => bucketStart.AddDays(7),
            CoffeeConsumptionGranularity.Monthly => bucketStart.AddMonths(1),
            _ => throw new ArgumentOutOfRangeException(nameof(granularity), granularity, null)
        };

    private static int GetDaysSinceMonday(DayOfWeek dayOfWeek) =>
        ((int)dayOfWeek + 6) % 7;

    private static DateTime ConvertLocalDateToUtc(DateOnly date, TimeZoneInfo timeZone)
    {
        var localDateTime = DateTime.SpecifyKind(
            date.ToDateTime(TimeOnly.MinValue),
            DateTimeKind.Unspecified);

        return TimeZoneInfo.ConvertTimeToUtc(localDateTime, timeZone);
    }

    private static DateOnly GetLocalDate(DateTime utcDateTime, TimeZoneInfo timeZone)
    {
        var normalizedUtc = utcDateTime.Kind == DateTimeKind.Utc
            ? utcDateTime
            : DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);

        return DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(normalizedUtc, timeZone));
    }

    private sealed record CoffeeConsumptionRecord(DateTime BrewedAt, decimal Dose);

    private sealed record BucketTotals(decimal ConsumedGrams, int BrewCount);
}
