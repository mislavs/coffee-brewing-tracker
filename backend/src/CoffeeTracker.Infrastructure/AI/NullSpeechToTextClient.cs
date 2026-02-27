using Microsoft.Extensions.AI;
using System.Runtime.CompilerServices;

namespace CoffeeTracker.Infrastructure.AI;

public sealed class NullSpeechToTextClient : ISpeechToTextClient
{
    public void Dispose()
    {
    }

    public Task<SpeechToTextResponse> GetTextAsync(
        Stream audioSpeechStream,
        SpeechToTextOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(audioSpeechStream);
        return Task.FromResult(new SpeechToTextResponse(string.Empty));
    }

    public IAsyncEnumerable<SpeechToTextResponseUpdate> GetStreamingTextAsync(
        Stream audioSpeechStream,
        SpeechToTextOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(audioSpeechStream);
        return EmptyResponse(cancellationToken);
    }

    public object? GetService(Type serviceType, object? serviceKey = null)
    {
        ArgumentNullException.ThrowIfNull(serviceType);
        return serviceKey is null && serviceType.IsInstanceOfType(this) ? this : null;
    }

    private static async IAsyncEnumerable<SpeechToTextResponseUpdate> EmptyResponse(
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        yield break;
    }
}
