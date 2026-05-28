using CoffeeTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoffeeTracker.Infrastructure.Persistence.Configurations;

public class BeanConfiguration : IEntityTypeConfiguration<Bean>
{
    public void Configure(EntityTypeBuilder<Bean> builder)
    {
        builder.HasKey(bean => bean.Id);

        builder.Property(bean => bean.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(bean => bean.Variety)
            .HasMaxLength(200);

        builder.Property(bean => bean.ProcessingMethod)
            .HasMaxLength(200);

        builder.Property(bean => bean.Region)
            .HasMaxLength(200);

        builder.Property(bean => bean.Notes)
            .HasMaxLength(2000);

        builder.Property(bean => bean.ImageFileName)
            .HasMaxLength(255);

        builder.Property(bean => bean.ImageData);

        builder.Property(bean => bean.OriginType)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(bean => bean.RoastProfile)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(bean => bean.BagWeight)
            .IsRequired();

        builder.Property(bean => bean.IsAvailable)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Ignore(bean => bean.PricePerKg);

        builder.HasOne(bean => bean.Roaster)
            .WithMany(roaster => roaster.Beans)
            .HasForeignKey(bean => bean.RoasterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(bean => bean.FlavorNotes)
            .WithMany()
            .UsingEntity("BeanFlavorNote");

        builder.HasMany(bean => bean.OriginCountries)
            .WithMany()
            .UsingEntity("BeanCountry");

        builder.Navigation(bean => bean.FlavorNotes)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Navigation(bean => bean.OriginCountries)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
