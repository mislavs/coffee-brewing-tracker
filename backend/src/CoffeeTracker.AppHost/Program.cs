var builder = DistributedApplication.CreateBuilder(args);

var pgPassword = builder.AddParameter("postgres-db-password", secret: true);

var postgres = builder.AddPostgres("postgres-db", password: pgPassword)
    .WithDataVolume()
    .WithPgWeb(resource => resource.WithUrlForEndpoint("http", u => u.DisplayText = "PG Web"))
    .WithLifetime(ContainerLifetime.Persistent);

var appDb = postgres.AddDatabase("coffee-brewing-db");

var migrations = builder.AddProject<Projects.CoffeeTracker_MigrationService>("migrations")
    .WithReference(appDb, "DefaultConnection")
    .WaitFor(appDb);

var api = builder.AddProject<Projects.CoffeeTracker_Api>("api")
    .WithReference(appDb, "DefaultConnection")
    .WaitFor(migrations)
    .WithHttpHealthCheck("/health");

builder.AddViteApp("frontend", "../../../frontend")
    .WithReference(api)
    .WithExternalHttpEndpoints()
    .WithEnvironment("VITE_API_URL", api.GetEndpoint("http"));

builder.Build().Run();
