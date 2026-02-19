using CoffeeTracker.Application.Features.FlavorNotes.Dtos;
using CoffeeTracker.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CoffeeTracker.Application.Features.FlavorNotes.Queries;

public sealed record GetFlavorNotesListQuery : IRequest<IReadOnlyList<FlavorNoteDto>>;

public sealed class GetFlavorNotesListHandler(ApplicationDbContext dbContext)
    : IRequestHandler<GetFlavorNotesListQuery, IReadOnlyList<FlavorNoteDto>>
{
    public async Task<IReadOnlyList<FlavorNoteDto>> Handle(
        GetFlavorNotesListQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.FlavorNotes
            .AsNoTracking()
            .OrderBy(entity => entity.Name)
            .Select(entity => new FlavorNoteDto(entity.Id, entity.Name))
            .ToListAsync(cancellationToken);
    }
}
