using CoffeeTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoffeeTracker.Infrastructure.Persistence.Configurations;

public class BrewLogEntryConfiguration : IEntityTypeConfiguration<BrewLogEntry>
{
    public void Configure(EntityTypeBuilder<BrewLogEntry> builder)
    {
        builder.HasKey(entity => entity.Id);

        builder.Property(entity => entity.Dose)
            .HasPrecision(8, 2)
            .IsRequired();

        builder.Property(entity => entity.WaterAmount)
            .HasPrecision(8, 2)
            .IsRequired();

        builder.Property(entity => entity.WaterTemperature)
            .HasPrecision(5, 1);

        builder.Property(entity => entity.GrindSize)
            .HasMaxLength(10);

        builder.Property(entity => entity.Notes)
            .HasMaxLength(2000);

        builder.Property(entity => entity.AdjustmentIdeas)
            .HasMaxLength(1000);

        builder.HasOne(entity => entity.Bean)
            .WithMany()
            .HasForeignKey(entity => entity.BeanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(entity => entity.Brewer)
            .WithMany()
            .HasForeignKey(entity => entity.BrewerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(entity => entity.Grinder)
            .WithMany()
            .HasForeignKey(entity => entity.GrinderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(entity => entity.Recipe)
            .WithMany()
            .HasForeignKey(entity => entity.RecipeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(entity => entity.Accessories)
            .WithMany()
            .UsingEntity("BrewLogAccessory");

        builder.Navigation(entity => entity.Accessories)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Ignore(entity => entity.BrewRatio);
    }
}
