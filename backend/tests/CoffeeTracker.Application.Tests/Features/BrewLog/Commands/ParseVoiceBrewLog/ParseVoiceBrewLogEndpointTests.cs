using CoffeeTracker.Application.Features.BrewLog.Commands.ParseVoiceBrewLog;
using CoffeeTracker.Application.Features.BrewLog.Dtos;
using CoffeeTracker.Infrastructure.AI;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Net.Http.Json;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.ParseVoiceBrewLog;

[Collection(nameof(IntegrationTestsCollection))]
public class ParseVoiceBrewLogEndpointTests(IntegrationTestFactory factory)
{
    [Fact]
    public async Task ParseVoiceBrewLog_WhenFeatureIsUnavailable_ReturnsNotImplemented()
    {
        // Arrange
        using var client = CreateClientWithVoiceFeatureAvailability(false);
        using var formData = CreateAudioFormData("audio/webm");

        // Act
        var response = await client.PostAsync(
            "/api/brew-logs/parse-voice",
            formData,
            TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotImplemented);
    }

    [Theory]
    [InlineData("audio/webm;codecs=opus")]
    [InlineData("audio/ogg;codecs=opus")]
    public async Task ParseVoiceBrewLog_WhenContentTypeHasParameters_ReturnsOk(string contentType)
    {
        // Arrange
        using var client = CreateClientWithVoiceFeatureAvailability(true);
        using var formData = CreateAudioFormData(contentType);

        // Act
        var response = await client.PostAsync(
            "/api/brew-logs/parse-voice",
            formData,
            TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ParseVoiceBrewLog_WhenContentTypeIsMalformed_ReturnsBadRequestProblem()
    {
        // Arrange
        using var client = CreateClientWithVoiceFeatureAvailability(true);
        using var formData = CreateAudioFormData("not-a-media-type");

        // Act
        var response = await client.PostAsync(
            "/api/brew-logs/parse-voice",
            formData,
            TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>(
            cancellationToken: TestContext.Current.CancellationToken);
        problem.Should().NotBeNull();
        problem!.Title.Should().Be("Unsupported audio MIME type");
    }

    private HttpClient CreateClientWithVoiceFeatureAvailability(bool isVoiceBrewLogParsingAvailable)
    {
        return factory.WithWebHostBuilder(builder =>
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IAiFeatureAvailability>();
                services.AddSingleton<IAiFeatureAvailability>(
                    new StubAiFeatureAvailability(isVoiceBrewLogParsingAvailable));

                services.RemoveAll<IRequestHandler<ParseVoiceBrewLogCommand, ParseVoiceBrewLogResult>>();
                services.AddTransient<IRequestHandler<ParseVoiceBrewLogCommand, ParseVoiceBrewLogResult>, StubParseVoiceBrewLogHandler>();
            }))
            .CreateClient();
    }

    private static MultipartFormDataContent CreateAudioFormData(string contentType)
    {
        var formData = new MultipartFormDataContent();
        var audioContent = new StreamContent(new MemoryStream([1, 2, 3, 4]));
        audioContent.Headers.TryAddWithoutValidation("Content-Type", contentType);
        formData.Add(audioContent, "audioFile", "voice.webm");
        return formData;
    }

    private sealed class StubAiFeatureAvailability(bool isVoiceBrewLogParsingAvailable) : IAiFeatureAvailability
    {
        public bool IsVoiceBrewLogParsingAvailable { get; } = isVoiceBrewLogParsingAvailable;
    }

    private sealed class StubParseVoiceBrewLogHandler
        : IRequestHandler<ParseVoiceBrewLogCommand, ParseVoiceBrewLogResult>
    {
        public Task<ParseVoiceBrewLogResult> Handle(
            ParseVoiceBrewLogCommand request,
            CancellationToken cancellationToken) =>
            Task.FromResult(ParseVoiceBrewLogResult.Empty);
    }
}
