namespace CoffeeTracker.Application.Features.Beans.Commands;

public static class BeanImageLimits
{
    public const int MaxImageSizeBytes = 5 * 1024 * 1024;
    public const long MaxRequestBodySizeBytes = MaxImageSizeBytes + (16 * 1024L);
}
