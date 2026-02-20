using CoffeeTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoffeeTracker.Infrastructure.Persistence.Configurations;

public class AccessoryConfiguration : IEntityTypeConfiguration<Accessory>
{
    public void Configure(EntityTypeBuilder<Accessory> builder)
    {
        builder.HasKey(entity => entity.Id);

        builder.Property(entity => entity.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasMany(entity => entity.CompatibleBrewers)
            .WithMany(entity => entity.Accessories)
            .UsingEntity("AccessoryBrewer");

        builder.Navigation(entity => entity.CompatibleBrewers)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
