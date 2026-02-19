using CoffeeTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoffeeTracker.Infrastructure.Persistence.Configurations;

public class FlavorNoteConfiguration : IEntityTypeConfiguration<FlavorNote>
{
    public void Configure(EntityTypeBuilder<FlavorNote> builder)
    {
        builder.HasKey(flavorNote => flavorNote.Id);

        builder.Property(flavorNote => flavorNote.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(flavorNote => flavorNote.Name)
            .IsUnique();
    }
}
