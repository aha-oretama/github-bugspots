"use strict";

const program = require('commander');
const pkg = require('../package');
const colors = require('colors');
const BugSpots = require('../index');

function list(val) {
  return val.split(',');
}

function makeRed(text) {
  return colors.red(text);
}

let orgValue;
let repoValue;
let tokenValue;

program
  .version(pkg.version, '-v, --version')
  .option('-b, --branch <branch>', 'branch to crawl')
  .option('-d, --depth <depth>', 'depth of log crawl(integer)', parseInt)
  .option('-w, --words <words>', 'bugfix indicator word list, ie: "fixes,closed"', list)
  .option('-r, --regex <regex>', 'bugfix indicator regex, ie: "fix(es|ed)?" or "/fixes #(d+)/i"')
  .option('--display-timestamps', 'show timestamps of each identified fix commit')
  .arguments('<organization> <repository> <token>')
  .action(function (organization, repository, token) {
    orgValue = organization;
    repoValue = repository;
    tokenValue = token;
  })
  .parse(process.argv);

if (!orgValue || !repoValue || !tokenValue) {
  program.outputHelp(makeRed);
  process.exit(1);
}

const wordsRegex = program.words ? new RegExp(`${program.words.split(',').join('|')}`) : undefined;
const regex = program.regex || wordsRegex;

new BugSpots(orgValue, repoValue, tokenValue).analyze(program.branch, program.depth, regex)
  .then(function (data) {
    console.log(data);
    console.log(data.fixes);
    console.log(data.fixes[0].message);
    for(const fix of data.fixes) {
      process.stdout.write(`${fix.date}`);
      process.stdout.write(`${fix.message}`);
    }
    
    for(const spot of data.spots) {
      process.stdout.write(`${spot.score}`);
      process.stdout.write(`${spot.file}`);
    }
  });
