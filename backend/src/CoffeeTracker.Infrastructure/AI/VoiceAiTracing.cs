using System.Diagnostics;

namespace CoffeeTracker.Infrastructure.AI;

internal static class VoiceAiTracing
{
    internal const string ActivitySourceName = "CoffeeTracker.Infrastructure.AI";
    internal static readonly ActivitySource ActivitySource = new(ActivitySourceName);
}
