"use strict";
const CommandLine = require('../lib/CommandLine');
const Bugspots = require('../index');
const colors = require('colors');

const param = new CommandLine(process).getParam();

process.stdout.write(green(`Scanning ${param.organization}/${param.repository} repo\n`));
new Bugspots(param.organization,param.repository,param.token).analyze(param.branch, param.regex)
  .then(function (data) {
    let output = "";
    output += yellow(`\tFound ${data.fixes.length} bugfix commits, with ${data.spots.length} hotspots:\n`);
    output += "\n";
    output += green(`\tFixes:\n`);
    
    for (const fix of data.fixes) {
      let message = "\t\t- ";
      if(param.displayTimestamps) {
        message += `${new Date(fix.date)} `
      }
      message += `${fix.message}\n`;
      output += yellow(message);
    }
  
    output += "\n";
    output += green("\tHotspots:\n");
    for (const spot of data.spots) {
      output += red(`\t\t${spot.score.toFixed(4)}`);
      output += yellow(` - ${spot.file}\n`);
    }
    process.stdout.write(output);
  });

function red(text) {
  return colors.red(text);
}

function green(text) {
  return colors.green(text);
}

function yellow(text) {
  return colors.yellow(text);
}
