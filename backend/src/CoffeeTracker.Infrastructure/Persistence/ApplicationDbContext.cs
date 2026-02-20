using CoffeeTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Brewer> Brewers => Set<Brewer>();
    public DbSet<Roaster> Roasters => Set<Roaster>();
    public DbSet<Bean> Beans => Set<Bean>();
    public DbSet<FlavorNote> FlavorNotes => Set<FlavorNote>();
    public DbSet<Country> Countries => Set<Country>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
