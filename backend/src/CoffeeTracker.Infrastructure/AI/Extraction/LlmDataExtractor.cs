using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace CoffeeTracker.Infrastructure.AI.Extraction;

public sealed class LlmDataExtractor(
    IChatClient chatClient,
    ILogger<LlmDataExtractor> logger) : IDataExtractor
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new(JsonSerializerDefaults.Web);

    public async Task<TResult?> ExtractFromTextAsync<TResult>(
        string extractionInstructions,
        string userText,
        CancellationToken cancellationToken)
        where TResult : class
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(extractionInstructions);
        ArgumentException.ThrowIfNullOrWhiteSpace(userText);

        var messages = new[]
        {
            new ChatMessage(ChatRole.System, extractionInstructions),
            new ChatMessage(ChatRole.User, userText)
        };

        return await ExtractAsync<TResult>(messages, cancellationToken);
    }

    public async Task<TResult?> ExtractFromImageAsync<TResult>(
        string extractionInstructions,
        byte[] imageBytes,
        string mimeType,
        string? userText,
        CancellationToken cancellationToken)
        where TResult : class
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(extractionInstructions);
        ArgumentNullException.ThrowIfNull(imageBytes);
        ArgumentException.ThrowIfNullOrWhiteSpace(mimeType);

        var userContents = new List<AIContent>
        {
            new DataContent(imageBytes, mimeType)
        };

        if (!string.IsNullOrWhiteSpace(userText))
        {
            userContents.Insert(0, new TextContent(userText));
        }

        var messages = new[]
        {
            new ChatMessage(ChatRole.System, extractionInstructions),
            new ChatMessage(ChatRole.User, userContents)
        };

        return await ExtractAsync<TResult>(messages, cancellationToken);
    }

    private async Task<TResult?> ExtractAsync<TResult>(
        IReadOnlyList<ChatMessage> messages,
        CancellationToken cancellationToken)
        where TResult : class
    {
        var response = await chatClient.GetResponseAsync(
            messages,
            new ChatOptions
            {
                ResponseFormat = ChatResponseFormat.Json
            },
            cancellationToken);

        var rawText = response.Text;
        logger.LogDebug("LLM raw response: {RawResponse}", rawText);

        if (string.IsNullOrWhiteSpace(rawText))
        {
            logger.LogWarning("LLM returned empty response for structured extraction.");
            return null;
        }

        var jsonText = StripMarkdownCodeFences(rawText);
        if (jsonText != rawText)
        {
            logger.LogDebug("Stripped markdown code fences from LLM response.");
        }

        try
        {
            var result = JsonSerializer.Deserialize<TResult>(jsonText, JsonSerializerOptions);
            if (result is null)
            {
                logger.LogWarning("LLM response deserialized to null.");
                return null;
            }

            return result;
        }
        catch (JsonException jsonException)
        {
            logger.LogWarning(jsonException, "Failed to parse extraction JSON response. Raw text: {RawResponse}", rawText);
            return null;
        }
    }

    internal static string StripMarkdownCodeFences(string text)
    {
        var span = text.AsSpan().Trim();

        if (!span.StartsWith("```"))
        {
            return span.ToString();
        }

        var rest = span[3..];
        var newlineIndex = rest.IndexOf('\n');
        if (newlineIndex < 0)
        {
            return span.ToString();
        }

        var body = rest[(newlineIndex + 1)..];

        if (body.EndsWith("```"))
        {
            body = body[..^3];
        }

        return body.Trim().ToString();
    }
}
