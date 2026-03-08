using CoffeeTracker.Application.Features.Beans.Commands.ParseBeanImage;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Infrastructure.AI.Extraction.BeanImage;
using FluentAssertions;
using NSubstitute;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.ParseBeanImage;

[Collection(nameof(IntegrationTestsCollection))]
public class ParseBeanImageHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenKnownAndUnknownNamesMixed_ResolvesKnownValuesAndTracksUnmatched()
    {
        // Arrange
        var roaster = Roaster.Create("Known Roaster", "Warsaw", null);
        await Insert(roaster);
        await Insert(Country.Create("Kenya", string.Empty, string.Empty));
        await Insert(FlavorNote.Create("Chocolate"));

        var extractionService = Substitute.For<IBeanImageExtractionService>();
        extractionService.ExtractAsync(
                Arg.Any<Stream>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new BeanImageExtractionResult(
                BeanName: "Kenya Lot",
                RoasterName: "  Known Roaster  ",
                OriginCountries: [" Kenya ", "UnknownLand", "KENYA", " "],
                Variety: "SL28",
                ProcessingMethod: "Washed",
                RoastProfile: "Filter",
                RoastDate: "2026-03-01",
                Altitude: 1800,
                BagWeight: 250m,
                Price: 14.5m,
                FlavorNotes: ["Chocolate", "Floral", "chocolate", " "],
                UnmatchedReferences: [" RawRef ", "rawref", " "])));

        var handler = new ParseBeanImageHandler(DbContext, extractionService);

        // Act
        var result = await handler.Handle(
            new ParseBeanImageCommand(new MemoryStream([1, 2, 3]), "image/png"),
            TestContext.Current.CancellationToken);

        // Assert
        result.RoasterId.Should().Be(roaster.Id);
        result.RoastProfile.Should().Be(RoastProfile.Filter);
        result.RoastDate.Should().Be(new DateOnly(2026, 3, 1));
        result.OriginType.Should().Be(OriginType.SingleOrigin);
        result.OriginCountries.Should().Equal(["Kenya"]);
        result.FlavorNotes.Should().Equal(["Chocolate", "Floral"]);
        result.UnmatchedReferences.Should().Equal(["RawRef", "UnknownLand"]);
    }

    [Fact]
    public async Task Handle_WhenRoasterAndFieldsAreUnresolvable_AddsDistinctUnmatchedReferences()
    {
        // Arrange
        var extractionService = Substitute.For<IBeanImageExtractionService>();
        extractionService.ExtractAsync(
                Arg.Any<Stream>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new BeanImageExtractionResult(
                BeanName: "Mystery Bean",
                RoasterName: " Unknown Roaster ",
                OriginCountries: null!,
                Variety: null,
                ProcessingMethod: null,
                RoastProfile: "Darkest",
                RoastDate: "not-a-date",
                Altitude: null,
                BagWeight: null,
                Price: null,
                FlavorNotes: null!,
                UnmatchedReferences: [" darkest ", " ", "UNKNOWN ROASTER"])));

        var handler = new ParseBeanImageHandler(DbContext, extractionService);

        // Act
        var result = await handler.Handle(
            new ParseBeanImageCommand(new MemoryStream([1]), "image/png"),
            TestContext.Current.CancellationToken);

        // Assert
        result.RoasterId.Should().BeNull();
        result.OriginCountries.Should().BeEmpty();
        result.FlavorNotes.Should().BeEmpty();
        result.RoastProfile.Should().BeNull();
        result.RoastDate.Should().BeNull();
        result.OriginType.Should().BeNull();
        result.UnmatchedReferences.Should().Equal(
            ["darkest", "UNKNOWN ROASTER", "not-a-date"]);
    }

    [Fact]
    public async Task Handle_WhenOptionalValuesAreWhitespace_DoesNotAddUnmatchedReferences()
    {
        // Arrange
        var extractionService = Substitute.For<IBeanImageExtractionService>();
        extractionService.ExtractAsync(
                Arg.Any<Stream>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new BeanImageExtractionResult(
                BeanName: "Whitespace Bean",
                RoasterName: "   ",
                OriginCountries: [],
                Variety: null,
                ProcessingMethod: null,
                RoastProfile: "  ",
                RoastDate: "   ",
                Altitude: null,
                BagWeight: null,
                Price: null,
                FlavorNotes: [],
                UnmatchedReferences: null!)));

        var handler = new ParseBeanImageHandler(DbContext, extractionService);

        // Act
        var result = await handler.Handle(
            new ParseBeanImageCommand(new MemoryStream([1]), "image/png"),
            TestContext.Current.CancellationToken);

        // Assert
        result.RoasterId.Should().BeNull();
        result.RoastProfile.Should().BeNull();
        result.RoastDate.Should().BeNull();
        result.UnmatchedReferences.Should().BeEmpty();
    }
}
