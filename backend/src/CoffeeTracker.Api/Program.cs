using CoffeeTracker.Api.ExceptionHandlers;
using CoffeeTracker.Api.Endpoints;
using CoffeeTracker.Application;
using CoffeeTracker.Infrastructure;
using CoffeeTracker.Infrastructure.Persistence;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services));

    builder.AddServiceDefaults();

    builder.Services
        .AddApplication()
        .AddInfrastructure(builder.Configuration);

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
    builder.Services.AddProblemDetails();

    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader());
    });

    var app = builder.Build();

    if (!app.Environment.IsDevelopment())
    {
        await DatabaseMigrator.MigrateAsync(app.Services);
    }

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseCors();
    app.UseExceptionHandler();
    app.UseSerilogRequestLogging();
    app.MapDefaultEndpoints();
    app.MapAccessoryEndpoints();
    app.MapBrewerEndpoints();
    app.MapGrinderEndpoints();
    app.MapRoasterEndpoints();
    app.MapBeanEndpoints();
    app.MapCountryEndpoints();
    app.MapFlavorNoteEndpoints();
    app.MapRecipeEndpoints();
    app.MapFeatureEndpoints();
    app.MapBrewLogEndpoints();
    app.MapStatsEndpoints();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program;
