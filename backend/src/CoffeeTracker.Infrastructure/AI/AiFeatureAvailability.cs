namespace CoffeeTracker.Infrastructure.AI;

public sealed class AiFeatureAvailability(bool isVoiceBrewLogParsingAvailable) : IAiFeatureAvailability
{
    public bool IsVoiceBrewLogParsingAvailable { get; } = isVoiceBrewLogParsingAvailable;
}
