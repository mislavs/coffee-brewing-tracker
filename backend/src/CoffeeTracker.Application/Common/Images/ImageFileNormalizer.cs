namespace CoffeeTracker.Application.Common.Images;

public static class ImageFileNormalizer
{
    private const int MaxFileNameLength = 255;

    public static string Normalize(string rawFileName, string extension, string defaultBaseName)
    {
        var normalizedExtension = string.IsNullOrWhiteSpace(extension)
            ? throw new ArgumentException("Value is required.", nameof(extension))
            : extension.Trim();
        var normalizedDefaultBaseName = string.IsNullOrWhiteSpace(defaultBaseName)
            ? throw new ArgumentException("Value is required.", nameof(defaultBaseName))
            : defaultBaseName.Trim();

        var fileName = rawFileName.Replace('\\', '/');
        var name = Path.GetFileNameWithoutExtension(Path.GetFileName(fileName));
        if (string.IsNullOrWhiteSpace(name))
        {
            name = normalizedDefaultBaseName;
        }

        var maxNameLength = MaxFileNameLength - normalizedExtension.Length;
        if (name.Length > maxNameLength)
        {
            name = name[..maxNameLength];
        }

        return $"{name}{normalizedExtension}";
    }
}
