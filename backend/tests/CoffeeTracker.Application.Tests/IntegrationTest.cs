using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CoffeeTracker.Infrastructure.Persistence;
using Xunit;

namespace CoffeeTracker.Application.Tests;

public class IntegrationTest(IntegrationTestFactory factory) : IAsyncLifetime
{
    private readonly Func<Task> _resetDatabase = factory.ResetDatabase;

    protected ApplicationDbContext DbContext => factory.DbContext;

    protected async Task Insert<T>(T entity) where T : class
    {
        await DbContext.AddAsync(entity);
        await DbContext.SaveChangesAsync();
    }

    protected async Task InsertMany<T>(IEnumerable<T> entities) where T : class
    {
        await DbContext.AddRangeAsync(entities);
        await DbContext.SaveChangesAsync();
    }

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        return _resetDatabase();
    }
}
