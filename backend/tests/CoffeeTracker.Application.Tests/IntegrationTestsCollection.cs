using Xunit;

namespace CoffeeTracker.Application.Tests;

[CollectionDefinition(nameof(IntegrationTestsCollection))]
public class IntegrationTestsCollection : ICollectionFixture<IntegrationTestFactory>;
