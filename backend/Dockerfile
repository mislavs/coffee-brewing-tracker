FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["CoffeeTracker.slnx", "./"]
COPY ["src/CoffeeTracker.Api/CoffeeTracker.Api.csproj", "src/CoffeeTracker.Api/"]
COPY ["src/CoffeeTracker.Application/CoffeeTracker.Application.csproj", "src/CoffeeTracker.Application/"]
COPY ["src/CoffeeTracker.Domain/CoffeeTracker.Domain.csproj", "src/CoffeeTracker.Domain/"]
COPY ["src/CoffeeTracker.Infrastructure/CoffeeTracker.Infrastructure.csproj", "src/CoffeeTracker.Infrastructure/"]
COPY ["src/CoffeeTracker.ServiceDefaults/CoffeeTracker.ServiceDefaults.csproj", "src/CoffeeTracker.ServiceDefaults/"]

RUN dotnet restore "src/CoffeeTracker.Api/CoffeeTracker.Api.csproj"

COPY src/ ./src/

RUN dotnet publish "src/CoffeeTracker.Api/CoffeeTracker.Api.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

COPY --from=build /app/publish ./

USER app

ENTRYPOINT ["dotnet", "CoffeeTracker.Api.dll"]
