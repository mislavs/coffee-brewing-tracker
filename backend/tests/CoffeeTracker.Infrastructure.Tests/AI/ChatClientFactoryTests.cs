using CoffeeTracker.Infrastructure.AI;
using CoffeeTracker.Infrastructure.AI.Extraction.Shared;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class ChatClientFactoryTests
{
    [Fact]
    public void GetAvailability_WhenProviderIsMissing_ReturnsUnavailable()
    {
        // Arrange
        var sut = CreateFactory(provider: null);

        // Act
        var availability = sut.GetAvailability();

        // Assert
        availability.IsAvailable.Should().BeFalse();
    }

    [Fact]
    public void Create_WhenOpenRouterApiKeyIsMissing_ReturnsNull()
    {
        // Arrange
        var sut = CreateFactory(
            provider: AiProviders.Extraction.OpenRouter,
            apiKey: null,
            model: "model");

        // Act
        var chatClient = sut.Create();

        // Assert
        chatClient.Should().BeNull();
    }

    [Fact]
    public void Create_WhenOpenRouterModelIsMissing_ReturnsNull()
    {
        // Arrange
        var sut = CreateFactory(
            provider: AiProviders.Extraction.OpenRouter,
            apiKey: "key",
            model: null);

        // Act
        var chatClient = sut.Create();

        // Assert
        chatClient.Should().BeNull();
    }

    [Fact]
    public void Create_WhenOpenRouterEndpointIsInvalid_ReturnsNull()
    {
        // Arrange
        var sut = CreateFactory(
            provider: AiProviders.Extraction.OpenRouter,
            apiKey: "key",
            model: "model",
            endpoint: "not-a-valid-uri");

        // Act
        var chatClient = sut.Create();

        // Assert
        chatClient.Should().BeNull();
    }

    [Fact]
    public void Create_WhenProviderIsKnownButNotImplemented_ReturnsNull()
    {
        // Arrange
        var sut = CreateFactory(provider: AiProviders.Extraction.OpenAi);

        // Act
        var chatClient = sut.Create();

        // Assert
        chatClient.Should().BeNull();
    }

    [Fact]
    public void Create_WhenProviderIsUnknown_ReturnsNull()
    {
        // Arrange
        var sut = CreateFactory(provider: "UnknownProvider");

        // Act
        var chatClient = sut.Create();

        // Assert
        chatClient.Should().BeNull();
    }

    [Fact]
    public void Create_WhenOpenRouterEndpointNotConfigured_UsesDefaultEndpointAndReturnsClient()
    {
        // Arrange
        var sut = CreateFactory(
            provider: AiProviders.Extraction.OpenRouter,
            apiKey: "key",
            model: "model",
            endpoint: null);

        // Act
        var chatClient = sut.Create();

        // Assert
        chatClient.Should().NotBeNull();
    }

    private static ChatClientFactory CreateFactory(
        string? provider = AiProviders.Extraction.OpenRouter,
        string? apiKey = "key",
        string? model = "model",
        string? endpoint = "https://openrouter.ai/api/v1")
    {
        var options = Options.Create(new AiSettings
        {
            Extraction = new ExtractionSettings
            {
                Provider = provider,
                ApiKey = apiKey,
                Model = model,
                Endpoint = endpoint
            }
        });

        return new ChatClientFactory(options, NullLogger<ChatClientFactory>.Instance);
    }
}
