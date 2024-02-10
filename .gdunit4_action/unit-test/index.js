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


async function rebuildProjectCache() {
  const args = [
    "--auto-servernum",
    `${process.env.GODOT_BIN}`,
    "--headless",
    "--audio-driver Dummy",
    "-e",
    "--path .",
    "-s res://.gdunit4_action/scripts/build_project.gd",
  ];

  const child = spawnSync("xvfb-run", args, {
    cwd: getProjectPath(),
    timeout: 1000 * 60,
    encoding: "utf-8",
    shell: true,
    stdio: ["ignore", "ignore", "ignore"],
    env: process.env,
  });
  return child.status;
}


async function rebuildProjectCache_() {
  const args = [
    "--auto-servernum",
    `${process.env.GODOT_BIN}`,
    "--headless",
    "--audio-driver Dummy",
    "-e",
    "--path .",
    "-s res://.gdunit4_action/scripts/build_project.gd",
  ];

  // Use spawn instead of spawnSync
  const child = spawn("xvfb-run", args, {
    cwd: getProjectPath(),
    timeout: 1000 * 60,
    stdio: ["pipe", "pipe", "ignore"],  // Redirect stderr to dev/null
    env: process.env,
  });

  // Return a promise that resolves when the process exits
  return new Promise((resolve, reject) => {
    child.stdout.on('data', (data) => console.log(data.toString()));
    child.on('close', (code) => resolve(code));
    child.on('error', (err) => {
      reject(`Error spawning process: ${err}`);
    });
  });
}


async function runTests(exeArgs, core) {
  try {
    console_info("Start of the recovery of the project cache ...");
    let exitCode = await rebuildProjectCache();
    if (exitCode !== 0) {
      console_error(`Rebuild project cache failed with exit code ${exitCode}. Aborting tests.`);
      return exitCode;
    }
    console_info("Project cache successfully restored.");

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

    while (retriesCount < retries) {
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
      console_warning(`Tests failed with exit code: ${exitCode}. Retrying...`);
      retriesCount++;
    }

    if (exitCode !== 0) {
      core.setFailed(`Tests failed after ${retries} retries with exit code: ${exitCode}`);
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
