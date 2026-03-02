using FluentValidation;

namespace CoffeeTracker.Application.Features.BrewLog.Commands.ParseVoiceBrewLog;

public sealed class ParseVoiceBrewLogValidator : AbstractValidator<ParseVoiceBrewLogCommand>
{
    public ParseVoiceBrewLogValidator()
    {
        RuleFor(command => command.AudioStream)
            .NotNull();
    }
}
