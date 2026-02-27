namespace CoffeeTracker.Infrastructure.AI;

public sealed record EntityCatalog(
    List<EntityRef> Beans,
    List<EntityRef> Brewers,
    List<EntityRef> Grinders,
    List<EntityRef> Recipes,
    List<EntityRef> Accessories);

public sealed record EntityRef(Guid Id, string Name);
