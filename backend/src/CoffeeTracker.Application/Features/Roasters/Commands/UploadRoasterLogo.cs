using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Roasters.Commands;

public sealed record UploadRoasterLogoCommand(
    Guid Id,
    string FileName,
    string ContentType,
    byte[] LogoData) : IRequest;

public sealed class UploadRoasterLogoValidator : AbstractValidator<UploadRoasterLogoCommand>
{
    private const int MaxLogoSizeBytes = 512 * 1024;

    private static readonly HashSet<string> SupportedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/svg+xml"
    };

    public UploadRoasterLogoValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.FileName)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(command => command.ContentType)
            .NotEmpty()
            .Must(contentType => SupportedContentTypes.Contains(contentType))
            .WithMessage("Logo must be a PNG, JPEG, WebP, or SVG image.");

        RuleFor(command => command.LogoData)
            .NotNull()
            .Must(data => data.Length > 0)
            .WithMessage("Logo image cannot be empty.")
            .Must(data => data.Length <= MaxLogoSizeBytes)
            .WithMessage("Logo image must be 512 KB or smaller.");
    }
}

public sealed class UploadRoasterLogoHandler(ApplicationDbContext dbContext)
    : IRequestHandler<UploadRoasterLogoCommand>
{
    public async Task Handle(UploadRoasterLogoCommand request, CancellationToken cancellationToken)
    {
        var roaster = await dbContext.Roasters
            .FirstOrDefaultAsync(entity => entity.Id == request.Id, cancellationToken);

        if (roaster is null)
        {
            throw new NotFoundException($"Roaster '{request.Id}' was not found.");
        }

        var normalizedFileName = NormalizeLogoFileName(request.FileName, request.ContentType);
        roaster.SetLogo(normalizedFileName, request.LogoData);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string NormalizeLogoFileName(string fileName, string contentType)
    {
        var name = Path.GetFileNameWithoutExtension(Path.GetFileName(fileName));
        if (string.IsNullOrWhiteSpace(name))
        {
            name = "roaster-logo";
        }

        var extension = contentType.ToLowerInvariant() switch
        {
            "image/png" => ".png",
            "image/jpeg" => ".jpg",
            "image/webp" => ".webp",
            "image/svg+xml" => ".svg",
            _ => ".img"
        };

        var maxNameLength = 255 - extension.Length;
        if (name.Length > maxNameLength)
        {
            name = name[..maxNameLength];
        }

        return $"{name}{extension}";
    }
}
