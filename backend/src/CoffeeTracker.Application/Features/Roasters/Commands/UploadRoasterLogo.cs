using CoffeeTracker.Application.Common.Images;
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
            .Must(data => data.Length <= RoasterLogoLimits.MaxLogoSizeBytes)
            .WithMessage("Logo image must be 512 KB or smaller.");
    }
}

public sealed class UploadRoasterLogoHandler(ApplicationDbContext dbContext)
    : IRequestHandler<UploadRoasterLogoCommand>
{
    private static readonly KeyValuePair<string, string>[] AdditionalExtensionMappings =
    [
        new("image/svg+xml", ".svg")
    ];

    public async Task Handle(UploadRoasterLogoCommand request, CancellationToken cancellationToken)
    {
        var extension = ImageContentTypeInference.GetExtensionForMediaType(
            request.ContentType,
            AdditionalExtensionMappings);
        var fileName = ImageFileNormalizer.Normalize(request.FileName, extension, "roaster-logo");

        var rowsAffected = await dbContext.Roasters
            .Where(entity => entity.Id == request.Id)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(entity => entity.LogoFileName, fileName)
                    .SetProperty(entity => entity.LogoData, request.LogoData),
                cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException($"Roaster '{request.Id}' was not found.");
        }
    }
}
