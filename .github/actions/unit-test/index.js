const pathLib = require("path");
const { spawnSync } = require("node:child_process");

function getProjectPath() {
  if (!process.env.GITHUB_WORKSPACE) {
    throw new Error("GITHUB_WORKSPACE environment variable not set");
  }
  return pathLib.join(process.env.GITHUB_WORKSPACE, "./");
}

async function rebuildProjectCache() {
  const args = [
    "--auto-servernum",
    `${process.env.GODOT_BIN}`,
    "--headless",
    "--audio-driver Dummy",
    "-e",
    "--path .",
    "-s res://.github/scripts/build_project.gd",
  ];

  const child = spawnSync("xvfb-run", args, {
    cwd: getProjectPath(),
    timeout: 1000 * 60,
    encoding: "utf-8",
    shell: true,
    stdio: ["inherit", "inherit", "ignore"],
    env: process.env,
  });
  console.log('child', child);
  return child.status;
}


async function runTests(exeArgs) {
  try {
    console.log("Start of the recovery of the project cache ...");
    const exitCode = await rebuildProjectCache();
    if (exitCode !== 0) {
      console.log(
        `Rebuild project cache failed with exit code ${exitCode}. Aborting tests.`
      );
      return exitCode;
    }

    const { timeout, tests } = exeArgs;
    const args = [
      "--auto-servernum",
      "./addons/gdUnit4/runtest.sh",
      `--add ${tests}`,
      "--audio-driver Dummy",
      "--display-driver x11",
      "--rendering-driver opengl3",
      "--single-window",
      "--continue"
    ];

    console.log("Running GdUnit4 tests...", tests);
    const child = spawnSync("xvfb-run", args, {
      cwd: getProjectPath(),
      timeout: timeout * 1000 * 60,
      encoding: "utf-8",
      shell: true,
      stdio: ["inherit", "inherit", "inherit"],
      env: process.env,
    });

    console.log(`GdUnit4 process exited with exit code ${child.status}`);
    return child.status;
  } catch (error) {
    console.error(error.message);
    return 1;
  }
}

module.exports = {
  runTests
};
