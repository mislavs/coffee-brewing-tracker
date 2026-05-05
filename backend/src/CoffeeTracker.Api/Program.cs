using CoffeeTracker.Api.ExceptionHandlers;
using CoffeeTracker.Api.Endpoints;
using CoffeeTracker.Application;
using CoffeeTracker.Infrastructure;
using CoffeeTracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.ResponseCompression;
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
    builder.Services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
        options.Providers.Add<BrotliCompressionProvider>();
        options.Providers.Add<GzipCompressionProvider>();
        options.MimeTypes = ResponseCompressionDefaults.MimeTypes
            .Concat(["image/svg+xml"]);
    });

    if (builder.Environment.IsDevelopment())
    {
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
                policy.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader());
        });
    }

    var app = builder.Build();

    if (!app.Environment.IsDevelopment())
    {
        await DatabaseMigrator.MigrateAsync(app.Services);
    }

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseCors();
    }

    app.UseExceptionHandler();
    app.UseResponseCompression();

    var webRoot = app.Environment.WebRootPath;
    var spaIndex = string.IsNullOrEmpty(webRoot)
        ? null
        : Path.Combine(webRoot, "index.html");

    if (spaIndex is not null && File.Exists(spaIndex))
    {
        app.UseDefaultFiles();
        app.UseStaticFiles(new StaticFileOptions
        {
            OnPrepareResponse = ctx =>
            {
                if (ctx.Context.Request.Path.StartsWithSegments("/assets"))
                {
                    ctx.Context.Response.Headers.CacheControl =
                        "public, max-age=31536000, immutable";
                }
            }
        });
    }

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

    if (spaIndex is not null && File.Exists(spaIndex))
    {
        app.MapFallbackToFile("index.html");
    }

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
