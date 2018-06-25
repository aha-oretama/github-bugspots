"use strict";
const CommandLine = require('../lib/CommandLine');
const Bugspots = require('../index');

const param = new CommandLine(process).getParam();
new Bugspots(param.organization,param.repository,param.token).analyze(param.branch,param.depth, param.regex)
  .then(function (data) {
    for (const fix of data.fixes) {
      process.stdout.write(`${fix.date}\n`);
      process.stdout.write(`${fix.message}\n`);
    }
    
    for (const spot of data.spots) {
      process.stdout.write(`${spot.score}\n`);
      process.stdout.write(`${spot.file}\n`);
    }
  });
