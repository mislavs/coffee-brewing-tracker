using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using System.ClientModel;

namespace CoffeeTracker.Infrastructure.AI.Extraction;

public sealed class ChatClientFactory(
    IOptions<AiSettings> aiSettings,
    ILogger<ChatClientFactory> logger)
{
    public IChatClient? Create()
    {
        var settings = aiSettings.Value;
        var provider = settings.Extraction.Provider;

        if (string.IsNullOrWhiteSpace(provider))
        {
            return null;
        }

        if (provider.Equals(AiProviders.Extraction.OpenRouter, StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(settings.Extraction.ApiKey) ||
                string.IsNullOrWhiteSpace(settings.Extraction.Model))
            {
                logger.LogWarning(
                    "OpenRouter extraction provider requires AI:Extraction:ApiKey and AI:Extraction:Model. Falling back to NullBrewLogExtractionService.");
                return null;
            }

            if (!TryGetOpenRouterEndpoint(settings.Extraction.Endpoint, out var endpoint))
            {
                logger.LogWarning(
                    "AI:Extraction:Endpoint '{Endpoint}' is not a valid absolute URI. Falling back to NullBrewLogExtractionService.",
                    settings.Extraction.Endpoint ?? AiProviderDefaults.OpenRouterEndpoint);
                return null;
            }

            var openAiClient = new OpenAIClient(
                new ApiKeyCredential(settings.Extraction.ApiKey),
                new OpenAIClientOptions
                {
                    Endpoint = endpoint
                });

            return openAiClient
                .GetChatClient(settings.Extraction.Model)
                .AsIChatClient();
        }

        if (IsKnownExtractionProvider(provider))
        {
            logger.LogWarning(
                "AI extraction provider '{Provider}' is known but not implemented yet. Falling back to NullBrewLogExtractionService.",
                provider);
        }
        else
        {
            logger.LogWarning(
                "Unsupported AI extraction provider '{Provider}'. Falling back to NullBrewLogExtractionService.",
                provider);
        }

        return null;
    }

    private static bool IsKnownExtractionProvider(string provider) =>
        provider.Equals(AiProviders.Extraction.OpenRouter, StringComparison.OrdinalIgnoreCase) ||
        provider.Equals(AiProviders.Extraction.OpenAi, StringComparison.OrdinalIgnoreCase);

    private static bool TryGetOpenRouterEndpoint(string? configuredEndpoint, out Uri endpoint)
    {
        var endpointText = string.IsNullOrWhiteSpace(configuredEndpoint)
            ? AiProviderDefaults.OpenRouterEndpoint
            : configuredEndpoint;

        if (Uri.TryCreate(endpointText, UriKind.Absolute, out var parsedEndpoint) &&
            parsedEndpoint is not null)
        {
            endpoint = parsedEndpoint;
            return true;
        }

        endpoint = null!;
        return false;
    }
}
