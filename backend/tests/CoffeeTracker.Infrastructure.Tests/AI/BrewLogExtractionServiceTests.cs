using CoffeeTracker.Infrastructure.AI.Extraction.BrewLog;
using CoffeeTracker.Infrastructure.AI.Extraction.Shared;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class BrewLogExtractionServiceTests
{
    private readonly IDataExtractor _dataExtractor = Substitute.For<IDataExtractor>();
    private readonly ILogger<BrewLogExtractionService> _logger = Substitute.For<ILogger<BrewLogExtractionService>>();

    [Fact]
    public async Task ExtractAsync_ShouldIncludeEntityCatalogInInstructions()
    {
        // Arrange
        string? capturedInstructions = null;
        string? capturedTranscript = null;

        _dataExtractor.ExtractFromTextAsync<BrewLogExtractionResult>(
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                capturedInstructions = callInfo.ArgAt<string>(0);
                capturedTranscript = callInfo.ArgAt<string>(1);
                return Task.FromResult<BrewLogExtractionResult?>(
                    BrewLogExtractionResult.Empty with
                    {
                        AccessoryIds = [],
                        AccessoryNames = [],
                        UnmatchedReferences = []
                    });
            });

        var sut = new BrewLogExtractionService(_dataExtractor, _logger);
        var catalog = new EntityCatalog(
            [new EntityRef(Guid.NewGuid(), "Bean Alpha")],
            [new EntityRef(Guid.NewGuid(), "V60")],
            [new EntityRef(Guid.NewGuid(), "K-Ultra")],
            [new EntityRef(Guid.NewGuid(), "Morning Recipe")],
            [new EntityRef(Guid.NewGuid(), "Paper Filter")]);

        // Act
        _ = await sut.ExtractAsync("I brewed a nice V60 cup", catalog, TestContext.Current.CancellationToken);

        // Assert
        capturedInstructions.Should().NotBeNullOrWhiteSpace();
        capturedInstructions.Should().Contain("Bean Alpha");
        capturedInstructions.Should().Contain("V60");
        capturedInstructions.Should().Contain("K-Ultra");
        capturedInstructions.Should().Contain("Morning Recipe");
        capturedInstructions.Should().Contain("Paper Filter");
        capturedTranscript.Should().Be("I brewed a nice V60 cup");
    }

    [Fact]
    public async Task ExtractAsync_WhenExtractorReturnsNull_ShouldReturnEmpty()
    {
        // Arrange
        _dataExtractor.ExtractFromTextAsync<BrewLogExtractionResult>(
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<BrewLogExtractionResult?>(null));

        var sut = new BrewLogExtractionService(_dataExtractor, _logger);
        var catalog = new EntityCatalog([], [], [], [], []);

        // Act
        var result = await sut.ExtractAsync("transcript", catalog, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(BrewLogExtractionResult.Empty);
    }

    [Fact]
    public async Task ExtractAsync_WhenExtractorReturnsResult_ShouldNormalizeCollections()
    {
        // Arrange
        _dataExtractor.ExtractFromTextAsync<BrewLogExtractionResult>(
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(
                Task.FromResult<BrewLogExtractionResult?>(
                    new BrewLogExtractionResult(
                        Guid.NewGuid(),
                        "Kenya AA",
                        Guid.NewGuid(),
                        "V60",
                        null,
                        "K-Ultra",
                        null,
                        null,
                        null!,
                        null!,
                        18.5m,
                        300m,
                        93m,
                        "medium-fine",
                        165,
                        9,
                        "bright acidity",
                        "grind slightly finer",
                        null,
                        null!)));

        var sut = new BrewLogExtractionService(_dataExtractor, _logger);
        var catalog = new EntityCatalog([], [], [], [], []);

        // Act
        var result = await sut.ExtractAsync("transcript", catalog, TestContext.Current.CancellationToken);

        // Assert
        result.BeanName.Should().Be("Kenya AA");
        result.AccessoryIds.Should().NotBeNull().And.BeEmpty();
        result.AccessoryNames.Should().NotBeNull().And.BeEmpty();
        result.UnmatchedReferences.Should().NotBeNull().And.BeEmpty();
    }
}
