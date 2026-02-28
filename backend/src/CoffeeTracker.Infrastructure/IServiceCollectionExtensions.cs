using CoffeeTracker.Infrastructure.Persistence;
using CoffeeTracker.Infrastructure.AI;
using CoffeeTracker.Infrastructure.AI.WhisperCpp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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

        services.AddSingleton<ISpeechToTextClientFactory, SpeechToTextClientFactory>();
        services.AddSingleton<ISpeechToTextClient>(serviceProvider =>
        {
            var inner = serviceProvider.GetRequiredService<ISpeechToTextClientFactory>().Create();
            return ActivatorUtilities.CreateInstance<TimedSpeechToTextClient>(serviceProvider, inner);
        });
            
        services.AddSingleton<IBrewLogExtractionServiceFactory, BrewLogExtractionServiceFactory>();
        services.AddSingleton<IBrewLogExtractionService>(serviceProvider =>
        {
            var inner = serviceProvider.GetRequiredService<IBrewLogExtractionServiceFactory>().Create();
            return ActivatorUtilities.CreateInstance<TimedBrewLogExtractionService>(serviceProvider, inner);
        });

        services.AddSingleton<IAiFeatureAvailability, AiFeatureAvailability>();

        return services;
    }

}
