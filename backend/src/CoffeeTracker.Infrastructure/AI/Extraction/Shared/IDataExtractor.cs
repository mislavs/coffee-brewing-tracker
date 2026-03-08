namespace CoffeeTracker.Infrastructure.AI.Extraction.Shared;

public interface IDataExtractor
{
    Task<TResult?> ExtractFromTextAsync<TResult>(
        string extractionInstructions,
        string userText,
        CancellationToken cancellationToken)
        where TResult : class;

    Task<TResult?> ExtractFromImageAsync<TResult>(
        string extractionInstructions,
        byte[] imageBytes,
        string mimeType,
        string? userText,
        CancellationToken cancellationToken)
        where TResult : class;
}
