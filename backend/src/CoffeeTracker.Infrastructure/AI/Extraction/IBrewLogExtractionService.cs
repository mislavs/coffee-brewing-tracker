namespace CoffeeTracker.Infrastructure.AI.Extraction;

public interface IBrewLogExtractionService
{
    Task<BrewLogExtractionResult> ExtractAsync(
        string transcript,
        EntityCatalog catalog,
        CancellationToken cancellationToken);
}
