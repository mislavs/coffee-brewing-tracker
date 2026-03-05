using CoffeeTracker.Infrastructure.AI.Transcription;
using FluentAssertions;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class NullSpeechToTextClientTests
{
    [Fact]
    public void GetService_WhenServiceTypeMatchesAndServiceKeyNull_ReturnsSelf()
    {
        // Arrange
        var sut = new NullSpeechToTextClient();

        // Act
        var service = sut.GetService(typeof(NullSpeechToTextClient));

        // Assert
        service.Should().BeSameAs(sut);
    }

    [Fact]
    public void GetService_WhenServiceTypeDoesNotMatch_ReturnsNull()
    {
        // Arrange
        var sut = new NullSpeechToTextClient();

        // Act
        var service = sut.GetService(typeof(string));

        // Assert
        service.Should().BeNull();
    }

    [Fact]
    public void GetService_WhenServiceKeyProvided_ReturnsNull()
    {
        // Arrange
        var sut = new NullSpeechToTextClient();

        // Act
        var service = sut.GetService(typeof(NullSpeechToTextClient), "key");

        // Assert
        service.Should().BeNull();
    }
}
