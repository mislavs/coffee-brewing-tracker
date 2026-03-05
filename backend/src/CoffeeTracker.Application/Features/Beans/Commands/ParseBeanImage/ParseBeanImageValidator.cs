using FluentValidation;

namespace CoffeeTracker.Application.Features.Beans.Commands.ParseBeanImage;

public sealed class ParseBeanImageValidator : AbstractValidator<ParseBeanImageCommand>
{
    public ParseBeanImageValidator()
    {
        RuleFor(command => command.ImageStream)
            .NotNull();

        RuleFor(command => command.ContentType)
            .NotEmpty();
    }
}
