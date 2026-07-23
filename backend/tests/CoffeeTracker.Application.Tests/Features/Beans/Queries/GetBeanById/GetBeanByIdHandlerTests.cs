using CoffeeTracker.Application.Features.Beans.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.Beans.Queries.GetBeanById;

[Collection(nameof(IntegrationTestsCollection))]
public class GetBeanByIdHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenBeanExists_ReturnsBeanWithRoasterAndFlavorNotes()
    {
        // Arrange
        var roaster = Roaster.Create("Kawa", "Warsaw", null);
        var kenya = Country.Create("Kenya", string.Empty, string.Empty);
        var citrus = FlavorNote.Create("Citrus");
        var chocolate = FlavorNote.Create("Chocolate");
        await Insert(roaster);
        await Insert(kenya);
        await InsertMany([citrus, chocolate]);

        var bean = Bean.Create(
            "Kenya AB",
            roaster.Id,
            OriginType.SingleOrigin,
            [kenya],
            "SL28",
            "Washed",
            RoastProfile.Filter,
            new DateOnly(2026, 2, 1),
            1800,
            250m,
            40m,
            region: "Nyeri",
            rating: BeanRating.Excellent,
            notes: "Bright acidity.");
        bean.SetImage("kenya-ab.png", [1, 2, 3]);
        bean.SetFlavorNotes([citrus, chocolate]);
        await Insert(bean);

        var query = new GetBeanByIdQuery(bean.Id);

        // Act
        var result = await Send(query);

        // Assert
        result.Id.Should().Be(bean.Id);
        result.Name.Should().Be("Kenya AB");
        result.RoasterId.Should().Be(roaster.Id);
        result.RoasterName.Should().Be("Kawa");
        result.Region.Should().Be("Nyeri");
        result.Rating.Should().Be(5);
        result.SuggestedRating.Should().BeNull();
        result.Notes.Should().Be("Bright acidity.");
        result.OriginCountries.Should().ContainSingle();
        result.OriginCountries.Single().Id.Should().Be(kenya.Id);
        result.OriginCountries.Single().Name.Should().Be("Kenya");
        result.PricePerKg.Should().Be(160m);
        result.RemainingQuantity.Should().Be(250m);
        result.HasImage.Should().BeTrue();
        result.ImageUrl.Should().Be($"/api/beans/{bean.Id}/image");
        result.FlavorNotes.Select(entity => entity.Name)
            .Should()
            .Contain(["Citrus", "Chocolate"]);
    }

    [Fact]
    public async Task Handle_WhenBeanHasRatedBrews_ReturnsHighestRatingAndIgnoresUnratedBrews()
    {
        // Arrange
        var roaster = Roaster.Create("Suggestion Roaster", null, null);
        await Insert(roaster);
        var bean = Bean.Create(
            "Suggestion Bean",
            roaster.Id,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            null);
        var brewer = Brewer.Create("Suggestion Brewer");
        var grinder = Grinder.Create("Suggestion Grinder");
        await Insert(bean);
        await Insert(brewer);
        await Insert(grinder);

        await InsertMany([
            BrewLogEntry.Create(
                bean.Id,
                brewer.Id,
                grinder.Id,
                null,
                18m,
                300m,
                null,
                null,
                null,
                BrewRating.Average,
                null,
                null,
                DateTime.UtcNow.AddDays(-2)),
            BrewLogEntry.Create(
                bean.Id,
                brewer.Id,
                grinder.Id,
                null,
                18m,
                300m,
                null,
                null,
                null,
                null,
                null,
                null,
                DateTime.UtcNow.AddDays(-1)),
            BrewLogEntry.Create(
                bean.Id,
                brewer.Id,
                grinder.Id,
                null,
                18m,
                300m,
                null,
                null,
                null,
                BrewRating.Excellent,
                null,
                null,
                DateTime.UtcNow)
        ]);

        // Act
        var result = await Send(new GetBeanByIdQuery(bean.Id));

        // Assert
        result.SuggestedRating.Should().Be(5);
    }

    [Fact]
    public async Task Handle_WhenBeanDoesNotExist_ThrowsNotFoundException()
    {
        // Arrange
        var query = new GetBeanByIdQuery(Guid.NewGuid());

        // Act
        Func<Task> act = () => Send(query);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
