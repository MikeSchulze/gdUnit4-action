const actionCore = require('@actions/core');  // renamed to avoid conflicts
const pathLib = require("path");
const {spawnSync } = require("node:child_process");

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
      project_dir = '',
      paths = "",
      arguments = '',
      timeout = 10,
      retries = 0,
      warningsAsErrors = false
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
    console_info(`Running GdUnit4 ${process.env.GDUNIT_VERSION} tests at ${working_dir} with arguments: ${args}`);
    console_info(`project_dir: ${project_dir}`);
    console_info(`timeout: ${timeout}`);
    console_info(`retries: ${retries}`);
    console_info(`warningsAsErrors: ${warningsAsErrors}`);

    let retriesCount = 0;
    let exitCode = 0;

    while (retriesCount <= retries) {
      const child = spawnSync("xvfb-run", args, {
        cwd: working_dir,
        timeout: timeout * 1000 * 60,
        encoding: "utf-8",
        shell: true,
        stdio: ["inherit", "inherit", "inherit"],
        env: process.env,
      });

      // Handle spawn errors
      if (child.error) {
        actionCore.setFailed(`Run Godot process ends with error: ${child.error}`);
        return RETURN_ERROR;
      }

      exitCode = child.status;

      if (exitCode === RETURN_SUCCESS) {
        break; // Exit loop if successful
      }
      retriesCount++;
      if (retriesCount <= retries) {
        console_warning(`The tests are failed with exit code: ${exitCode}. Retrying... ${retriesCount} of ${retries}`);
      }
    }

    switch (exitCode) {
      case RETURN_SUCCESS:
        if (retriesCount > 0 && retries > 0) {
          actionCore.warning(`The tests was successfully after ${retriesCount} retries with exit code: ${exitCode}`);
        } else {
          actionCore.info(`The tests was successfully with exit code: ${exitCode}`);
        }
        break;
      case RETURN_ERROR:
        actionCore.setFailed(`The tests was failed after ${retries} retries with exit code: ${exitCode}`);
        break;
      case RETURN_WARNING:
        if (warningsAsErrors === true) {
          actionCore.setFailed(`Tests completed with warnings (treated as errors)`);
        } else {
          actionCore.warning('Tests completed successfully with warnings');
          return RETURN_SUCCESS;
        }
        break;
      case RETURN_ERROR_HEADLESS_NOT_SUPPORTED:
        actionCore.setFailed('Headless mode not supported');
        break;
      case RETURN_ERROR_GODOT_VERSION_NOT_SUPPORTED:
        actionCore.setFailed('Godot version not supported');
        break;
      default:
        actionCore.setFailed(`Tests failed with unknown error code: ${exitCode}`);
    }

    return exitCode;
  } catch (error) {
    actionCore.setFailed(`Tests failed: ${error.message}`);
    return RETURN_ERROR;
  }
}

module.exports = {
  runTests
};
