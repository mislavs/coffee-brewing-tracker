using CoffeeTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoffeeTracker.Infrastructure.Persistence.Configurations;

public class RecipeConfiguration : IEntityTypeConfiguration<Recipe>
{
    public void Configure(EntityTypeBuilder<Recipe> builder)
    {
        builder.HasKey(recipe => recipe.Id);

        builder.Property(recipe => recipe.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(recipe => recipe.Description)
            .HasMaxLength(2000);

        builder.HasOne(recipe => recipe.Brewer)
            .WithMany()
            .HasForeignKey(recipe => recipe.BrewerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
