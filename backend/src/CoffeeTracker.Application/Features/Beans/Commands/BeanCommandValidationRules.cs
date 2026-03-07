using CoffeeTracker.Domain.Enums;
using FluentValidation;

namespace CoffeeTracker.Application.Features.Beans.Commands;

/// <summary>
/// Shared validation rules for bean create/update commands.
/// </summary>
public interface IBeanCommand
{
    string Name { get; }
    Guid RoasterId { get; }
    OriginType OriginType { get; }
    IReadOnlyList<Guid>? OriginCountryIds { get; }
    string? Variety { get; }
    string? ProcessingMethod { get; }
    RoastProfile RoastProfile { get; }
    DateOnly? RoastDate { get; }
    int? Altitude { get; }
    decimal BagWeight { get; }
    decimal? Price { get; }
    IReadOnlyList<string>? FlavorNoteNames { get; }
}

public sealed class BeanCommandValidationRules<T> : AbstractValidator<T>
    where T : class, IBeanCommand
{
    public BeanCommandValidationRules()
    {
        RuleFor(c => c.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(c => c.RoasterId)
            .NotEmpty();

        RuleFor(c => c.OriginType)
            .IsInEnum();

        RuleFor(c => c.RoastProfile)
            .IsInEnum();

        RuleFor(c => c.Variety)
            .MaximumLength(200);

        RuleFor(c => c.ProcessingMethod)
            .MaximumLength(200);

        RuleFor(c => c.BagWeight)
            .GreaterThan(0);

        RuleFor(c => c.Price)
            .GreaterThanOrEqualTo(0)
            .When(c => c.Price.HasValue);

        RuleFor(c => c.Altitude)
            .GreaterThan(0)
            .When(c => c.Altitude.HasValue);

        RuleForEach(c => c.OriginCountryIds!)
            .NotEmpty()
            .When(c => c.OriginCountryIds is not null);

        RuleForEach(c => c.FlavorNoteNames!)
            .NotEmpty()
            .MaximumLength(100)
            .When(c => c.FlavorNoteNames is not null);
    }
}
