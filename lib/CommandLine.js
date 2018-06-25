const program = require('commander');
const pkg = require('../package');
const colors = require('colors');

class CommandLine {
  constructor(process) {
    this._process = process;
  }
  
  getParam() {
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
      .parse(this._process.argv);
    
    if (!orgValue || !repoValue || !tokenValue) {
      program.outputHelp(red);
      this._process.exit(1);
    }
    
    const wordsRegex = program.words ? new RegExp(`${program.words.split(',').join('|')}`) : undefined;
    const regex = program.regex || wordsRegex;
  
    return {
      organization: orgValue,
      repository: repoValue,
      token: tokenValue,
      branch: program.branch,
      depth: program.depth,
      regex: regex,
      displayTimestamps: program.displayTimestamps
    };
  }
}

function list(val) {
  return val.split(',');
}

function red(text) {
  return colors.red(text);
}

module.exports = CommandLine;
