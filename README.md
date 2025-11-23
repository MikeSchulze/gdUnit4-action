# GdUnit4 Action

<div align="center">

[![License](https://img.shields.io/github/license/MikeSchulze/gdunit4-action)](https://github.com/MikeSchulze/gdunit4-action/blob/master/LICENSE)
[![GitHub release badge](https://badgen.net/github/release/MikeSchulze/gdunit4-action/stable)](https://github.com/MikeSchulze/gdunit4-action/releases/latest)
[![CI/CD](https://github.com/MikeSchulze/gdunit4-action/actions/workflows/ci-dev.yml/badge.svg)](https://github.com/MikeSchulze/gdunit4-action/actions/workflows/ci-master.yml)
[![Discord](https://img.shields.io/discord/885149082119733269?label=discord)](https://img.shields.io/discord/885149082119733269)

</div>

This GitHub Action automates the execution of GdUnit4 (GDScript) and GdUnit4Net (CSharpScript) unit tests within the Godot Engine 4.x environment. It provides flexibility in configuring the Godot version, GdUnit4 version, test paths, and other parameters to suit your testing needs.

## Table of Contents

* [Requirements](#requirements)
* [Quick Start](#quick-start)
* [Usage](#usage)
* [Configuration](#configuration)
* [Examples](#examples)
* [Troubleshooting](#troubleshooting)
* [Performance Optimization](#performance-optimization)
* [Contributing](#contributing)
* [License](#license)
* [Security](#security)
* [FAQ](#faq)

## Requirements

### Godot Compatibility
- Godot 4.x (4.0.0 and above)
- Both standard and .NET versions supported
- Tested with stable, RC, and dev builds

### For C# Testing
- .NET SDK 7.0 or 8.0
- Godot .NET version

### System Requirements
- GitHub Actions runner (Ubuntu latest recommended)
- Git with LFS support for larger projects

## Quick Start

Basic GDScript testing:
```yaml
name: GdUnit4 Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: MikeSchulze/gdunit4-action@v1
        with:
          godot-version: '4.2.1'
          paths: 'res://tests'
```

## Usage

The action can be configured using various inputs to suit your testing needs. Here's a basic usage pattern:

```yaml
- uses: MikeSchulze/gdunit4-action@v1
  with:
    godot-version: '4.2.1'       # Required: Godot version to use
    paths: 'res://tests'         # Required: Test directory
    timeout: 10                  # Optional: Test timeout in minutes
    version: 'latest'            # Optional: GdUnit4 version
```

## Configuration

### Essential Parameters

| Parameter        | Required | Default | Description |
|-----------------|----------|---------|-------------|
| paths           | Yes      |         | Test directories (comma/newline-separated) |

### Godot Configuration

| Parameter        | Required | Default | Description                                 |
|-----------------|----------|---------|---------------------------------------------|
| godot-version   | Yes      |         | Godot version (e.g., "4.2.1")               |
| godot-status    | No       | stable  | Godot status (stable/rc1/dev1)              |
| godot-net       | No       | false   | Enable Godot .NET for C# tests              |
| godot-force-mono| No       | false   | Force using Godot Net to run GDScript tests |

### .NET Configuration

| Parameter          | Required | Default | Description |
|-------------------|----------|---------|-------------|
| dotnet-version    | No       | net8.0  | .NET version (net7.0/net8.0) |
| console-verbosity | No       | normal  | Console logger verbosity for C# tests (quiet/minimal/normal/detailed/diagnostic) |

### Test Configuration

| Parameter       | Required | Default | Description                                  |
|----------------|----------|---------|----------------------------------------------|
| version        | No       | latest  | The GdUnit4 version to use (GDScript plugin) |
| timeout        | No       | 10      | Test timeout (minutes)                       |
| retries        | No       | 0       | Number of retry attempts                     |
| arguments      | No       |         | Additional GdUnit4 arguments                 |
| warnings-as-errors| No       | false   | Treat test warnings as errors |
### Reporting Configuration

| Parameter       | Required | Default | Description |
|----------------|----------|---------|-------------|
| publish-report | No       | true    | Enable test report publishing |
| upload-report  | No       | true    | Enable report artifact upload |
| report-name    | No       | test-report.xml | Report filename |

## Examples

### Basic GDScript Testing
```yaml
- uses: MikeSchulze/gdunit4-action@v1
  with:
    godot-version: '4.2.1'
    paths: 'res://tests'
```

### Testing with Warnings threaded as Errors
```yaml
- uses: MikeSchulze/gdunit4-action@v1
  with:
     godot-version: '4.2.1'
     paths: 'res://tests'
     warnings-as-errors: true  # Fail the build on test warnings
```

### C# Testing with .NET 8.0
```yaml
- uses: MikeSchulze/gdunit4-action@v1
  with:
    godot-version: '4.2.1'
    godot-net: true
    paths: 'res://tests'
    console-verbosity: 'detailed'  # Optional: increase output detail
```

### Matrix Testing
```yaml
jobs:
  test:
    strategy:
      matrix:
        godot-version: ['4.1.3', '4.2.1']
        dotnet-version: ['net7.0', 'net8.0']
    steps:
      - uses: MikeSchulze/gdunit4-action@v1
        with:
          godot-version: ${{ matrix.godot-version }}
          godot-net: true
          dotnet-version: ${{ matrix.dotnet-version }}
          paths: 'res://tests'
```

### Testing with Retries and Custom Arguments
```yaml
- uses: MikeSchulze/gdunit4-action@v1
  with:
    godot-version: '4.2.1'
    paths: 'res://tests'
    retries: 3
    arguments: '--verbose --fail-fast'
```

### Custom Project Structure
For projects with non-standard layout:
```bash
root/
  ├── MyProject/
  │   ├── src/
  │   └── tests/
```

```yaml
- uses: MikeSchulze/gdunit4-action@v1
  with:
    godot-version: '4.2.1'
    project_dir: './MyProject/'
    paths: 'res://tests'
```

## Troubleshooting

### Common Issues

1. **Test Discovery Failures**
    - Ensure test paths are correct and use `res://` prefix
    - Check file permissions on test directories

2. **C# Test Issues**
    - Verify correct .NET SDK version
    - Check Godot .NET compatibility
    - Ensure proper project structure

3. **Timeout Issues**
    - Increase timeout value for large test suites
    - Consider splitting tests across multiple jobs

### Debug Logging

For GDScript tests, enable verbose output by adding `--verbose` to the arguments:
```yaml
arguments: '--verbose'
```

For C# tests, control console output verbosity with `console-verbosity`:
```yaml
godot-net: true
console-verbosity: 'detailed'  # Options: quiet, minimal, normal, detailed, diagnostic
arguments: '--verbose'          # For Godot engine debug output
```

## Performance Optimization

### Caching
The action automatically caches:
- Godot binaries
- .NET packages
- Project cache

### Best Practices
1. Use specific versions instead of 'latest'
2. Optimize test discovery paths
3. Implement parallel test execution where possible
4. Use appropriate timeout values

## Security

### Fork Considerations
When running tests from forked repositories:
1. Set `publish-report: false` to avoid permission issues
2. Use custom `report-name` for artifact identification
3. Be cautious with sensitive test data

## FAQ

### Q: Which Godot versions are supported?
A: All Godot 4.x versions are supported, including stable, RC, and dev builds.

### Q: Can I test both GDScript and C# in the same workflow?
A: Yes, use separate jobs or matrix testing with different configurations.

### Q: How do I handle flaky tests?
A: Use the `retries` parameter to automatically retry failed tests.

### Q: How do I handle test warnings?
A: By default, warnings will be reported but won't fail the build. Use `warnings-as-errors: true` to treat warnings as failures.

### Related Projects

- [GdUnit4](https://github.com/MikeSchulze/gdUnit4)
- [Godot Engine](https://godotengine.org)

## Contributing

We welcome contributions! Please see our [contribution guidelines](CONTRIBUTING.md) for details.

### You're Welcome To

* [Give Feedback](https://github.com/MikeSchulze/gdunit4-action/discussions)
* [Suggest Improvements](https://github.com/MikeSchulze/gdunit4-action/issues/new?assignees=MikeSchulze&labels=enhancement&template=feature_request.md&title=)
* [Report Bugs](https://github.com/MikeSchulze/gdunit4-action/issues/new?assignees=MikeSchulze&labels=bug&projects=projects%2F5&template=bug_report.yml&title=GD-XXX%3A+Describe+the+issue+briefly)
* Join our [Discord Server](https://discord.gg/rdq36JwuaJ)

## License

This project is released under the [MIT License](./LICENSE).

## Contributors

<a href="https://github.com/MikeSchulze/gdUnit4-action/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MikeSchulze/gdUnit4-action" alt="Contributors" />
</a>
