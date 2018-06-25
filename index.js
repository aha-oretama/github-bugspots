"use strict";

const _ = require('lodash');
const addBaseFuncToRepo = require('js-github/mixins/github-db');
const addWalkerToRepo = require('js-git/mixins/walkers');
const co = require('co'); // co is more popular than gen-run.
const Octokit = require('@octokit/rest');

class Bugspots {
  constructor(oganization, repoName, token) {
    this.organization = oganization;
    this.repoName = repoName;
    this.repo = {};
    // Add functions to repo in this method.
    addBaseFuncToRepo(this.repo, `${oganization}/${repoName}`, token);
    addWalkerToRepo(this.repo);
    // Set up Octokit.
    this.octokit = Octokit();
    this.octokit.authenticate({
      type: 'token',
      token: token
    })
  }

  // デフォルトは正規表現にワード境界を使用。
  analyze(branch = 'master', depth = 1000, regex = /\b(fix(es|ed)?|close(s|d)?)\b/i) {

    let fixes = [];

    const localRepo = this.repo, localOwner = this.organization, localRepoName = this.repoName,
      localOctokit = this.octokit; // For using parameters in generator function.

    return co(function* () {
      const commitHash = yield localRepo.readRef(`refs/heads/${branch}`);
      let logStream = yield localRepo.logWalk(commitHash);
      let commit;
      // TODO: logStream.read(), localOctokit.repos.getCommit()を使用する度にGitHub APIの制限数に引っかかる可能性がある。そのハンドリングを実装すべき
      
      while (commit = yield logStream.read() , commit !== undefined && depth > 0) {
        depth--;
        console.debug(commit);
        if (regex.test(commit.message)) {
          const detail = yield localOctokit.repos.getCommit({
            owner: localOwner,
            repo: localRepoName,
            sha: commit.hash
          });
  
          console.debug(detail);
  
          fixes.push({
            message: commit.message.split('\n')[0],
            date: commit.committer.date.seconds,
            files: detail.data.files.map(file => file.filename)
          });
        }
      }

      const currentTime = _.now();
      let hotspots = [];
      const oldest_fix_date = _.last(fixes).date;
      fixes.forEach(fix => {
        fix.files.forEach(file => {
          const t = 1 - ((currentTime - fix.date) / (currentTime - oldest_fix_date));
          let target = _.find(hotspots, {file: file});
          if(target) {
            target.score += 1 / (1 + Math.exp((-12 * t) + 12));
          }else {
            hotspots.push({file: file, score: 0});
          }
        })
      });

      const spots = _.reverse(_.sortBy(hotspots, ['score', 'file']));

      return yield Promise.resolve({
        fixes: fixes,
        spots: spots
      })
    });
  }
}

module.exports = Bugspots;
