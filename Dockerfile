FROM node:22-alpine AS frontend-deps
WORKDIR /frontend

COPY ["frontend/package.json", "frontend/package-lock.json", "./"]

RUN npm ci

FROM frontend-deps AS frontend-build
WORKDIR /frontend

COPY frontend/ ./

RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS backend-build
WORKDIR /src

COPY ["backend/CoffeeTracker.slnx", "./"]
COPY ["backend/src/CoffeeTracker.Api/CoffeeTracker.Api.csproj", "src/CoffeeTracker.Api/"]
COPY ["backend/src/CoffeeTracker.Application/CoffeeTracker.Application.csproj", "src/CoffeeTracker.Application/"]
COPY ["backend/src/CoffeeTracker.Domain/CoffeeTracker.Domain.csproj", "src/CoffeeTracker.Domain/"]
COPY ["backend/src/CoffeeTracker.Infrastructure/CoffeeTracker.Infrastructure.csproj", "src/CoffeeTracker.Infrastructure/"]
COPY ["backend/src/CoffeeTracker.ServiceDefaults/CoffeeTracker.ServiceDefaults.csproj", "src/CoffeeTracker.ServiceDefaults/"]

RUN dotnet restore "src/CoffeeTracker.Api/CoffeeTracker.Api.csproj"

COPY backend/src/ ./src/

RUN dotnet publish "src/CoffeeTracker.Api/CoffeeTracker.Api.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /frontend/dist ./wwwroot

USER app

ENTRYPOINT ["dotnet", "CoffeeTracker.Api.dll"]
