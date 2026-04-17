using System.Net.Http.Headers;

namespace CoffeeTracker.Application.Common.Images;

public static class ImageMediaTypeParser
{
    public static bool TryParse(
        string? rawContentType,
        IReadOnlySet<string> supportedMediaTypes,
        out string canonicalMediaType)
    {
        canonicalMediaType = string.Empty;

        if (!MediaTypeHeaderValue.TryParse(rawContentType, out var parsedContentType) ||
            string.IsNullOrWhiteSpace(parsedContentType.MediaType))
        {
            return false;
        }

        canonicalMediaType = parsedContentType.MediaType.ToLowerInvariant();
        return supportedMediaTypes.Contains(canonicalMediaType);
    }
}
