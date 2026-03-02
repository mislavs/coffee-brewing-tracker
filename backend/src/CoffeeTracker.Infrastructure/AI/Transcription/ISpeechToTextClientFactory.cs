using Microsoft.Extensions.AI;

namespace CoffeeTracker.Infrastructure.AI.Transcription;

public interface ISpeechToTextClientFactory
{
    ISpeechToTextClient Create();
}
