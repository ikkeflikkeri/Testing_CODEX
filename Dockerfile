# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0-preview AS build
WORKDIR /src

# Copy project files
COPY ["src/SocialNetwork.API/SocialNetwork.API.csproj", "src/SocialNetwork.API/"]
COPY ["src/SocialNetwork.Application/SocialNetwork.Application.csproj", "src/SocialNetwork.Application/"]
COPY ["src/SocialNetwork.Domain/SocialNetwork.Domain.csproj", "src/SocialNetwork.Domain/"]
COPY ["src/SocialNetwork.Infrastructure/SocialNetwork.Infrastructure.csproj", "src/SocialNetwork.Infrastructure/"]
COPY ["src/SocialNetwork.Shared/SocialNetwork.Shared.csproj", "src/SocialNetwork.Shared/"]

# Restore dependencies
RUN dotnet restore "src/SocialNetwork.API/SocialNetwork.API.csproj"

# Copy everything else
COPY . .

# Build
WORKDIR "/src/src/SocialNetwork.API"
RUN dotnet build "SocialNetwork.API.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "SocialNetwork.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0-preview AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SocialNetwork.API.dll"]
