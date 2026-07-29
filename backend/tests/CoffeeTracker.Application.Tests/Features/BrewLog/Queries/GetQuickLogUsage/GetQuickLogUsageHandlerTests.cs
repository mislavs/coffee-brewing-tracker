using CoffeeTracker.Application.Features.BrewLog.Queries;
using CoffeeTracker.Domain.Entities;
using CoffeeTracker.Domain.Enums;
using FluentAssertions;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Queries.GetQuickLogUsage;

[Collection(nameof(IntegrationTestsCollection))]
public class GetQuickLogUsageHandlerTests(IntegrationTestFactory factory) : IntegrationTest(factory)
{
    [Fact]
    public async Task Handle_ReturnsRecentUsageForSelectedBeanOnly()
    {
        // Arrange
        var roaster = Roaster.Create("Quick log roaster", null, null);
        await Insert(roaster);

        var selectedBean = CreateBean("Selected bean", roaster.Id);
        var otherBean = CreateBean("Other bean", roaster.Id);
        var brewerA = Brewer.Create("Brewer A");
        var brewerB = Brewer.Create("Brewer B");
        var unusedBrewer = Brewer.Create("Unused brewer");
        var grinder = Grinder.Create("Quick log grinder");
        await InsertMany([selectedBean, otherBean]);
        await InsertMany([brewerA, brewerB, unusedBrewer]);
        await Insert(grinder);

        var recipeA = Recipe.Create("Recipe A", brewerA.Id, null);
        var recipeB = Recipe.Create("Recipe B", brewerB.Id, null);
        var unusedRecipe = Recipe.Create("Unused recipe", unusedBrewer.Id, null);
        await InsertMany([recipeA, recipeB, unusedRecipe]);

        var utcNow = DateTime.UtcNow;
        await InsertMany(
        [
            CreateBrew(selectedBean.Id, brewerA.Id, grinder.Id, recipeA.Id, utcNow.AddDays(-1)),
            CreateBrew(selectedBean.Id, brewerA.Id, grinder.Id, recipeA.Id, utcNow.AddDays(-10)),
            CreateBrew(selectedBean.Id, brewerA.Id, grinder.Id, null, utcNow.AddDays(-20)),
            CreateBrew(selectedBean.Id, brewerB.Id, grinder.Id, recipeB.Id, utcNow.AddDays(-30)),
            CreateBrew(selectedBean.Id, brewerB.Id, grinder.Id, recipeB.Id, utcNow.AddDays(-91)),
            CreateBrew(otherBean.Id, brewerB.Id, grinder.Id, recipeB.Id, utcNow.AddDays(-1)),
            CreateBrew(selectedBean.Id, brewerB.Id, grinder.Id, recipeB.Id, utcNow.AddDays(1))
        ]);

        // Act
        var result = await Send(new GetQuickLogUsageQuery(selectedBean.Id));

        // Assert
        result.Brewers.Should().BeEquivalentTo(
        [
            new { Id = brewerA.Id, UsageCount = 3 },
            new { Id = brewerB.Id, UsageCount = 1 }
        ]);
        result.Recipes.Should().BeEquivalentTo(
        [
            new { Id = recipeA.Id, UsageCount = 2 },
            new { Id = recipeB.Id, UsageCount = 1 }
        ]);
        result.Brewers.Should().NotContain(entry => entry.Id == unusedBrewer.Id);
        result.Recipes.Should().NotContain(entry => entry.Id == unusedRecipe.Id);
    }

    private static Bean CreateBean(string name, Guid roasterId)
    {
        return Bean.Create(
            name,
            roasterId,
            OriginType.SingleOrigin,
            null,
            null,
            null,
            RoastProfile.Filter,
            null,
            null,
            250m,
            null);
    }

    private static BrewLogEntry CreateBrew(
        Guid beanId,
        Guid brewerId,
        Guid grinderId,
        Guid? recipeId,
        DateTime brewedAt)
    {
        return BrewLogEntry.Create(
            beanId,
            brewerId,
            grinderId,
            recipeId,
            18m,
            300m,
            null,
            10m,
            null,
            null,
            null,
            null,
            brewedAt);
    }
}
