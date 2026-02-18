using CoffeeTracker.Infrastructure.Persistence;
using CoffeeTracker.MigrationService;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddHostedService<MigrationsWorker<ApplicationDbContext>>();

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(MigrationsWorker<ApplicationDbContext>.ActivitySourceName));

ConfigureDbContext<ApplicationDbContext>("DefaultConnection");

var host = builder.Build();
host.Run();

void ConfigureDbContext<TContext>(string connectionStringName)
    where TContext : DbContext
{
    builder.Services.AddDbContext<TContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString(connectionStringName)
            ?? throw new InvalidOperationException(
                $"Connection string '{connectionStringName}' not found.")));

    builder.EnrichNpgsqlDbContext<TContext>(configureSettings: settings =>
    {
        settings.DisableRetry = false;
        settings.CommandTimeout = 30;
    });
}
