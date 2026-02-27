using Microsoft.Extensions.AI;

namespace CoffeeTracker.Infrastructure.AI;

public interface ISpeechToTextClientFactory
{
    ISpeechToTextClient Create();
}
