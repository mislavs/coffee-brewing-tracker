using CoffeeTracker.Application.Features.Beans.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.CreateBean;

[Collection(nameof(IntegrationTestsCollection))]
public class CreateBeanHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenRoasterExists_CreatesBean()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        var kenya = Country.Create("Kenya", string.Empty, string.Empty);
        await Insert(roaster);
        await Insert(kenya);
        var command = CreateCommand(roaster.Id, kenya.Id, ["Citrus", "Chocolate"]) with
        {
            Region = " Nyeri ",
            Rating = 4,
            Notes = " Bright cup "
        };

        // Act
        var beanId = await Send(command);

        // Assert
        var bean = await DbContext.Beans
            .Include(entity => entity.Roaster)
            .Include(entity => entity.OriginCountries)
            .Include(entity => entity.FlavorNotes)
            .FirstOrDefaultAsync(
                entity => entity.Id == beanId,
                TestContext.Current.CancellationToken);

        bean.Should().NotBeNull();
        bean!.Name.Should().Be("Kenya AB");
        bean.RoasterId.Should().Be(roaster.Id);
        bean.Region.Should().Be("Nyeri");
        bean.Rating.Should().Be(BeanRating.Good);
        bean.Notes.Should().Be("Bright cup");
        bean.OriginCountries.Select(entity => entity.Name)
            .Should()
            .ContainSingle("Kenya");
        bean.FlavorNotes.Select(entity => entity.Name)
            .Should()
            .Contain(["Citrus", "Chocolate"]);
    }

    [Fact]
    public async Task Handle_WhenFlavorNotesDoNotExist_CreatesNewFlavorNotes()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        var kenya = Country.Create("Kenya", string.Empty, string.Empty);
        await Insert(roaster);
        await Insert(kenya);
        var command = CreateCommand(roaster.Id, kenya.Id, ["Strawberry", "Caramel"]);

        // Act
        _ = await Send(command);

        // Assert
        var flavorNoteNames = await DbContext.FlavorNotes
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => entity.Name)
            .ToListAsync(TestContext.Current.CancellationToken);

        flavorNoteNames.Should().ContainInOrder("Caramel", "Strawberry");
    }

    [Fact]
    public async Task Handle_WhenFlavorNotesExist_ReusesExistingFlavorNotes()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        var kenya = Country.Create("Kenya", string.Empty, string.Empty);
        var existingFlavorNote = FlavorNote.Create("Berry");
        await Insert(roaster);
        await Insert(kenya);
        await Insert(existingFlavorNote);
        var command = CreateCommand(roaster.Id, kenya.Id, ["Berry"]);

        // Act
        var beanId = await Send(command);

        // Assert
        var bean = await DbContext.Beans
            .Include(entity => entity.FlavorNotes)
            .FirstOrDefaultAsync(
                entity => entity.Id == beanId,
                TestContext.Current.CancellationToken);

        bean.Should().NotBeNull();
        bean!.FlavorNotes.Should().ContainSingle(entity => entity.Name == "Berry");
        DbContext.FlavorNotes.Count(entity => entity.Name == "Berry").Should().Be(1);
    }

    private static CreateBeanCommand CreateCommand(
        Guid roasterId,
        Guid originCountryId,
        IReadOnlyList<string> flavorNotes)
    {
        return new CreateBeanCommand(
            "Kenya AB",
            roasterId,
            OriginType.SingleOrigin,
            [originCountryId],
            "SL28",
            "Washed",
            RoastProfile.Filter,
            new DateOnly(2026, 2, 1),
            1800,
            250m,
            40m,
            flavorNotes);
    }
}
