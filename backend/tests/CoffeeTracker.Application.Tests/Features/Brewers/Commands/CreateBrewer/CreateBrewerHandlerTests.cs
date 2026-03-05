using CoffeeTracker.Application.Features.Brewers.Commands;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Brewers.Commands.CreateBrewer;

[Collection(nameof(IntegrationTestsCollection))]
public class CreateBrewerHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenCommandIsValid_CreatesBrewer()
    {
        // Arrange
        var command = new CreateBrewerCommand("Kawa Brewers");

        // Act
        var brewerId = await Send(command);

        // Assert
        var brewer = await DbContext.Brewers.FirstOrDefaultAsync(
            entity => entity.Id == brewerId,
            TestContext.Current.CancellationToken);
        brewer.Should().NotBeNull();
        brewer!.Name.Should().Be("Kawa Brewers");
    }
}
