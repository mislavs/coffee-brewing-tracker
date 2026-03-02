using CoffeeTracker.Infrastructure.AI.Extraction;
using FluentAssertions;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class BrewLogExtractionServiceTests
{
    private readonly IChatClient _chatClient = Substitute.For<IChatClient>();
    private readonly ILogger<BrewLogExtractionService> _logger = Substitute.For<ILogger<BrewLogExtractionService>>();

    [Fact]
    public async Task ExtractAsync_ShouldIncludeEntityCatalogInPrompt()
    {
        // Arrange
        IEnumerable<ChatMessage>? capturedMessages = null;

        _chatClient.GetResponseAsync(
                Arg.Any<IEnumerable<ChatMessage>>(),
                Arg.Any<ChatOptions>(),
                Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                capturedMessages = callInfo.ArgAt<IEnumerable<ChatMessage>>(0);
                return new ChatResponse(new ChatMessage(ChatRole.Assistant, "{}"));
            });

        var sut = new BrewLogExtractionService(_chatClient, _logger);
        var catalog = new EntityCatalog(
            [new EntityRef(Guid.NewGuid(), "Bean Alpha")],
            [new EntityRef(Guid.NewGuid(), "V60")],
            [new EntityRef(Guid.NewGuid(), "K-Ultra")],
            [new EntityRef(Guid.NewGuid(), "Morning Recipe")],
            [new EntityRef(Guid.NewGuid(), "Paper Filter")]);

        // Act
        _ = await sut.ExtractAsync("I brewed a nice V60 cup", catalog, TestContext.Current.CancellationToken);

        // Assert
        capturedMessages.Should().NotBeNull();
        var promptText = string.Join(Environment.NewLine, capturedMessages!.Select(GetMessageText));
        promptText.Should().Contain("Bean Alpha");
        promptText.Should().Contain("V60");
        promptText.Should().Contain("K-Ultra");
        promptText.Should().Contain("Morning Recipe");
        promptText.Should().Contain("Paper Filter");
    }

    [Fact]
    public async Task ExtractAsync_WhenJsonIsValid_ShouldParseResult()
    {
        // Arrange
        var beanId = Guid.NewGuid();
        var brewerId = Guid.NewGuid();
        var json = $$"""
                     {
                       "beanId": "{{beanId}}",
                       "beanName": "Kenya AA",
                       "brewerId": "{{brewerId}}",
                       "brewerName": "V60",
                       "accessoryIds": [],
                       "accessoryNames": [],
                       "dose": 18.5,
                       "waterAmount": 300,
                       "waterTemperature": 93,
                       "grindSize": "medium-fine",
                       "brewTimeSeconds": 165,
                       "rating": 9,
                       "notes": "bright acidity",
                       "adjustmentIdeas": "grind slightly finer",
                       "brewedAt": null,
                       "unmatchedReferences": ["hand grinder"]
                     }
                     """;

        _chatClient.GetResponseAsync(
                Arg.Any<IEnumerable<ChatMessage>>(),
                Arg.Any<ChatOptions>(),
                Arg.Any<CancellationToken>())
            .Returns(new ChatResponse(new ChatMessage(ChatRole.Assistant, json)));

        var sut = new BrewLogExtractionService(_chatClient, _logger);
        var catalog = new EntityCatalog([], [], [], [], []);

        // Act
        var result = await sut.ExtractAsync("transcript", catalog, TestContext.Current.CancellationToken);

        // Assert
        result.BeanId.Should().Be(beanId);
        result.BeanName.Should().Be("Kenya AA");
        result.BrewerId.Should().Be(brewerId);
        result.Dose.Should().Be(18.5m);
        result.BrewTimeSeconds.Should().Be(165);
        result.UnmatchedReferences.Should().ContainSingle().Which.Should().Be("hand grinder");
    }

    [Fact]
    public async Task ExtractAsync_WhenJsonIsInvalid_ShouldReturnEmptyWithError()
    {
        // Arrange
        _chatClient.GetResponseAsync(
                Arg.Any<IEnumerable<ChatMessage>>(),
                Arg.Any<ChatOptions>(),
                Arg.Any<CancellationToken>())
            .Returns(new ChatResponse(new ChatMessage(ChatRole.Assistant, "{invalid-json")));

        var sut = new BrewLogExtractionService(_chatClient, _logger);
        var catalog = new EntityCatalog([], [], [], [], []);

        // Act
        var result = await sut.ExtractAsync("transcript", catalog, TestContext.Current.CancellationToken);

        // Assert
        result.BeanId.Should().BeNull();
        result.BrewerId.Should().BeNull();
        result.UnmatchedReferences.Should().NotBeEmpty();
    }

    private static string GetMessageText(ChatMessage message)
    {
        var textProperty = message.GetType().GetProperty("Text");
        var text = textProperty?.GetValue(message) as string;
        return string.IsNullOrWhiteSpace(text) ? message.ToString() : text;
    }
}
