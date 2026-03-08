using CoffeeTracker.Application.Features.Beans.Commands.ParseBeanImage;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Infrastructure.AI.Extraction.BeanImage;
using FluentAssertions;
using NSubstitute;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.ParseBeanImage;

[Collection(nameof(IntegrationTestsCollection))]
public class InferOriginTypeTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenNoOriginCountriesResolved_ShouldReturnNullOriginType()
    {
        // Arrange
        var extractionService = Substitute.For<IBeanImageExtractionService>();
        extractionService.ExtractAsync(
                Arg.Any<Stream>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(
                Task.FromResult(
                    CreateExtractionResult(originCountries: [])));

        var handler = new ParseBeanImageHandler(DbContext, extractionService);

        // Act
        var result = await handler.Handle(
            new ParseBeanImageCommand(new MemoryStream([1]), "image/png"),
            TestContext.Current.CancellationToken);

        // Assert
        result.OriginType.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenSingleOriginCountryResolved_ShouldReturnSingleOrigin()
    {
        // Arrange
        await Insert(Country.Create("Kenya", string.Empty, string.Empty));

        var extractionService = Substitute.For<IBeanImageExtractionService>();
        extractionService.ExtractAsync(
                Arg.Any<Stream>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(
                Task.FromResult(
                    CreateExtractionResult(originCountries: ["Kenya"])));

        var handler = new ParseBeanImageHandler(DbContext, extractionService);

        // Act
        var result = await handler.Handle(
            new ParseBeanImageCommand(new MemoryStream([1]), "image/png"),
            TestContext.Current.CancellationToken);

        // Assert
        result.OriginType.Should().Be(OriginType.SingleOrigin);
    }

    [Fact]
    public async Task Handle_WhenMultipleOriginCountriesResolved_ShouldReturnBlend()
    {
        // Arrange
        await InsertMany([
            Country.Create("Kenya", string.Empty, string.Empty),
            Country.Create("Ethiopia", string.Empty, string.Empty)
        ]);

        var extractionService = Substitute.For<IBeanImageExtractionService>();
        extractionService.ExtractAsync(
                Arg.Any<Stream>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(
                Task.FromResult(
                    CreateExtractionResult(originCountries: ["Kenya", "Ethiopia"])));

        var handler = new ParseBeanImageHandler(DbContext, extractionService);

        // Act
        var result = await handler.Handle(
            new ParseBeanImageCommand(new MemoryStream([1]), "image/png"),
            TestContext.Current.CancellationToken);

        // Assert
        result.OriginType.Should().Be(OriginType.Blend);
    }

    private static BeanImageExtractionResult CreateExtractionResult(IReadOnlyList<string> originCountries)
    {
        return new BeanImageExtractionResult(
            BeanName: "Kenya Lot",
            RoasterName: null,
            OriginCountries: originCountries.ToList(),
            Variety: "SL28",
            ProcessingMethod: "Washed",
            RoastProfile: "Filter",
            RoastDate: "2026-03-01",
            Altitude: 1800,
            BagWeight: 250m,
            Price: 13.5m,
            FlavorNotes: [],
            UnmatchedReferences: []);
    }
}
