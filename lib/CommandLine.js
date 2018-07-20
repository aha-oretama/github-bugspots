const command = require('commander');
const pkg = require('../package');

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
      regex = new RegExp(this.program.words.join('|'));
    }
    if (this.program.regex) {
      const extract = /\/(.*)\/([gimuy]*)$/;
      let tmp = this.program.regex;
      if(extract.test(tmp)) {
        const flags = this.program.regex.replace(extract,'$2');
        const pattern = this.program.regex.replace(extract, '$1');
        regex = new RegExp(pattern, flags);
      }else {
        regex = new RegExp(tmp);
      }
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
  return `\x1b[31m${text}\x1b[0m`;
}

module.exports = CommandLine;
