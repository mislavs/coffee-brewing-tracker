namespace CoffeeTracker.Infrastructure.AI.Extraction.BrewLog;

public sealed class NullBrewLogExtractionService : IBrewLogExtractionService
{
    public Task<BrewLogExtractionResult> ExtractAsync(
        string transcript,
        EntityCatalog catalog,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(BrewLogExtractionResult.Empty);
    }
}
