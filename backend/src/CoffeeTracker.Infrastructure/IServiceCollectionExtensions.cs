using CoffeeTracker.Infrastructure.Persistence;
using CoffeeTracker.Infrastructure.AI;
using CoffeeTracker.Infrastructure.AI.Extraction;
using CoffeeTracker.Infrastructure.AI.Transcription;
using CoffeeTracker.Infrastructure.AI.Transcription.Providers.WhisperCpp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

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

        services.AddSingleton<IAudioTranscodingService, FfmpegAudioTranscodingService>();
        services.AddSingleton<SpeechToTextClientFactory>();
        services.AddSingleton<ChatClientFactory>();
        services.AddSingleton<DataExtractorFactory>();
        services.AddSingleton<IDataExtractor>(serviceProvider =>
            serviceProvider.GetRequiredService<DataExtractorFactory>().Create());

        services.AddSingleton<ISpeechToTextClient>(serviceProvider =>
        {
            var inner = serviceProvider.GetRequiredService<SpeechToTextClientFactory>().Create();
            if (inner is NullSpeechToTextClient)
            {
                return inner;
            }

            return inner
                .AsBuilder()
                .UseOpenTelemetry()
                .UseLogging()
                .Build(serviceProvider);
        });

        services.AddSingleton<IBrewLogExtractionService>(serviceProvider =>
        {
            var dataExtractor = serviceProvider.GetRequiredService<IDataExtractor>();
            if (dataExtractor is NullDataExtractor)
            {
                return new NullBrewLogExtractionService();
            }

            return ActivatorUtilities.CreateInstance<BrewLogExtractionService>(
                serviceProvider);
        });

        services.AddSingleton<IBeanImageExtractionService>(serviceProvider =>
        {
            var dataExtractor = serviceProvider.GetRequiredService<IDataExtractor>();
            if (dataExtractor is NullDataExtractor)
            {
                return new NullBeanImageExtractionService();
            }

            return ActivatorUtilities.CreateInstance<BeanImageExtractionService>(serviceProvider);
        });

        services.AddSingleton<IAiFeatureAvailability, AiFeatureAvailability>();

        return services;
    }
}
