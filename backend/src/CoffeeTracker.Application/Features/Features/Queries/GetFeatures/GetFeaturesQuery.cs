using CoffeeTracker.Infrastructure.AI;
using MediatR;

namespace CoffeeTracker.Application.Features.Features.Queries.GetFeatures;

public sealed record GetFeaturesQuery : IRequest<FeaturesDto>;

public sealed class GetFeaturesHandler(IAiFeatureAvailability aiFeatureAvailability)
    : IRequestHandler<GetFeaturesQuery, FeaturesDto>
{
    public Task<FeaturesDto> Handle(GetFeaturesQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new FeaturesDto(aiFeatureAvailability.IsVoiceBrewLogParsingAvailable));
    }
}
