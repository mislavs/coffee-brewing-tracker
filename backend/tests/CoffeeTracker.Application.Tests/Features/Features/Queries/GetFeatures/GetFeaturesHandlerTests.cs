using CoffeeTracker.Application.Features.Features.Queries.GetFeatures;
using CoffeeTracker.Infrastructure.AI;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Features.Queries.GetFeatures;

public class GetFeaturesHandlerTests
{
    [Fact]
    public async Task Handle_WhenVoiceBrewLogParsingIsUnavailable_ReturnsFeatureAsDisabled()
    {
        // Arrange
        var handler = new GetFeaturesHandler(new StubAiFeatureAvailability(false, false));

        // Act
        var result = await handler.Handle(new GetFeaturesQuery(), TestContext.Current.CancellationToken);

        // Assert
        result.VoiceBrewLogParsing.Should().BeFalse();
        result.ImageBeanParsing.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WhenVoiceBrewLogParsingIsAvailable_ReturnsFeatureAsEnabled()
    {
        // Arrange
        var handler = new GetFeaturesHandler(new StubAiFeatureAvailability(true, true));

        // Act
        var result = await handler.Handle(new GetFeaturesQuery(), TestContext.Current.CancellationToken);

        // Assert
        result.VoiceBrewLogParsing.Should().BeTrue();
        result.ImageBeanParsing.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WhenOnlyImageBeanParsingIsAvailable_ReturnsMixedFlags()
    {
        // Arrange
        var handler = new GetFeaturesHandler(new StubAiFeatureAvailability(false, true));

        // Act
        var result = await handler.Handle(new GetFeaturesQuery(), TestContext.Current.CancellationToken);

        // Assert
        result.VoiceBrewLogParsing.Should().BeFalse();
        result.ImageBeanParsing.Should().BeTrue();
    }

    private sealed class StubAiFeatureAvailability(
        bool isVoiceBrewLogParsingAvailable,
        bool isImageBeanParsingAvailable) : IAiFeatureAvailability
    {
        public bool IsVoiceBrewLogParsingAvailable { get; } = isVoiceBrewLogParsingAvailable;

        public bool IsImageBeanParsingAvailable { get; } = isImageBeanParsingAvailable;
    }
}
