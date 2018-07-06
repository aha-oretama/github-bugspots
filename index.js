"use strict";

const _ = require('lodash');
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
  
  async analyze(branch = 'master', depth = 1000, regex = /\b(fix(es|ed)?|close(s|d)?)\b/i) {
    let fixes = [];
  
    let commits = await this._paginate(this.octokit.repos.getCommits, {
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
          date: new Date(commit.commit.committer.date).getTime() / 1000,
          files: detail.data.files.map(file => file.filename)
        });
      }
    }
    
    const currentTime = _.now() / 1000;
    let hotspots = [];
    const oldest_fix_date = _.last(fixes).date;
    fixes.forEach(fix => {
      // TODO: Confirm whether to plus from low to high number. That is for a truncation error.
      fix.files.forEach(file => {
        const t = 1 - ((currentTime - fix.date) / (currentTime - oldest_fix_date));
        let target = _.find(hotspots, {file: file});
        if (!target) {
          hotspots.push({file: file, score: 0});
          target = _.find(hotspots, {file: file});
        }
        target.score += 1 / (1 + Math.exp((-12 * t) + 12));
      })
    });
  
    fixes = _.reverse(fixes);
    const spots = _.reverse(_.sortBy(hotspots, ['score', 'file']));
  
    return {
      fixes: fixes,
      spots: spots
    };
  }
  
  async _paginate(method, param) {
    let response = await method({...param, per_page: 100});
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
