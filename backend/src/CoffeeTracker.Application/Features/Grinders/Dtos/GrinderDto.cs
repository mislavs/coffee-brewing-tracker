namespace CoffeeTracker.Application.Features.Grinders.Dtos;

public sealed record GrinderDto(
    Guid Id,
    string Name,
    int TotalBrews,
    decimal TotalCoffeeGround,
    string? MostCommonGrindSetting,
    string? GrindSettingMin,
    string? GrindSettingMax,
    string? BestRatedGrindSetting);
