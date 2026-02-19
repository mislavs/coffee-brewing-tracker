using System.Linq;
using System.Threading.Tasks;
using CoffeeTracker.Application.Features.FlavorNotes.Queries;
using CoffeeTracker.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CoffeeTracker.Application.Tests.Features.FlavorNotes.Queries.GetFlavorNotesList;

[Collection(nameof(IntegrationTestsCollection))]
public class GetFlavorNotesListHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenFlavorNotesExist_ReturnsOrderedByName()
    {
        // Arrange
        var flavorNotes = new[]
        {
            FlavorNote.Create("Chocolate"),
            FlavorNote.Create("Berry"),
            FlavorNote.Create("Citrus")
        };
        await InsertMany(flavorNotes);
        var query = new GetFlavorNotesListQuery();

        // Act
        var result = await Send(query);

        // Assert
        result.Should().HaveCount(3);
        result.Select(entity => entity.Name)
            .Should()
            .ContainInOrder("Berry", "Chocolate", "Citrus");
    }
}
