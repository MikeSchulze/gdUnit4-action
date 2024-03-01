const pathLib = require("path");
const { spawn, spawnSync } = require("node:child_process");


function getProjectPath() {
  if (!process.env.GITHUB_WORKSPACE) {
    throw new Error("GITHUB_WORKSPACE environment variable not set");
  }
  return pathLib.join(process.env.GITHUB_WORKSPACE, "./");
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
    const { timeout, paths, arguments, retries } = exeArgs;
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

    console_info(`Running GdUnit4 ${process.env.GDUNIT_VERSION} tests...`, getProjectPath(), args);

    let retriesCount = 0;

    while (retriesCount <= retries) {
      const child = spawnSync("xvfb-run", args, {
        cwd: getProjectPath(),
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
      if (retriesCount <= retries) {
        console_warning(`The tests are failed with exit code: ${exitCode}. Retrying... ${retriesCount} of ${retries}`);
      }
    }

    if (exitCode !== 0) {
      core.setFailed(`The tests was failed after ${retries} retries with exit code: ${exitCode}`);
    } else if (retriesCount > 0 && retries > 0) {
      core.warning(`The tests was successfully after ${retriesCount} retries with exit code: ${exitCode}`);
    }
    return exitCode;
  } catch (error) {
    core.setFailed(`Tests failed: ${error.message}`)
    return 1;
  }
}

module.exports = {
  runTests
};
