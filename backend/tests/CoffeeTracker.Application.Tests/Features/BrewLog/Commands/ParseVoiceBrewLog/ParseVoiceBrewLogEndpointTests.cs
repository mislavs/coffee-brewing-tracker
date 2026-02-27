using FluentAssertions;
using System.Net;
using System.Net.Http.Headers;

namespace CoffeeTracker.Application.Tests.Features.BrewLog.Commands.ParseVoiceBrewLog;

[Collection(nameof(IntegrationTestsCollection))]
public class ParseVoiceBrewLogEndpointTests(IntegrationTestFactory factory)
{
    [Fact]
    public async Task ParseVoiceBrewLog_WhenFeatureIsUnavailable_ReturnsNotImplemented()
    {
        // Arrange
        using var client = factory.CreateClient();
        using var formData = new MultipartFormDataContent();
        using var audioContent = new StreamContent(new MemoryStream([1, 2, 3, 4]));
        audioContent.Headers.ContentType = new MediaTypeHeaderValue("audio/webm");
        formData.Add(audioContent, "audioFile", "voice.webm");

        // Act
        var response = await client.PostAsync(
            "/api/brew-logs/parse-voice",
            formData,
            TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotImplemented);
    }
}
