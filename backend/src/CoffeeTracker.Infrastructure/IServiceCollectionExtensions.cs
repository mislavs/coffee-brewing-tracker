using CoffeeTracker.Infrastructure.Persistence;
using CoffeeTracker.Infrastructure.AI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddAiServices(configuration);

        return services;
    }

    private static IServiceCollection AddAiServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<AiSettings>()
            .Bind(configuration.GetSection(AiSettings.SectionName));

        services.AddSingleton<ISpeechToTextClient>(CreateSpeechToTextClient);
        services.AddSingleton<IBrewLogExtractionService>(CreateExtractionService);

        services.AddSingleton<IAiFeatureAvailability>(serviceProvider =>
        {
            var settings = serviceProvider.GetRequiredService<IOptions<AiSettings>>().Value;

            var isVoiceBrewLogParsingAvailable =
                IsImplementedTranscriptionProvider(settings.Transcription.Provider) &&
                IsImplementedExtractionProvider(settings.Extraction.Provider);

            return new AiFeatureAvailability(isVoiceBrewLogParsingAvailable);
        });

        return services;
    }

    private static ISpeechToTextClient CreateSpeechToTextClient(IServiceProvider serviceProvider)
    {
        var settings = serviceProvider.GetRequiredService<IOptions<AiSettings>>().Value;
        var provider = settings.Transcription.Provider;

        if (string.IsNullOrWhiteSpace(provider))
        {
            return new NullSpeechToTextClient();
        }

        var logger = serviceProvider.GetRequiredService<ILogger<NullSpeechToTextClient>>();

        if (IsKnownTranscriptionProvider(provider))
        {
            logger.LogWarning(
                "AI transcription provider '{Provider}' is configured but not implemented yet. Falling back to NullSpeechToTextClient.",
                provider);
        }
        else
        {
            logger.LogWarning(
                "Unsupported AI transcription provider '{Provider}'. Falling back to NullSpeechToTextClient.",
                provider);
        }

        return new NullSpeechToTextClient();
    }

    private static IBrewLogExtractionService CreateExtractionService(IServiceProvider serviceProvider)
    {
        var settings = serviceProvider.GetRequiredService<IOptions<AiSettings>>().Value;
        var provider = settings.Extraction.Provider;

        if (string.IsNullOrWhiteSpace(provider))
        {
            return new NullBrewLogExtractionService();
        }

        var logger = serviceProvider.GetRequiredService<ILogger<NullBrewLogExtractionService>>();

        if (IsKnownExtractionProvider(provider))
        {
            logger.LogWarning(
                "AI extraction provider '{Provider}' is configured but not implemented yet. Falling back to NullBrewLogExtractionService.",
                provider);
        }
        else
        {
            logger.LogWarning(
                "Unsupported AI extraction provider '{Provider}'. Falling back to NullBrewLogExtractionService.",
                provider);
        }

        return new NullBrewLogExtractionService();
    }

    private static bool IsKnownTranscriptionProvider(string provider) =>
        provider.Equals("WhisperCpp", StringComparison.OrdinalIgnoreCase) ||
        provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase);

    private static bool IsKnownExtractionProvider(string provider) =>
        provider.Equals("OpenRouter", StringComparison.OrdinalIgnoreCase) ||
        provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase);

    // Step 1 keeps only null implementations; real providers are enabled in later steps.
    private static bool IsImplementedTranscriptionProvider(string? _) => false;

    // Step 1 keeps only null implementations; real providers are enabled in later steps.
    private static bool IsImplementedExtractionProvider(string? _) => false;
}
