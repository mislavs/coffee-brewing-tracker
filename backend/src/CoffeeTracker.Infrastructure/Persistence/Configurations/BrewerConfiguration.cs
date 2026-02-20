using CoffeeTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoffeeTracker.Infrastructure.Persistence.Configurations;

public class BrewerConfiguration : IEntityTypeConfiguration<Brewer>
{
    public void Configure(EntityTypeBuilder<Brewer> builder)
    {
        builder.HasKey(brewer => brewer.Id);

        builder.Property(brewer => brewer.Name)
            .HasMaxLength(200)
            .IsRequired();
    }
}
