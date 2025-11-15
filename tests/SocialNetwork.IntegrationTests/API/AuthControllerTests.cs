using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using SocialNetwork.Shared.DTOs;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace SocialNetwork.IntegrationTests.API;

public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_ValidUser_ReturnsTokens()
    {
        // Arrange
        var registerDto = new RegisterUserDto(
            $"test{Guid.NewGuid()}@example.com",
            "Password123!",
            "John",
            "Doe",
            $"johndoe{Guid.NewGuid().ToString().Substring(0, 8)}",
            new DateTime(1990, 1, 1)
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<TokenResponseDto>();
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Register_InvalidEmail_ReturnsBadRequest()
    {
        // Arrange
        var registerDto = new RegisterUserDto(
            "invalid-email",
            "Password123!",
            "John",
            "Doe",
            "johndoe",
            null
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsTokens()
    {
        // Arrange
        var email = $"test{Guid.NewGuid()}@example.com";
        var password = "Password123!";
        var userName = $"user{Guid.NewGuid().ToString().Substring(0, 8)}";

        var registerDto = new RegisterUserDto(email, password, "John", "Doe", userName, null);
        await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        var loginDto = new LoginDto(email, password);

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<TokenResponseDto>();
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var loginDto = new LoginDto("nonexistent@example.com", "WrongPassword123!");

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
