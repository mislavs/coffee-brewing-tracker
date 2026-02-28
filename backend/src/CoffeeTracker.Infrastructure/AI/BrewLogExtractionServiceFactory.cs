using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using System.ClientModel;

namespace CoffeeTracker.Infrastructure.AI;

public sealed class BrewLogExtractionServiceFactory(
    IOptions<AiSettings> _aiSettings,
    ILogger<BrewLogExtractionServiceFactory> _logger,
    ILogger<BrewLogExtractionService> _extractionLogger) : IBrewLogExtractionServiceFactory
{
    public IBrewLogExtractionService Create()
    {
        var settings = _aiSettings.Value;
        var provider = settings.Extraction.Provider;

        if (string.IsNullOrWhiteSpace(provider))
        {
            return new NullBrewLogExtractionService();
        }

        if (provider.Equals(AiProviders.Extraction.OpenRouter, StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(settings.Extraction.ApiKey) ||
                string.IsNullOrWhiteSpace(settings.Extraction.Model))
            {
                _logger.LogWarning(
                    "OpenRouter extraction provider requires AI:Extraction:ApiKey and AI:Extraction:Model. Falling back to NullBrewLogExtractionService.");
                return new NullBrewLogExtractionService();
            }

            var endpoint = GetOpenRouterEndpoint(settings.Extraction.Endpoint);
            var openAiClient = new OpenAIClient(
                new ApiKeyCredential(settings.Extraction.ApiKey),
                new OpenAIClientOptions
                {
                    Endpoint = endpoint
                });

            var chatClient = openAiClient.GetChatClient(settings.Extraction.Model).AsIChatClient();
            return new BrewLogExtractionService(chatClient, _extractionLogger);
        }

        if (IsKnownExtractionProvider(provider))
        {
            _logger.LogWarning(
                "AI extraction provider '{Provider}' is known but not implemented yet. Falling back to NullBrewLogExtractionService.",
                provider);
        }
        else
        {
            _logger.LogWarning(
                "Unsupported AI extraction provider '{Provider}'. Falling back to NullBrewLogExtractionService.",
                provider);
        }

        return new NullBrewLogExtractionService();
    }

    private static bool IsKnownExtractionProvider(string provider) =>
        provider.Equals(AiProviders.Extraction.OpenRouter, StringComparison.OrdinalIgnoreCase) ||
        provider.Equals(AiProviders.Extraction.OpenAi, StringComparison.OrdinalIgnoreCase);

    private static Uri GetOpenRouterEndpoint(string? configuredEndpoint)
    {
        var endpoint = string.IsNullOrWhiteSpace(configuredEndpoint)
            ? AiProviderDefaults.OpenRouterEndpoint
            : configuredEndpoint;

        if (!Uri.TryCreate(endpoint, UriKind.Absolute, out var uri))
        {
            throw new InvalidOperationException(
                $"AI:Extraction:Endpoint '{endpoint}' is not a valid absolute URI.");
        }

        return uri;
    }
}
