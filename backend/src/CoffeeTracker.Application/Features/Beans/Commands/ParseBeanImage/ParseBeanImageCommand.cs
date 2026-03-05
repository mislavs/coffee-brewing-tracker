using System.Globalization;
using CoffeeTracker.Application.Features.Beans.Dtos;
using CoffeeTracker.Domain.Enums;
using CoffeeTracker.Infrastructure.AI.Extraction;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.Beans.Commands.ParseBeanImage;

public sealed record ParseBeanImageCommand(
    Stream ImageStream,
    string ContentType) : IRequest<ParseBeanImageResult>;

public sealed class ParseBeanImageHandler(
    ApplicationDbContext dbContext,
    IBeanImageExtractionService beanImageExtractionService)
    : IRequestHandler<ParseBeanImageCommand, ParseBeanImageResult>
{
    public async Task<ParseBeanImageResult> Handle(
        ParseBeanImageCommand request,
        CancellationToken cancellationToken)
    {
        var extractionResult = await beanImageExtractionService.ExtractAsync(
            request.ImageStream,
            request.ContentType,
            cancellationToken);

        var unmatchedReferences = new List<string>();
        var unmatchedSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        AppendUnmatched(extractionResult.UnmatchedReferences, unmatchedReferences, unmatchedSet);

        var roasterId = await ResolveRoasterIdAsync(
            extractionResult.RoasterName,
            unmatchedReferences,
            unmatchedSet,
            cancellationToken);

        var knownCountryNames = await dbContext.Countries
            .AsNoTracking()
            .Select(entity => entity.Name)
            .ToListAsync(cancellationToken);
        
        var originCountries = ResolveKnownNames(
            extractionResult.OriginCountries,
            knownCountryNames,
            unmatchedReferences,
            unmatchedSet);

        var knownFlavorNoteNames = await dbContext.FlavorNotes
            .AsNoTracking()
            .Select(entity => entity.Name)
            .ToListAsync(cancellationToken);
        
        var flavorNotes = ResolveKnownNames(
            extractionResult.FlavorNotes,
            knownFlavorNoteNames,
            unmatchedReferences,
            unmatchedSet);

        var originType = originCountries.Count switch
        {
            0 => (OriginType?)null,
            1 => OriginType.SingleOrigin,
            _ => OriginType.Blend
        };

        var roastProfile = ParseEnumOrMarkUnmatched<RoastProfile>(
            extractionResult.RoastProfile,
            unmatchedReferences,
            unmatchedSet);
        
        var roastDate = ParseDateOnlyOrMarkUnmatched(
            extractionResult.RoastDate,
            unmatchedReferences,
            unmatchedSet);

        return new ParseBeanImageResult(
            BeanName: extractionResult.BeanName,
            RoasterId: roasterId,
            RoasterName: extractionResult.RoasterName,
            OriginType: originType,
            OriginCountries: originCountries,
            Variety: extractionResult.Variety,
            ProcessingMethod: extractionResult.ProcessingMethod,
            RoastProfile: roastProfile,
            RoastDate: roastDate,
            Altitude: extractionResult.Altitude,
            BagWeight: extractionResult.BagWeight,
            Price: extractionResult.Price,
            FlavorNotes: flavorNotes,
            UnmatchedReferences: unmatchedReferences);
    }

    private async Task<Guid?> ResolveRoasterIdAsync(
        string? roasterName,
        List<string> unmatchedReferences,
        HashSet<string> unmatchedSet,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(roasterName))
        {
            return null;
        }

        var normalizedRoasterName = roasterName.Trim();
        var roaster = await dbContext.Roasters
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entity => EF.Functions.ILike(entity.Name, normalizedRoasterName),
                cancellationToken);

        if (roaster is null)
        {
            AppendUnmatched([normalizedRoasterName], unmatchedReferences, unmatchedSet);
            return null;
        }

        return roaster.Id;
    }

    private static List<string> ResolveKnownNames(
        IEnumerable<string>? extractedNames,
        IReadOnlyCollection<string> knownNames,
        List<string> unmatchedReferences,
        HashSet<string> unmatchedSet)
    {
        if (extractedNames is null)
        {
            return [];
        }

        var knownNameLookup = knownNames
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToDictionary(name => name, name => name, StringComparer.OrdinalIgnoreCase);

        var resolved = new List<string>();
        foreach (var rawName in extractedNames)
        {
            if (string.IsNullOrWhiteSpace(rawName))
            {
                continue;
            }

            var normalizedName = rawName.Trim();
            if (knownNameLookup.TryGetValue(normalizedName, out var canonicalName))
            {
                resolved.Add(canonicalName);
            }
            else
            {
                AppendUnmatched([normalizedName], unmatchedReferences, unmatchedSet);
            }
        }

        return resolved
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static TEnum? ParseEnumOrMarkUnmatched<TEnum>(
        string? rawValue,
        List<string> unmatchedReferences,
        HashSet<string> unmatchedSet)
        where TEnum : struct, Enum
    {
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            return null;
        }

        var normalizedValue = rawValue.Trim();
        if (Enum.TryParse<TEnum>(normalizedValue, ignoreCase: true, out var parsedValue) &&
            Enum.IsDefined(parsedValue))
        {
            return parsedValue;
        }

        AppendUnmatched([normalizedValue], unmatchedReferences, unmatchedSet);
        return null;
    }

    private static DateOnly? ParseDateOnlyOrMarkUnmatched(
        string? rawDate,
        List<string> unmatchedReferences,
        HashSet<string> unmatchedSet)
    {
        if (string.IsNullOrWhiteSpace(rawDate))
        {
            return null;
        }

        var normalizedDate = rawDate.Trim();

        if (DateOnly.TryParse(normalizedDate, CultureInfo.InvariantCulture, DateTimeStyles.AllowWhiteSpaces, out var parsedDate) ||
            DateOnly.TryParse(normalizedDate, out parsedDate))
        {
            return parsedDate;
        }

        AppendUnmatched([normalizedDate], unmatchedReferences, unmatchedSet);
        return null;
    }

    private static void AppendUnmatched(
        IEnumerable<string>? values,
        List<string> unmatchedReferences,
        HashSet<string> unmatchedSet)
    {
        if (values is null)
        {
            return;
        }

        foreach (var value in values)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            var normalized = value.Trim();
            if (unmatchedSet.Add(normalized))
            {
                unmatchedReferences.Add(normalized);
            }
        }
    }
}
