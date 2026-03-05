using CoffeeTracker.Application.Features.Roasters.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Roasters.Queries.GetRoasterLogo;

[Collection(nameof(IntegrationTestsCollection))]
public class GetRoasterLogoHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Theory]
    [InlineData("logo.png", "image/png")]
    [InlineData("logo.jpg", "image/jpeg")]
    [InlineData("logo.jpeg", "image/jpeg")]
    [InlineData("logo.webp", "image/webp")]
    [InlineData("logo.svg", "image/svg+xml")]
    [InlineData("logo.gif", "application/octet-stream")]
    public async Task Handle_WhenRoasterHasLogo_ReturnsInferredContentType(string fileName, string expectedContentType)
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        roaster.SetLogo(fileName, [1, 2, 3]);
        await Insert(roaster);

        var query = new GetRoasterLogoQuery(roaster.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.FileName.Should().Be(fileName);
        result.ContentType.Should().Be(expectedContentType);
        result.Data.Should().Equal([1, 2, 3]);
    }

    [Fact]
    public async Task Handle_WhenRoasterHasNoLogo_ThrowsNotFoundException()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        await Insert(roaster);

        var query = new GetRoasterLogoQuery(roaster.Id);

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{roaster.Id}*does not have a logo*");
    }
}
