#!/bin/bash

# Comprehensive Test Runner Script

set -e

echo "=== Running All Tests ==="

# Navigate to solution directory
cd "$(dirname "$0")/.."

# Restore dependencies
echo "Restoring dependencies..."
dotnet restore

# Build solution
echo "Building solution..."
dotnet build --no-restore --configuration Release

# Run unit tests with coverage
echo "Running unit tests..."
dotnet test tests/SocialNetwork.UnitTests \
    --no-build \
    --configuration Release \
    --verbosity normal \
    --collect:"XPlat Code Coverage" \
    --results-directory ./TestResults

# Run integration tests
echo "Running integration tests..."
dotnet test tests/SocialNetwork.IntegrationTests \
    --no-build \
    --configuration Release \
    --verbosity normal \
    --results-directory ./TestResults

# Generate coverage report
if command -v reportgenerator &> /dev/null; then
    echo "Generating coverage report..."
    reportgenerator \
        "-reports:./TestResults/*/coverage.cobertura.xml" \
        "-targetdir:./TestResults/CoverageReport" \
        "-reporttypes:Html;HtmlSummary"

    echo "Coverage report generated at: ./TestResults/CoverageReport/index.html"
fi

echo "=== All Tests Complete ==="
