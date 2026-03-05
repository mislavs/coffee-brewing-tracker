using CoffeeTracker.Infrastructure.AI;
using CoffeeTracker.Infrastructure.AI.Extraction;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class DataExtractorFactoryTests
{
    [Fact]
    public void Create_WhenChatClientFactoryReturnsNull_ReturnsNullDataExtractor()
    {
        // Arrange
        var chatClientFactory = new ChatClientFactory(
            Options.Create(new AiSettings
            {
                Extraction = new ExtractionSettings
                {
                    Provider = null
                }
            }),
            LoggerFactory.Create(builder => { }).CreateLogger<ChatClientFactory>());

        var serviceProvider = new ServiceCollection().BuildServiceProvider();
        var loggerFactory = LoggerFactory.Create(builder => { });
        var sut = new DataExtractorFactory(chatClientFactory, serviceProvider, loggerFactory);

        // Act
        var extractor = sut.Create();

        // Assert
        extractor.Should().BeOfType<NullDataExtractor>();
    }
}
