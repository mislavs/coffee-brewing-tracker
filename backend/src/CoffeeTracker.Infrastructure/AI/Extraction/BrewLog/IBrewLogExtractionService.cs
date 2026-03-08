namespace CoffeeTracker.Infrastructure.AI.Extraction.BrewLog;

public interface IBrewLogExtractionService
{
    Task<BrewLogExtractionResult> ExtractAsync(
        string transcript,
        EntityCatalog catalog,
        CancellationToken cancellationToken);
}
