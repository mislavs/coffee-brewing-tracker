using CoffeeTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoffeeTracker.Infrastructure.Persistence.Configurations;

public class RoasterConfiguration : IEntityTypeConfiguration<Roaster>
{
    public void Configure(EntityTypeBuilder<Roaster> builder)
    {
        builder.HasKey(roaster => roaster.Id);

        builder.Property(roaster => roaster.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(roaster => roaster.City)
            .HasMaxLength(100);

        builder.Property(roaster => roaster.Country)
            .HasMaxLength(100);
    }
}
