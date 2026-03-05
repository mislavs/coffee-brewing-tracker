namespace CoffeeTracker.Infrastructure.AI.Extraction;

public sealed class NullDataExtractor : IDataExtractor
{
    public Task<TResult?> ExtractFromTextAsync<TResult>(
        string extractionInstructions,
        string userText,
        CancellationToken cancellationToken)
        where TResult : class
    {
        return Task.FromResult<TResult?>(null);
    }

    public Task<TResult?> ExtractFromImageAsync<TResult>(
        string extractionInstructions,
        byte[] imageBytes,
        string mimeType,
        string? userText,
        CancellationToken cancellationToken)
        where TResult : class
    {
        return Task.FromResult<TResult?>(null);
    }
}
