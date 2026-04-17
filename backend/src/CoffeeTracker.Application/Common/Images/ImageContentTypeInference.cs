namespace CoffeeTracker.Application.Common.Images;

public static class ImageContentTypeInference
{
    private static readonly IReadOnlyDictionary<string, string> DefaultContentTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [".png"] = "image/png",
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".webp"] = "image/webp"
        };

    private static readonly IReadOnlyDictionary<string, string> DefaultExtensions =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["image/png"] = ".png",
            ["image/jpeg"] = ".jpg",
            ["image/webp"] = ".webp"
        };

    public static string GetExtensionForMediaType(
        string mediaType,
        IEnumerable<KeyValuePair<string, string>>? additionalMappings = null)
    {
        if (TryGetMapping(DefaultExtensions, mediaType, out var extension))
        {
            return extension;
        }

        if (TryGetMapping(additionalMappings, mediaType, out extension))
        {
            return extension;
        }

        return ".img";
    }

    public static string GetContentTypeForFile(
        string fileName,
        IEnumerable<KeyValuePair<string, string>>? additionalMappings = null)
    {
        var extension = Path.GetExtension(fileName);
        if (TryGetMapping(DefaultContentTypes, extension, out var contentType))
        {
            return contentType;
        }

        if (TryGetMapping(additionalMappings, extension, out contentType))
        {
            return contentType;
        }

        return "application/octet-stream";
    }

    private static bool TryGetMapping(
        IEnumerable<KeyValuePair<string, string>>? mappings,
        string key,
        out string value)
    {
        value = string.Empty;

        if (mappings is null)
        {
            return false;
        }

        foreach (var mapping in mappings)
        {
            if (string.Equals(mapping.Key, key, StringComparison.OrdinalIgnoreCase))
            {
                value = mapping.Value;
                return true;
            }
        }

        return false;
    }
}
