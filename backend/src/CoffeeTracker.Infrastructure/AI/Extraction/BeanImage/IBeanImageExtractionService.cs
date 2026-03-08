namespace CoffeeTracker.Infrastructure.AI.Extraction.BeanImage;

public interface IBeanImageExtractionService
{
    Task<BeanImageExtractionResult> ExtractAsync(
        Stream imageStream,
        string contentType,
        CancellationToken cancellationToken);
}
