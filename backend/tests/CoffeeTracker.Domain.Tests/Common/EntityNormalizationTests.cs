using CoffeeTracker.Domain.Common;
using FluentAssertions;

namespace CoffeeTracker.Domain.Tests.Common;

public class EntityNormalizationTests
{
    [Fact]
    public void EnsureRequired_WhenValueIsEmpty_ThrowsArgumentException()
    {
        // Act
        Action act = () => EntityNormalization.EnsureRequired(Guid.Empty, "id");

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("id");
    }
}
