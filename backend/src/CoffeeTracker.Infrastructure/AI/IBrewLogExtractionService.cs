namespace CoffeeTracker.Infrastructure.AI;

public interface IBrewLogExtractionService
{
    Task<BrewLogExtractionResult> ExtractAsync(
        string transcript,
        EntityCatalog catalog,
        CancellationToken cancellationToken);
}
