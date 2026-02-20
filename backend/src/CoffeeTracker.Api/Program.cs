using CoffeeTracker.Api.Middleware;
using CoffeeTracker.Api.Endpoints;
using CoffeeTracker.Application;
using CoffeeTracker.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseMiddleware<ExceptionHandlerMiddleware>();
app.MapDefaultEndpoints();
app.MapAccessoryEndpoints();
app.MapBrewerEndpoints();
app.MapRoasterEndpoints();
app.MapBeanEndpoints();
app.MapCountryEndpoints();
app.MapFlavorNoteEndpoints();

app.Run();

public partial class Program;
