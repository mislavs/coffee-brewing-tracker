using CoffeeTracker.Application.Features.Beans.Commands.ParseBeanImage;
using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Infrastructure.AI;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Net.Http.Json;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.ParseBeanImage;

[Collection(nameof(IntegrationTestsCollection))]
public class ParseBeanImageEndpointTests(IntegrationTestFactory factory)
{
    [Fact]
    public async Task ParseBeanImage_WhenFeatureIsUnavailable_ReturnsNotImplemented()
    {
        // Arrange
        using var client = CreateClientWithImageFeatureAvailability(false);
        using var formData = CreateImageFormData("image/png", [1, 2, 3]);

        // Act
        var response = await client.PostAsync(
            "/api/beans/parse-image",
            formData,
            TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotImplemented);
    }

    [Fact]
    public async Task ParseBeanImage_WhenMimeTypeIsUnsupported_ReturnsBadRequestProblem()
    {
        // Arrange
        using var client = CreateClientWithImageFeatureAvailability(true);
        using var formData = CreateImageFormData("image/gif", [1, 2, 3]);

        // Act
        var response = await client.PostAsync(
            "/api/beans/parse-image",
            formData,
            TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>(
            cancellationToken: TestContext.Current.CancellationToken);
        problem.Should().NotBeNull();
        problem!.Title.Should().Be("Unsupported image MIME type");
    }

    [Fact]
    public async Task ParseBeanImage_WhenFileIsTooLarge_ReturnsBadRequestProblem()
    {
        // Arrange
        using var client = CreateClientWithImageFeatureAvailability(true);
        using var formData = CreateImageFormData("image/jpeg", new byte[10 * 1024 * 1024 + 1]);

        // Act
        var response = await client.PostAsync(
            "/api/beans/parse-image",
            formData,
            TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>(
            cancellationToken: TestContext.Current.CancellationToken);
        problem.Should().NotBeNull();
        problem!.Title.Should().Be("Image file is too large");
    }

    [Theory]
    [InlineData("image/png")]
    [InlineData("image/jpeg")]
    [InlineData("image/webp")]
    [InlineData("image/jpeg; charset=binary")]
    public async Task ParseBeanImage_WhenInputIsValid_ReturnsOk(string contentType)
    {
        // Arrange
        using var client = CreateClientWithImageFeatureAvailability(true);
        using var formData = CreateImageFormData(contentType, [1, 2, 3, 4]);

        // Act
        var response = await client.PostAsync(
            "/api/beans/parse-image",
            formData,
            TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private HttpClient CreateClientWithImageFeatureAvailability(bool isImageBeanParsingAvailable)
    {
        return factory.WithWebHostBuilder(builder =>
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IAiFeatureAvailability>();
                services.AddSingleton<IAiFeatureAvailability>(
                    new StubAiFeatureAvailability(isImageBeanParsingAvailable));

                services.RemoveAll<IRequestHandler<ParseBeanImageCommand, ParseBeanImageResult>>();
                services.AddTransient<IRequestHandler<ParseBeanImageCommand, ParseBeanImageResult>, StubParseBeanImageHandler>();
            }))
            .CreateClient();
    }

    private static MultipartFormDataContent CreateImageFormData(string contentType, byte[] bytes)
    {
        var formData = new MultipartFormDataContent();
        var imageContent = new StreamContent(new MemoryStream(bytes));
        imageContent.Headers.TryAddWithoutValidation("Content-Type", contentType);
        formData.Add(imageContent, "imageFile", "bean-label.png");
        return formData;
    }

    private sealed class StubAiFeatureAvailability(bool isImageBeanParsingAvailable) : IAiFeatureAvailability
    {
        public bool IsImageBeanParsingAvailable { get; } = isImageBeanParsingAvailable;

        public bool IsVoiceBrewLogParsingAvailable { get; } = false;
    }

    private sealed class StubParseBeanImageHandler
        : IRequestHandler<ParseBeanImageCommand, ParseBeanImageResult>
    {
        public Task<ParseBeanImageResult> Handle(
            ParseBeanImageCommand request,
            CancellationToken cancellationToken) =>
            Task.FromResult(ParseBeanImageResult.Empty);
    }
}
