const pathLib = require('path');
const { spawn } = require('node:child_process');

function getProjectPath() {
  if (!process.env.GITHUB_WORKSPACE) {
    throw new Error("GITHUB_WORKSPACE environment variable not set");
  }
  return pathLib.join(process.env.GITHUB_WORKSPACE, "./");
}

async function runTests(exeArgs) {
  const godot_bin = process.env.GODOT_BIN;
  const { timeout, tests } = exeArgs;
  let args = [
    '--auto-servernum',
    './addons/gdUnit4/runtest.sh',
    `--add ${ tests }`,
    '--audio-driver Dummy',
    '--display-driver x11',
    '--rendering-driver opengl3',
    '--single-window',
    '--continue',
    '--verbose'
  ];

  console.log("Running GdUnit4 tests...", tests, args);
  const prg = spawn('xvfb-run', args, {
    cwd: getProjectPath(),
    // timeout in minutes to ms
    timeout: timeout * 1000 * 60,
  });


  prg.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  prg.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
  });
  
  prg.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
  }); 

  //console.log("GdUnit4 results: ", results.stdout.toString(), results.stderr.toString());

  
}

module.exports = runTests;
