using CoffeeTracker.Application.Common.Images;
using CoffeeTracker.Domain.Exceptions;
using CoffeeTracker.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Commands;

public sealed record UploadBeanImageCommand(
    Guid Id,
    string FileName,
    string ContentType,
    byte[] ImageData) : IRequest;

public sealed class UploadBeanImageValidator : AbstractValidator<UploadBeanImageCommand>
{
    private static readonly HashSet<string> SupportedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/png",
        "image/jpeg",
        "image/webp"
    };

    public UploadBeanImageValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        RuleFor(command => command.FileName)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(command => command.ContentType)
            .NotEmpty()
            .Must(contentType => SupportedContentTypes.Contains(contentType))
            .WithMessage("Bean image must be a PNG, JPEG, or WebP image.");

        RuleFor(command => command.ImageData)
            .NotNull()
            .Must(data => data.Length > 0)
            .WithMessage("Bean image cannot be empty.")
            .Must(data => data.Length <= BeanImageLimits.MaxImageSizeBytes)
            .WithMessage("Bean image must be 5 MB or smaller.");
    }
}

public sealed class UploadBeanImageHandler(ApplicationDbContext dbContext)
    : IRequestHandler<UploadBeanImageCommand>
{
    public async Task Handle(UploadBeanImageCommand request, CancellationToken cancellationToken)
    {
        var extension = ImageContentTypeInference.GetExtensionForMediaType(request.ContentType);
        var fileName = ImageFileNormalizer.Normalize(request.FileName, extension, "bean-image");

        var rowsAffected = await dbContext.Beans
            .Where(entity => entity.Id == request.Id)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(entity => entity.ImageFileName, fileName)
                    .SetProperty(entity => entity.ImageData, request.ImageData),
                cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException($"Bean '{request.Id}' was not found.");
        }
    }
}
