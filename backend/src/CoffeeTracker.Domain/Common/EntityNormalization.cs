namespace CoffeeTracker.Domain.Common;

public static class EntityNormalization
{
    public static Guid EnsureRequired(Guid value, string parameterName)
    {
        return value == Guid.Empty 
            ? throw new ArgumentException("Value is required.", parameterName) 
            : value;
    }

    public static string NormalizeRequired(string value, string parameterName)
    {
        return string.IsNullOrWhiteSpace(value) 
            ? throw new ArgumentException("Value is required.", parameterName) 
            : value.Trim();
    }

    public static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) 
            ? null 
            : value.Trim();
    }
}
