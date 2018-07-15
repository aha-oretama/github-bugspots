const command = require('commander');
const pkg = require('../package');
const colors = require('colors');

class CommandLine {
  constructor(process) {
    this.program = new command.Command();
    this._process = process;
  }
  
  getParam() {
    let orgValue;
    let repoValue;
    let tokenValue;
    
    this.program
      .version(pkg.version, '-v, --version')
      .option('-b, --branch <branch>', 'branch to crawl')
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
      this.program.outputHelp(red);
      this._process.exit(1);
    }

    let regex = undefined;
    if (this.program.words) {
      regex = new RegExp(this.program.words.join('|'), 'i');
    }
    if (this.program.regex) {
      regex = new RegExp(this.program.regex, 'i');
    }

    return {
      organization: orgValue,
      repository: repoValue,
      token: tokenValue,
      branch: this.program.branch,
      regex: regex,
      displayTimestamps: this.program.displayTimestamps
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
