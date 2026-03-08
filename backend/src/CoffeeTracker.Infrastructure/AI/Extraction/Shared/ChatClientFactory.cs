using CoffeeTracker.Infrastructure.AI;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using System.ClientModel;

namespace CoffeeTracker.Infrastructure.AI.Extraction.Shared;

public sealed class ChatClientFactory(
    IOptions<AiSettings> aiSettings,
    ILogger<ChatClientFactory> logger)
{
    public readonly record struct ExtractionAvailability(bool IsAvailable);

    public ExtractionAvailability GetAvailability() =>
        new(TryResolveOpenRouterConfiguration(logFailures: false, out _));

    public IChatClient? Create()
    {
        if (!TryResolveOpenRouterConfiguration(logFailures: true, out var configuration))
        {
            return null;
        }

        var openAiClient = new OpenAIClient(
            new ApiKeyCredential(configuration.ApiKey),
            new OpenAIClientOptions
            {
                Endpoint = configuration.Endpoint
            });

        return openAiClient
            .GetChatClient(configuration.Model)
            .AsIChatClient();
    }

    private bool TryResolveOpenRouterConfiguration(
        bool logFailures,
        out OpenRouterConfiguration configuration)
    {
        var settings = aiSettings.Value;
        var provider = settings.Extraction.Provider;

        if (string.IsNullOrWhiteSpace(provider))
        {
            configuration = default;
            return false;
        }

        if (provider.Equals(AiProviders.Extraction.OpenRouter, StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(settings.Extraction.ApiKey) ||
                string.IsNullOrWhiteSpace(settings.Extraction.Model))
            {
                if (logFailures)
                {
                    logger.LogWarning(
                        "OpenRouter extraction provider requires AI:Extraction:ApiKey and AI:Extraction:Model. Falling back to null extraction features.");
                }

                configuration = default;
                return false;
            }

            if (!TryGetOpenRouterEndpoint(settings.Extraction.Endpoint, out var endpoint))
            {
                if (logFailures)
                {
                    logger.LogWarning(
                        "AI:Extraction:Endpoint '{Endpoint}' is not a valid absolute URI. Falling back to null extraction features.",
                        settings.Extraction.Endpoint ?? AiProviderDefaults.OpenRouterEndpoint);
                }

                configuration = default;
                return false;
            }

            configuration = new OpenRouterConfiguration(
                settings.Extraction.ApiKey,
                settings.Extraction.Model,
                endpoint);

            return true;
        }

        if (IsKnownExtractionProvider(provider))
        {
            if (logFailures)
            {
                logger.LogWarning(
                    "AI extraction provider '{Provider}' is known but not implemented yet. Falling back to null extraction features.",
                    provider);
            }
        }
        else
        {
            if (logFailures)
            {
                logger.LogWarning(
                    "Unsupported AI extraction provider '{Provider}'. Falling back to null extraction features.",
                    provider);
            }
        }

        configuration = default;
        return false;
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

    private readonly record struct OpenRouterConfiguration(
        string ApiKey,
        string Model,
        Uri Endpoint);
}
