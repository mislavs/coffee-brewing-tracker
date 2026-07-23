using CoffeeTracker.Application.Features.Beans.Commands;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.SetBeanAvailability;

[Collection(nameof(IntegrationTestsCollection))]
public class SetBeanAvailabilityHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_WhenReviewIsProvided_UpdatesReviewAndAvailabilityTogether()
    {
        // Arrange
        var bean = await SeedBean(
            "review",
            BeanRating.Average,
            "Initial notes");

        // Act
        await Send(new SetBeanAvailabilityCommand(
            bean.Id,
            false,
            new BeanAvailabilityReview(5, "  Final notes  ")));

        // Assert
        var updatedBean = await DbContext.Beans
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == bean.Id,
                TestContext.Current.CancellationToken);
        updatedBean.IsAvailable.Should().BeFalse();
        updatedBean.Rating.Should().Be(BeanRating.Excellent);
        updatedBean.Notes.Should().Be("Final notes");
    }

    [Fact]
    public async Task Handle_WhenReviewIsOmitted_PreservesExistingReview()
    {
        // Arrange
        var bean = await SeedBean(
            "preserve",
            BeanRating.Good,
            "Keep these notes");

        // Act
        await Send(new SetBeanAvailabilityCommand(bean.Id, false));

        // Assert
        var updatedBean = await DbContext.Beans
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == bean.Id,
                TestContext.Current.CancellationToken);
        updatedBean.IsAvailable.Should().BeFalse();
        updatedBean.Rating.Should().Be(BeanRating.Good);
        updatedBean.Notes.Should().Be("Keep these notes");
    }

    [Fact]
    public async Task Handle_WhenReviewContainsNullValues_ClearsExistingReview()
    {
        // Arrange
        var bean = await SeedBean(
            "clear",
            BeanRating.Good,
            "Remove these notes");

        // Act
        await Send(new SetBeanAvailabilityCommand(
            bean.Id,
            false,
            new BeanAvailabilityReview(null, null)));

        // Assert
        var updatedBean = await DbContext.Beans
            .AsNoTracking()
            .SingleAsync(
                entity => entity.Id == bean.Id,
                TestContext.Current.CancellationToken);
        updatedBean.IsAvailable.Should().BeFalse();
        updatedBean.Rating.Should().BeNull();
        updatedBean.Notes.Should().BeNull();
    }

    private async Task<Bean> SeedBean(
        string suffix,
        BeanRating? rating,
        string? notes)
    {
        var roaster = Roaster.Create($"Roaster {suffix}", null, null);
        await Insert(roaster);

        var bean = Bean.Create(
            $"Bean {suffix}",
            roaster.Id,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            null,
            rating: rating,
            notes: notes);
        await Insert(bean);
        return bean;
    }
}
