namespace CoffeeTracker.Infrastructure.AI.Extraction;

public sealed class NullBeanImageExtractionService : IBeanImageExtractionService
{
    public Task<BeanImageExtractionResult> ExtractAsync(
        Stream imageStream,
        string contentType,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(BeanImageExtractionResult.Empty);
    }
}
