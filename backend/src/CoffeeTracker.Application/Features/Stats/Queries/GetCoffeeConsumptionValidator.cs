using FluentValidation;

namespace CoffeeTracker.Application.Features.Stats.Queries;

public sealed class GetCoffeeConsumptionValidator : AbstractValidator<GetCoffeeConsumptionQuery>
{
    private const int MaximumRangeDays = 366;

    public GetCoffeeConsumptionValidator()
    {
        RuleFor(query => query.To)
            .GreaterThanOrEqualTo(query => query.From)
            .WithMessage("The end date must be on or after the start date.");

        RuleFor(query => query.To)
            .NotEqual(DateOnly.MaxValue)
            .WithMessage("The end date is outside the supported range.")
            .Must((query, to) =>
                to < query.From ||
                to.DayNumber - query.From.DayNumber + 1 <= MaximumRangeDays)
            .WithMessage($"The date range cannot exceed {MaximumRangeDays} days.");

        RuleFor(query => query.Granularity)
            .IsInEnum();

        RuleFor(query => query.TimeZone)
            .NotEmpty()
            .Must(BeValidTimeZone)
            .WithMessage("The time zone is not recognized.");
    }

    private static bool BeValidTimeZone(string timeZoneId)
    {
        if (string.IsNullOrWhiteSpace(timeZoneId))
        {
            return false;
        }

        try
        {
            _ = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return true;
        }
        catch (TimeZoneNotFoundException)
        {
            return false;
        }
        catch (InvalidTimeZoneException)
        {
            return false;
        }
    }
}
