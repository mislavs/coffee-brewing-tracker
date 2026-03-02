using CoffeeTracker.Application.Features.BrewLog.Dtos;
using CoffeeTracker.Infrastructure.AI;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;

namespace CoffeeTracker.Application.Features.BrewLog.Commands.ParseVoiceBrewLog;

public sealed record ParseVoiceBrewLogCommand(
    Stream AudioStream) : IRequest<ParseVoiceBrewLogResult>;

public sealed class ParseVoiceBrewLogHandler(
    ApplicationDbContext dbContext,
    ISpeechToTextClient speechToTextClient,
    IBrewLogExtractionService brewLogExtractionService)
    : IRequestHandler<ParseVoiceBrewLogCommand, ParseVoiceBrewLogResult>
{
    public async Task<ParseVoiceBrewLogResult> Handle(
        ParseVoiceBrewLogCommand request,
        CancellationToken cancellationToken)
    {
        var transcriptResponse = await speechToTextClient.GetTextAsync(
            request.AudioStream,
            cancellationToken: cancellationToken);
        var transcript = transcriptResponse.Text?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(transcript))
        {
            return ParseVoiceBrewLogResult.Empty;
        }

        var entityCatalog = await BuildEntityCatalog(cancellationToken);
        var extractionResult = await brewLogExtractionService.ExtractAsync(
            transcript,
            entityCatalog,
            cancellationToken);

        return new ParseVoiceBrewLogResult(
            Transcript: transcript,
            BeanId: extractionResult.BeanId,
            BeanName: extractionResult.BeanName,
            BrewerId: extractionResult.BrewerId,
            BrewerName: extractionResult.BrewerName,
            GrinderId: extractionResult.GrinderId,
            GrinderName: extractionResult.GrinderName,
            RecipeId: extractionResult.RecipeId,
            RecipeName: extractionResult.RecipeName,
            AccessoryIds: extractionResult.AccessoryIds,
            AccessoryNames: extractionResult.AccessoryNames,
            Dose: extractionResult.Dose,
            WaterAmount: extractionResult.WaterAmount,
            WaterTemperature: extractionResult.WaterTemperature,
            GrindSize: extractionResult.GrindSize,
            BrewTimeSeconds: extractionResult.BrewTimeSeconds,
            Rating: extractionResult.Rating,
            Notes: extractionResult.Notes,
            AdjustmentIdeas: extractionResult.AdjustmentIdeas,
            BrewedAt: extractionResult.BrewedAt,
            UnmatchedReferences: extractionResult.UnmatchedReferences);
    }

    private async Task<EntityCatalog> BuildEntityCatalog(CancellationToken cancellationToken)
    {
        var beans = await dbContext.Beans
            .AsNoTracking()
            .Where(entity => entity.IsAvailable)
            .OrderBy(entity => entity.Name)
            .Select(entity => new EntityRef(entity.Id, entity.Name))
            .ToListAsync(cancellationToken);

        var brewers = await dbContext.Brewers
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new EntityRef(entity.Id, entity.Name))
            .ToListAsync(cancellationToken);

        var grinders = await dbContext.Grinders
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new EntityRef(entity.Id, entity.Name))
            .ToListAsync(cancellationToken);

        var recipes = await dbContext.Recipes
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new EntityRef(entity.Id, entity.Name))
            .ToListAsync(cancellationToken);

        var accessories = await dbContext.Accessories
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new EntityRef(entity.Id, entity.Name))
            .ToListAsync(cancellationToken);

        return new EntityCatalog(beans, brewers, grinders, recipes, accessories);
    }
}
