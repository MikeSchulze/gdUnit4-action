
---

<h1 align="center">gdUnit4-action <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/MikeSchulze/gdunit4-action" height="32"> </h1>

<h2 align="center">
**Note: This GitHub Action is currently under development and is not yet ready for general use. Feel free to explore the code and contribute, but be aware that it may not provide expected results until it reaches a stable release. Use at your own discretion.**
</h2>

This GitHub Action workflow runs GdUnit4 unit tests in Godot 4.x based on the specified input parameters.

# Usage
```yaml

- uses: MikeSchulze/gdUnit4-action@v1
  with:
    # The version of Godot in which the tests should be run.
    # default: 'latest'
    godot-version: ''
    
    # The Godot status (e.g., "standard", "rc1", "dev1")
    # Default: 'standard'
    godot-status: ''
    
    # Set to true to run on Godot .Net version to run C# tests
    # Default: false
    godot-net: ''
    
    # The version of GdUnit4 to use. (e.g. "v4.2.0", "latest", "master").
    # Default: 'latest'
    gdunit-version: ''
    
    # The path to the directory containing test to execute.
    gdunit-tests: ''
    
    # The name of the test report file.
    report-name: ''
```

## License
The scripts and documentation in this project are released under the [MIT License](./LICENSE)
