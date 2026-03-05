namespace CoffeeTracker.Infrastructure.AI.Extraction;

public interface IBeanImageExtractionService
{
    Task<BeanImageExtractionResult> ExtractAsync(
        Stream imageStream,
        string contentType,
        CancellationToken cancellationToken);
}
