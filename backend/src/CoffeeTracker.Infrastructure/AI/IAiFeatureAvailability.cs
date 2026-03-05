namespace CoffeeTracker.Infrastructure.AI;

public interface IAiFeatureAvailability
{
    bool IsImageBeanParsingAvailable { get; }

    bool IsVoiceBrewLogParsingAvailable { get; }
}
