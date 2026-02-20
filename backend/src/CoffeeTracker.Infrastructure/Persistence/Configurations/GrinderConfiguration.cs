using CoffeeTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoffeeTracker.Infrastructure.Persistence.Configurations;

public class GrinderConfiguration : IEntityTypeConfiguration<Grinder>
{
    public void Configure(EntityTypeBuilder<Grinder> builder)
    {
        builder.HasKey(grinder => grinder.Id);

        builder.Property(grinder => grinder.Name)
            .HasMaxLength(200)
            .IsRequired();
    }
}
