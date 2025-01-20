
<h1 align="center">gdUnit4-action </h1>

[![License](https://img.shields.io/github/license/MikeSchulze/gdunit4-action)](https://github.com/MikeSchulze/gdUnit4-action/blob/master/LICENSE)
[![GitHub release badge](https://badgen.net/github/release/MikeSchulze/gdunit4-action/stable)](https://github.com/MikeSchulze/gdunit4-action/releases/latest)
[![CI/CD](https://github.com/MikeSchulze/gdunit4-action/actions/workflows/ci-dev.yml/badge.svg)](https://github.com/MikeSchulze/gdunit4-action/actions/workflows/ci-dev.yml)

This GitHub Action automates the execution of GdUnit4 and GdUnit4Net unit tests within the Godot Engine 4.x environment.<br> It provides flexibility in configuring the Godot version, GdUnit4 version, test paths, and other parameters to suit your testing needs.

* [Inputs](#inputs)
* [Usage](#usage)
* [Examples](#examples)
* [License](#license)
* [Contributing](#contribution-guidelines)

---

## Inputs

| Parameter        | Description                                                                           | Type   | Required | Default   |
| --------------   | ------------------------------------------------------------------------------------- | ------ | -------- | --------- |
| godot-version    | The version of Godot in which the tests should be run.                                | string | true     |           |
| godot-status     | The Godot status (e.g., "stable", "rc1", "dev1").                                     | string | false    | stable    |
| godot-net        | Set to true to run on Godot .Net version for C# tests.                                | bool   | false    | false     |
| godot-force-mono | Set to true to enforce running GDScript test with Godot Mono executable               | bool   | false    | false     |
| version          | The version of GdUnit4 to use.                                                        | string | false    | latest    |
| project_dir      | The project directory in which the action is to be executed.                          | string | false    | ./        |
| paths            | Comma-separated or newline-separated list of directories containing tests to execute. | string | true     |           |
| arguments        | Additional arguments to pass to GdUnit4<br> see <https://mikeschulze.github.io/gdUnit4/advanced_testing/cmd/>. | string | false    |           |
| timeout          | The test execution timeout in minutes.                                                | int    | false    | 10        |
| retries          | The number of retries if the tests fail.                                              | int    | false    | 0         |
| publish-report   | Enable disable to publish the report. To disable to run on forked repositories.       | bool   | false    | true      |
| upload-report    | Enables/Disables to upload the report file                                            | bool   | false    | true      |
| report-name      | The name of the test report file.                                                     | string | false    | test-report.xml |

### Note on Versioning

A GdUnit4 **version** should be specified as a string, such as `v4.2.1`. To run on the latest release, use `latest`, and for the latest unreleased version, use `master`. To keep the version installed in your project, use `installed`.

### Note on forked repositories

For forked repositories, you will receive a `HttpError: Resource not accessible by integration` at the `publish-test-report` step.
For more details, [read more here](https://github.com/dorny/test-reporter?tab=readme-ov-file#recommended-setup-for-public-repositories)
You must therefore set `publish-report: false` to disable reporting and specify the `report-name` that will be used to upload the report artifact.

Example:
```yaml
      uses: MikeSchulze/gdUnit4-action@v1.1.1
        with:
          paths: |
            res://my_project/test/
          timeout: 10
          publish-report: false
          report-name: my_project
```
The uploaded artifact is created with the name "artifact_<report_name>", in the example it would be called "artifact_my_project".

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

    # Set to true to force running GDScript tests by using the Godot Mono executable
    # Default: false
    godot-force-mono: ''

    # The project directory in which the action is to be executed.
    # The specified directory must end with a path separator. e.g. ./MyProject/
    # Default: './'
    project_dir: ''

    # The version of GdUnit4 to use. (e.g. "v4.2.0", "latest", "master", "installed").
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

    # Enables/Disables to publish the report. To disable to run on forked repositories.
    # Default: true
    publish-report: ''

    # Enables/Disables to upload the report file
    # Default: true
    upload-report: ''

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
    report-name: 'myproject-test-result'
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
    report-name: 'myproject-test-result'
```

In this example, we run the tests but without a published test report.

```yaml
- uses: actions/checkout@v4
- uses: MikeSchulze/gdUnit4-action@v1
  with:
    godot-version: '4.2.1'
    paths: 'res://tests'
    upload-report: false
```

In this example, we have a custom project structure and needs to setup the `project_dir`

```bash
- root/
  - MyProject/
  - MyProject/src
  - MyProject/tests
```

```yaml
- uses: actions/checkout@v4
- uses: MikeSchulze/gdUnit4-action@v1
  with:
    godot-version: '4.2.1'
    project_dir: './MyProject/'
    paths: 'res://tests'
    
```

---

## License

The scripts and documentation in this project are released under the [MIT License](./LICENSE)

---

### You Are Welcome To

* [Give Feedback](https://github.com/MikeSchulze/gdUnit4-action/discussions) on the gdUnit GitHub Discussions page.
* [Suggest Improvements](https://github.com/MikeSchulze/gdUnit4-action/issues/new?assignees=MikeSchulze&labels=enhancement&template=feature_request.md&title=) by creating a new feature request issue on the gdUnit GitHub Issues page.
* [Report Bugs](https://github.com/MikeSchulze/gdUnit4-action/issues/new?assignees=MikeSchulze&labels=bug&projects=projects%2F5&template=bug_report.yml&title=GD-XXX%3A+Describe+the+issue+briefly)  by creating a new bug report issue on the gdUnit GitHub Issues page.

---

### Contribution Guidelines

**Thank you for your interest in contributing to GdUnit4!**<br>
To ensure a smooth and collaborative contribution process, please review our [contribution guidelines](https://github.com/MikeSchulze/gdUnit4-action/blob/master/CONTRIBUTING.md) before getting started. These guidelines outline the standards and expectations we uphold in this project.

Code of Conduct: As a contributor, it is important to respect and follow this code to maintain a positive and inclusive community.

Using GitHub Issues: We utilize GitHub issues for tracking feature requests and bug reports. If you have a general question or wish to engage in discussions, we recommend joining the [GdUnit Discord Server](https://discord.gg/rdq36JwuaJ) for specific inquiries.

We value your input and appreciate your contributions to make gdunit4-action even better!

---

## Contributors

<a href="https://github.com/MishaKav/jest-coverage-comment/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MikeSchulze/gdUnit4-action" alt="Contributors" />
</a>
