# github-bugspots
*github-bugspots* is based on *[bugspots](https://github.com/igrigorik/bugspots)* which is an implementation of the simple bug prediction heuristic outlined by the Google Engineering team ([Bug Predition at Google](http://google-engtools.blogspot.com/2011/12/bug-prediction-at-google.html)).  
The difference is that *github-bugspots* is customised for GitHub, and *github-bugspots*'s featues are as follows. 

***github-bugspots***
* works only on GitHub.
* is same logic as *bugspots*.
* does not require to `git clone` the repositories before predictions.
* internally works by using GitHub API, especially [Git Data API](https://developer.github.com/v3/git/).
 
## Motivation

## How to use for cli

## How to use for library\

## Notification

*github-bugspots* internally uses GitHub API.  
So that, when you use *github-bugspots* for many repositories or repositories including many commits in a short time, you will be restricted for GitHub API rate limiting and occurs errors.  
See details [here](https://developer.github.com/v3/#rate-limiting).
