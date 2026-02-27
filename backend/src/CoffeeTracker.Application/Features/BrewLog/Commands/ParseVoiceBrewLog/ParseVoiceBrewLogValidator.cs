using FluentValidation;

namespace CoffeeTracker.Application.Features.BrewLog.Commands.ParseVoiceBrewLog;

public sealed class ParseVoiceBrewLogValidator : AbstractValidator<ParseVoiceBrewLogCommand>
{
    private static readonly HashSet<string> SupportedAudioMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "audio/webm",
        "audio/ogg",
        "audio/wav",
        "audio/mp4",
        "audio/mpeg"
    };

    public ParseVoiceBrewLogValidator()
    {
        RuleFor(command => command.AudioStream)
            .NotNull();

        RuleFor(command => command.ContentType)
            .NotEmpty()
            .Must(contentType => SupportedAudioMimeTypes.Contains(contentType))
            .WithMessage("Unsupported audio MIME type.");
    }
}
