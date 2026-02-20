using CoffeeTracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Respawn;
using System.Data.Common;
using Testcontainers.PostgreSql;

namespace CoffeeTracker.Application.Tests;

public class IntegrationTestFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public ApplicationDbContext DbContext { get; private set; } = null!;

    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder("postgres:16-alpine")
        .Build();
    private Respawner _respawner = null!;
    private DbConnection _connection = null!;

    public async Task ResetDatabase()
    {
        await _respawner.ResetAsync(_connection);
    }

    public async Task InitializeAsync()
    {
        await _container.StartAsync();

        DbContext = Services.CreateScope()
            .ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        await DbContext.Database.EnsureCreatedAsync();

        _connection = DbContext.Database.GetDbConnection();
        await _connection.OpenAsync();

        _respawner = await Respawner.CreateAsync(
            _connection,
            new RespawnerOptions
            {
                DbAdapter = DbAdapter.Postgres,
                SchemasToInclude = ["public"]
            });
    }

    public new async Task DisposeAsync()
    {
        await _connection.CloseAsync();
        await _container.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.UseSetting(
            "ConnectionStrings:DefaultConnection",
            _container.GetConnectionString());
    }
}
