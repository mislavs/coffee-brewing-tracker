using CoffeeTracker.Domain.Exceptions;
using FluentAssertions;
using NetArchTest.Rules;
using Xunit;

namespace CoffeeTracker.Architecture.Tests;

public class DependencyTests
{
    [Fact]
    public void Domain_Should_Not_Reference_Infrastructure()
    {
        var result = Types.InAssembly(typeof(NotFoundException).Assembly)
            .ShouldNot()
            .HaveDependencyOn("CoffeeTracker.Infrastructure")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Domain_Should_Not_Reference_Application()
    {
        var result = Types.InAssembly(typeof(NotFoundException).Assembly)
            .ShouldNot()
            .HaveDependencyOn("CoffeeTracker.Application")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }
}
