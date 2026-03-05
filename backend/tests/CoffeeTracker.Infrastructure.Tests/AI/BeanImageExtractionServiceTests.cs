using CoffeeTracker.Infrastructure.AI.Extraction;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class BeanImageExtractionServiceTests
{
    private readonly IDataExtractor _dataExtractor = Substitute.For<IDataExtractor>();
    private readonly ILogger<BeanImageExtractionService> _logger = Substitute.For<ILogger<BeanImageExtractionService>>();

    [Fact]
    public async Task ExtractAsync_ShouldPassInstructionsImageBytesAndMimeTypeToExtractor()
    {
        // Arrange
        string? capturedInstructions = null;
        byte[]? capturedImageBytes = null;
        string? capturedMimeType = null;
        string? capturedUserText = null;

        _dataExtractor.ExtractFromImageAsync<BeanImageExtractionResult>(
                Arg.Any<string>(),
                Arg.Any<byte[]>(),
                Arg.Any<string>(),
                Arg.Any<string?>(),
                Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                capturedInstructions = callInfo.ArgAt<string>(0);
                capturedImageBytes = callInfo.ArgAt<byte[]>(1);
                capturedMimeType = callInfo.ArgAt<string>(2);
                capturedUserText = callInfo.ArgAt<string?>(3);
                return Task.FromResult<BeanImageExtractionResult?>(BeanImageExtractionResult.Empty);
            });

        var sut = new BeanImageExtractionService(_dataExtractor, _logger);
        var bytes = new byte[] { 10, 20, 30, 40 };
        await using var stream = new MemoryStream(bytes);

        // Act
        _ = await sut.ExtractAsync(stream, "image/png", TestContext.Current.CancellationToken);

        // Assert
        capturedInstructions.Should().NotBeNullOrWhiteSpace();
        capturedInstructions.Should().Contain("coffee bean information");
        capturedImageBytes.Should().Equal(bytes);
        capturedMimeType.Should().Be("image/png");
        capturedUserText.Should().BeNull();
    }

    [Fact]
    public async Task ExtractAsync_WhenExtractorReturnsNull_ShouldReturnEmpty()
    {
        // Arrange
        _dataExtractor.ExtractFromImageAsync<BeanImageExtractionResult>(
                Arg.Any<string>(),
                Arg.Any<byte[]>(),
                Arg.Any<string>(),
                Arg.Any<string?>(),
                Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<BeanImageExtractionResult?>(null));

        var sut = new BeanImageExtractionService(_dataExtractor, _logger);
        await using var stream = new MemoryStream([1, 2, 3]);

        // Act
        var result = await sut.ExtractAsync(stream, "image/jpeg", TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeEquivalentTo(BeanImageExtractionResult.Empty);
    }

    [Fact]
    public async Task ExtractAsync_WhenExtractorReturnsResult_ShouldNormalizeCollections()
    {
        // Arrange
        _dataExtractor.ExtractFromImageAsync<BeanImageExtractionResult>(
                Arg.Any<string>(),
                Arg.Any<byte[]>(),
                Arg.Any<string>(),
                Arg.Any<string?>(),
                Arg.Any<CancellationToken>())
            .Returns(
                Task.FromResult<BeanImageExtractionResult?>(
                    new BeanImageExtractionResult(
                        BeanName: "Kenya Lot",
                        RoasterName: "Roaster One",
                        OriginCountries: null!,
                        Variety: "SL28",
                        ProcessingMethod: "Washed",
                        RoastProfile: "Filter",
                        RoastDate: "2026-03-01",
                        Altitude: 1800,
                        BagWeight: 250m,
                        Price: 13.5m,
                        FlavorNotes: null!,
                        UnmatchedReferences: null!)));

        var sut = new BeanImageExtractionService(_dataExtractor, _logger);
        await using var stream = new MemoryStream([1, 2, 3]);

        // Act
        var result = await sut.ExtractAsync(stream, "image/webp", TestContext.Current.CancellationToken);

        // Assert
        result.BeanName.Should().Be("Kenya Lot");
        result.OriginCountries.Should().NotBeNull().And.BeEmpty();
        result.FlavorNotes.Should().NotBeNull().And.BeEmpty();
        result.UnmatchedReferences.Should().NotBeNull().And.BeEmpty();
    }
}
