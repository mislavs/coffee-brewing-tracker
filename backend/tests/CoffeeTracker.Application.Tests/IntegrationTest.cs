using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CoffeeTracker.Application.Tests;

public class IntegrationTest(IntegrationTestFactory factory) : IAsyncLifetime
{
    private readonly Func<Task> _resetDatabase = factory.ResetDatabase;

    protected ApplicationDbContext DbContext => factory.DbContext;

    protected async Task<TResponse> Send<TResponse>(IRequest<TResponse> request)
    {
        using var scope = factory.Services.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ISender>();
        return await sender.Send(request);
    }

    protected async Task Send(IRequest request)
    {
        using var scope = factory.Services.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ISender>();
        await sender.Send(request);
    }

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

    public ValueTask InitializeAsync()
    {
        return ValueTask.CompletedTask;
    }

    public async ValueTask DisposeAsync()
    {
        await _resetDatabase();
    }
}
