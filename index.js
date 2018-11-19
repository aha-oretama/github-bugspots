"use strict";

const Octokit = require('@octokit/rest');

class Bugspots {
  constructor(oganization, repository, token) {
    this.organization = oganization;
    this.repository = repository;
    // Set up Octokit.
    this.octokit = Octokit();
    this.octokit.authenticate({
      type: 'token',
      token: token
    })
  }
  
  async analyze(branch = 'master', regex = /\b(fix(es|ed)?|close(s|d)?)\b/i) {
    let fixes = [];
    let spots = [];

    let commits = await this._paginate(this.octokit.repos.listCommits, {
      owner: this.organization,
      repo: this.repository,
      sha: branch
    });
  
    for (let commit of commits) {
      if (regex.test(commit.commit.message)) {
        let detail = await this.octokit.repos.getCommit({
          owner: this.organization,
          repo: this.repository,
          sha: commit.sha
        });
    
        log(detail);

        fixes.push({
          message: commit.commit.message.split('\n')[0],
          date: new Date(commit.commit.committer.date).getTime(),
          files: detail.data.files.map(file => file.filename)
        });
      }
    }

    if(fixes.length === 0) {
      return {
        fixes: fixes,
        spots: spots
      };
    }

    fixes.sort(function (fix1, fix2) {
      return fix1.date - fix2.date;
    });

    const currentTime = Date.now();
    const oldest_fix_date = fixes[0].date;
    fixes.forEach(fix => {
      fix.files.forEach(file => {
        const t = 1 - ((currentTime - fix.date) / (currentTime - oldest_fix_date));
        let target = spots.find(function (spot) {
          return spot.file === file;
        });
        if (!target) {
          spots.push({file: file, score: 0});
          target = spots.find(function (spot) {
            return spot.file === file;
          });
        }
        target.score += 1 / (1 + Math.exp((-12 * t) + 12));
      })
    });

    spots = spots.sort(function (spot1, spot2) {
      if (spot1.score === spot2.score) {
        if(spot1.file < spot2.file) {
          return -1;
        }
        if(spot1.file > spot2.file) {
          return 1;
        }
        return 0;
      }
      return spot2.score - spot1.score;
    });
  
    return {
      fixes: fixes,
      spots: spots
    };
  }
  
  async _paginate(method, param) {
    let response = await method(Object.assign(param, {per_page: 100}));
    let {data} = response;
    while (this.octokit.hasNextPage(response)) {
      response = await this.octokit.getNextPage(response);
      data = data.concat(response.data)
    }
    return data
  }
}

const debug = process.env.NODE_DEBUG && /\bgithub-bugspots\b/.test(process.env.NODE_DEBUG);
function log(text) {
  if(debug) {
    console.log(text);
  }
}

module.exports = Bugspots;
