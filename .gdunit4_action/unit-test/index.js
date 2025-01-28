const pathLib = require("path");
const {spawnSync } = require("node:child_process");
require('@actions/core');
const RETURN_SUCCESS = 0;
const RETURN_ERROR = 100;
const RETURN_WARNING = 101;
const RETURN_ERROR_HEADLESS_NOT_SUPPORTED = 103;
const RETURN_ERROR_GODOT_VERSION_NOT_SUPPORTED = 104;

function getProjectPath(project_dir) {
  if (!process.env.GITHUB_WORKSPACE) {
    throw new Error("GITHUB_WORKSPACE environment variable not set");
  }
  return pathLib.join(process.env.GITHUB_WORKSPACE, project_dir);
}


function console_info(...args) {
  console.log('\x1b[94m', ...args, '\x1b[0m');
}


function console_warning(...args) {
  console.log('\x1b[33m', 'WARNING:', ...args, '\x1b[0m');
}


function console_error(...args) {
  console.log('\x1b[31m', 'ERROR:', ...args, '\x1b[0m');
}


async function runTests(exeArgs, core) {
  try {
    const {
      project_dir,
      timeout,
      paths,
      arguments = {
        project_dir: "",
        paths: "",
        arguments: "",
        timeout: 10,
        retries : 0,
        warningsAsErrors: 'false'
      }
    } = exeArgs;
    // Split by newline or comma, map, trim, and filter empty strings
    const pathsArray = paths.split(/[\r\n,]+/).map((entry) => entry.trim()).filter(Boolean);
    // verify support of multi paths/fixed since v4.2.1
    if (pathsArray.length > 1 && process.env.GDUNIT_VERSION === "v4.2.0") {
      console_warning(`Multiple path arguments not supported by GdUnit ${process.env.GDUNIT_VERSION}, please upgrade to GdUnit4 v4.2.1`);
      pathsArray.length = 1;
      console_warning(`Use only the first entry of paths, ${pathsArray}!`);
    }

    const args = [
      "--auto-servernum",
      "./addons/gdUnit4/runtest.sh",
      "--audio-driver Dummy",
      "--display-driver x11",
      "--rendering-driver opengl3",
      "--single-window",
      "--continue",
      ...pathsArray.map((path) => `--add ${path}`),
      `${arguments}`
    ];

    const working_dir = getProjectPath(project_dir);
    console_info(`Running GdUnit4 ${process.env.GDUNIT_VERSION} tests...`, working_dir, args);

    let retriesCount = 0;
    let exitCode = 0;

    while (retriesCount <= arguments.retries) {
      const child = spawnSync("xvfb-run", args, {
        cwd: working_dir,
        timeout: timeout * 1000 * 60,
        encoding: "utf-8",
        shell: true,
        stdio: ["inherit", "inherit", "inherit"],
        env: process.env,
      });
      exitCode = child.status;
      if (exitCode === 0) {
        break; // Exit loop if successful
      }
      retriesCount++;
      if (retriesCount <= arguments.retries) {
        console_warning(`The tests are failed with exit code: ${exitCode}. Retrying... ${retriesCount} of ${arguments.retries}`);
      }
    }

    switch (exitCode) {
      case RETURN_SUCCESS:
        if (retriesCount > 0 && arguments.retries > 0) {
          core.warning(`The tests was successfully after ${retriesCount} retries with exit code: ${exitCode}`);
        }
        break;
      case RETURN_ERROR:
        core.error(`The tests was failed after ${arguments.retries} retries with exit code: ${exitCode}`);
        break;
      case RETURN_WARNING:
        if (args.warningsAsErrors === 'true') {
          core.error('Tests completed with warnings (treated as errors)');
        } else {
          core.warning('Tests completed with warnings');
        }
        break;
      case RETURN_ERROR_HEADLESS_NOT_SUPPORTED:
        core.error('Headless mode not supported');
        break;
      case RETURN_ERROR_GODOT_VERSION_NOT_SUPPORTED:
        core.error('Godot version not supported');
        break;
      default:
        core.error(`Tests failed with unknown error code: ${exitCode}`);
    }

    return exitCode;
  } catch (error) {
    core.error(`Tests failed: ${error.message}`)
    return RETURN_ERROR;
  }
}

module.exports = {
  runTests
};
