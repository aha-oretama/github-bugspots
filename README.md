# github-bugspots

![node](https://img.shields.io/node/v/github-bugspots.svg)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

*github-bugspots* is based on *[bugspots](https://github.com/igrigorik/bugspots)* which is an implementation of the simple bug prediction heuristic outlined by the Google Engineering team ([Bug Predition at Google](http://google-engtools.blogspot.com/2011/12/bug-prediction-at-google.html)).  
The difference is that *github-bugspots* is customised for GitHub, and *github-bugspots*'s featues are as follows. 

***github-bugspots***
* works only on GitHub.
* is same logic as *bugspots*. (However, the implementation method is difference, so result scores are just little difference.)
* does not require to `git clone` the repositories before predictions.
* internally works by using GitHub API.
 
## Motivation
`bugspots` is very useful tool for getting the bug prediction.  
However, to use `bugspots`, you must install it in local computer and `git clone` the target repository.
Furthermore, it is not a library, so it is not easy to use in your program. 

I want to use easily, for example, in web application.  
Therefore, `github-bugspots` is made of [Node.js](https://nodejs.org/). And `github-bugspots` has two interfaces, one is a cli, another is a library.    

## How to use for cli
```bash
$ npm install -g github-bugspots
$ github-bugspots --help
$ github-bugspots target_organization target_repository your_token
```

## How to use for library
```bash
$ npm install --save github-bugspots
```

```javascript
const Bugspots = require('github-bugspots');

new Bugspots(organization, repository, token).analyze(branch, regex)
  .then(function (data) {
    console.log(data)
  });
```
## Notification

*github-bugspots* internally uses GitHub API.  
So that, when you use *github-bugspots* for many repositories or repositories including many commits in a short time, you will be restricted for GitHub API rate limiting and occurs errors.  
See details [here](https://developer.github.com/v3/#rate-limiting).
