using CoffeeTracker.Infrastructure.AI.Extraction;
using FluentAssertions;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace CoffeeTracker.Infrastructure.Tests.AI;

public class LlmDataExtractorTests
{
    private readonly IChatClient _chatClient = Substitute.For<IChatClient>();
    private readonly ILogger<LlmDataExtractor> _logger = Substitute.For<ILogger<LlmDataExtractor>>();

    [Fact]
    public async Task ExtractFromTextAsync_WhenResponseContainsValidJson_ShouldDeserialize()
    {
        // Arrange
        IEnumerable<ChatMessage>? capturedMessages = null;
        ChatOptions? capturedOptions = null;

        _chatClient.GetResponseAsync(
                Arg.Any<IEnumerable<ChatMessage>>(),
                Arg.Any<ChatOptions>(),
                Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                capturedMessages = callInfo.ArgAt<IEnumerable<ChatMessage>>(0);
                capturedOptions = callInfo.ArgAt<ChatOptions>(1);
                return new ChatResponse(new ChatMessage(ChatRole.Assistant, """{"value":"Kenya AA"}"""));
            });

        var sut = new LlmDataExtractor(_chatClient, _logger);

        // Act
        var result = await sut.ExtractFromTextAsync<SampleExtractionResult>(
            "Extract fields",
            "this is user text",
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result!.Value.Should().Be("Kenya AA");

        capturedOptions.Should().NotBeNull();
        capturedOptions!.ResponseFormat.Should().Be(ChatResponseFormat.Json);

        capturedMessages.Should().NotBeNull();
        var messages = capturedMessages!.ToList();
        messages.Should().HaveCount(2);
        messages[0].Role.Should().Be(ChatRole.System);
        messages[0].Text.Should().Be("Extract fields");
        messages[1].Role.Should().Be(ChatRole.User);
        messages[1].Text.Should().Be("this is user text");
    }

    [Fact]
    public async Task ExtractFromTextAsync_WhenResponseIsWhitespace_ShouldReturnNull()
    {
        // Arrange
        _chatClient.GetResponseAsync(
                Arg.Any<IEnumerable<ChatMessage>>(),
                Arg.Any<ChatOptions>(),
                Arg.Any<CancellationToken>())
            .Returns(new ChatResponse(new ChatMessage(ChatRole.Assistant, "   ")));

        var sut = new LlmDataExtractor(_chatClient, _logger);

        // Act
        var result = await sut.ExtractFromTextAsync<SampleExtractionResult>(
            "Extract fields",
            "text",
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ExtractFromTextAsync_WhenResponseJsonIsInvalid_ShouldReturnNull()
    {
        // Arrange
        _chatClient.GetResponseAsync(
                Arg.Any<IEnumerable<ChatMessage>>(),
                Arg.Any<ChatOptions>(),
                Arg.Any<CancellationToken>())
            .Returns(new ChatResponse(new ChatMessage(ChatRole.Assistant, "{invalid-json")));

        var sut = new LlmDataExtractor(_chatClient, _logger);

        // Act
        var result = await sut.ExtractFromTextAsync<SampleExtractionResult>(
            "Extract fields",
            "text",
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ExtractFromTextAsync_WhenResponseUsesMarkdownCodeFence_ShouldDeserialize()
    {
        // Arrange
        const string fencedJson = """
                                  ```json
                                  {"value":"FromFence"}
                                  ```
                                  """;

        _chatClient.GetResponseAsync(
                Arg.Any<IEnumerable<ChatMessage>>(),
                Arg.Any<ChatOptions>(),
                Arg.Any<CancellationToken>())
            .Returns(new ChatResponse(new ChatMessage(ChatRole.Assistant, fencedJson)));

        var sut = new LlmDataExtractor(_chatClient, _logger);

        // Act
        var result = await sut.ExtractFromTextAsync<SampleExtractionResult>(
            "Extract fields",
            "text",
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result!.Value.Should().Be("FromFence");
    }

    [Fact]
    public async Task ExtractFromImageAsync_ShouldSendTextAndImageContent()
    {
        // Arrange
        IEnumerable<ChatMessage>? capturedMessages = null;
        ChatOptions? capturedOptions = null;

        _chatClient.GetResponseAsync(
                Arg.Any<IEnumerable<ChatMessage>>(),
                Arg.Any<ChatOptions>(),
                Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                capturedMessages = callInfo.ArgAt<IEnumerable<ChatMessage>>(0);
                capturedOptions = callInfo.ArgAt<ChatOptions>(1);
                return new ChatResponse(new ChatMessage(ChatRole.Assistant, """{"value":"ok"}"""));
            });

        var sut = new LlmDataExtractor(_chatClient, _logger);
        var imageBytes = new byte[] { 1, 2, 3, 4 };

        // Act
        var result = await sut.ExtractFromImageAsync<SampleExtractionResult>(
            "Extract bean details",
            imageBytes,
            "image/png",
            "optional user context",
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().NotBeNull();
        result!.Value.Should().Be("ok");

        capturedOptions.Should().NotBeNull();
        capturedOptions!.ResponseFormat.Should().Be(ChatResponseFormat.Json);

        capturedMessages.Should().NotBeNull();
        var messages = capturedMessages!.ToList();
        messages.Should().HaveCount(2);

        var userMessage = messages[1];
        userMessage.Role.Should().Be(ChatRole.User);
        userMessage.Contents.Should().HaveCount(2);

        userMessage.Contents[0].Should().BeOfType<TextContent>();
        ((TextContent)userMessage.Contents[0]).Text.Should().Be("optional user context");

        userMessage.Contents[1].Should().BeOfType<DataContent>();
        var imageContent = (DataContent)userMessage.Contents[1];
        imageContent.MediaType.Should().Be("image/png");
        imageContent.Data.ToArray().Should().Equal(imageBytes);
    }

    [Fact]
    public async Task ExtractFromTextAsync_WhenResponseStartsWithCodeFenceWithoutNewline_ShouldReturnNull()
    {
        // Arrange
        _chatClient.GetResponseAsync(
                Arg.Any<IEnumerable<ChatMessage>>(),
                Arg.Any<ChatOptions>(),
                Arg.Any<CancellationToken>())
            .Returns(new ChatResponse(new ChatMessage(ChatRole.Assistant, "```json")));

        var sut = new LlmDataExtractor(_chatClient, _logger);

        // Act
        var result = await sut.ExtractFromTextAsync<SampleExtractionResult>(
            "Extract fields",
            "text",
            TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
    }

    private sealed record SampleExtractionResult(string? Value);
}
