namespace CoffeeTracker.Application.Features.Roasters.Commands;

public static class RoasterLogoLimits
{
    public const int MaxLogoSizeBytes = 512 * 1024;
    public const long MaxRequestBodySizeBytes = MaxLogoSizeBytes + (16 * 1024L);
}
