using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;

namespace CoffeeTracker.Infrastructure.AI.Extraction.Shared;

public sealed class DataExtractorFactory(
    ChatClientFactory chatClientFactory,
    IServiceProvider serviceProvider,
    ILoggerFactory loggerFactory)
{
    public IDataExtractor Create()
    {
        var chatClient = chatClientFactory.Create();
        if (chatClient is null)
        {
            return new NullDataExtractor();
        }

        var wrapped = chatClient
            .AsBuilder()
            .UseOpenTelemetry()
            .UseLogging()
            .Build(serviceProvider);

        var extractorLogger = loggerFactory.CreateLogger<LlmDataExtractor>();
        return new LlmDataExtractor(wrapped, extractorLogger);
    }
}
