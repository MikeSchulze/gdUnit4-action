
---

<h1 align="center">gdUnit4-action <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/MikeSchulze/gdunit4-action" height="32"> </h1>

This GitHub Action automates the execution of GdUnit4 unit tests within the Godot Engine 4.x environment.<br> It provides flexibility in configuring the Godot version, GdUnit4 version, test paths, and other parameters to suit your testing needs.

---

## Inputs

| Parameter      | Description                                              | Type   | Required | Default   |
| -------------- | -------------------------------------------------------- | ------ | -------- | --------- |
| godot-version  | The version of Godot in which the tests should be run.   | string | true     |           |
| godot-status   | The Godot status (e.g., "stable", "rc1", "dev1").       | string | false    | stable    |
| godot-net      | Set to true to run on Godot .Net version for C# tests.   | bool   | false    | false     |
| version        | The version of GdUnit4 to use.                          | string | false    | latest    |
| paths          | Comma-separated or newline-separated list of directories containing tests to execute. | string | true     |           |
| arguments      | Additional arguments to pass to GdUnit4<br> see https://mikeschulze.github.io/gdUnit4/advanced_testing/cmd/. | string | false    |           |
| timeout        | The test execution timeout in minutes.                  | int    | false    | 10        |
| retries        | The number of retries if the tests fail.                | int    | false    | 0         |
| report-name    | The name of the test report file.                        | string | false    | test-report.xml |



### Note on Versioning:
A GdUnit4 **version** should be specified as a string, such as `v4.2.1`. To run on the latest release, use `latest`, and for the latest unreleased version, use `master`.


---

## Usage
```yaml

- uses: MikeSchulze/gdUnit4-action@v1
  with:
    # The version of Godot in which the tests should be run. (e.g., "4.2.1")
    godot-version: ''
    
    # The Godot status (e.g., "stable", "rc1", "dev1")
    # Default: stable
    godot-status: ''
    
    # Set to true to run on Godot .Net version to run C# tests
    # Default: false
    godot-net: ''
    
    # The version of GdUnit4 to use. (e.g. "v4.2.0", "latest", "master").
    # Default: latest
    version: ''
    
    # Comma-separated or newline-separated list of directories containing test to execute..
    paths: ''

    # The test execution timeout in minutes.
    # Default: 10
    timeout: ''

    # The number of retries if the tests fail. (This can be used for flaky test)
    # Default: 0 
    retries: ''
    
    # Additional arguments to pass to GdUnit4 (see https://mikeschulze.github.io/gdUnit4/advanced_testing/cmd/).
    arguments: ''

    # The name of the test report file.
    report-name: ''
```

## Examples
This example runs all tests located under `res://myproject/tests` on Godot-4.2.1-stable with the latest GdUnit4 release.
```yaml
- uses: actions/checkout@v4
- uses: MikeSchulze/gdUnit4-action@v1
  with:
    godot-version: '4.2.1'
    paths: 'res://myproject/tests'
    report-name: 'test-result.xml'
```


In this example, all tests located in 'myproject1/tests' and 'myproject2/tests' are executed using the master branch version of GdUnit4
```yaml
- uses: actions/checkout@v4
- uses: MikeSchulze/gdUnit4-action@v1
  with:
    godot-version: '4.2.1'
    version: 'master'
    paths: |
      res://myproject1/tests
      res://myproject2/tests
    report-name: 'test-result.xml'
```


## License
The scripts and documentation in this project are released under the [MIT License](./LICENSE)
