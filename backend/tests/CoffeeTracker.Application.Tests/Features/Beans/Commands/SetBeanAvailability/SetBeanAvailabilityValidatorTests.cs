using CoffeeTracker.Application.Features.Beans.Commands;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace CoffeeTracker.Application.Tests.Features.Beans.Commands.SetBeanAvailability;

public class SetBeanAvailabilityValidatorTests
{
    private readonly SetBeanAvailabilityValidator _validator = new();

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public void Validate_WhenReviewRatingIsOutsideRange_ReturnsValidationError(int rating)
    {
        var result = _validator.TestValidate(new SetBeanAvailabilityCommand(
            Guid.NewGuid(),
            false,
            new BeanAvailabilityReview(rating, null)));

        result.ShouldHaveValidationErrorFor(command => command.Review!.Rating);
    }

    [Fact]
    public void Validate_WhenReviewNotesAreTooLong_ReturnsValidationError()
    {
        var result = _validator.TestValidate(new SetBeanAvailabilityCommand(
            Guid.NewGuid(),
            false,
            new BeanAvailabilityReview(null, new string('x', 2001))));

        result.ShouldHaveValidationErrorFor(command => command.Review!.Notes);
    }

    [Fact]
    public void Validate_WhenReviewIsOmitted_DoesNotReturnReviewErrors()
    {
        var result = _validator.TestValidate(new SetBeanAvailabilityCommand(
            Guid.NewGuid(),
            false));

        result.IsValid.Should().BeTrue();
    }
}
