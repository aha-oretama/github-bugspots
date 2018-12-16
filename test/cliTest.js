const test = require('ava');
const nock = require('nock');
const Bugspots = require('../index');
const sinon = require('sinon');

const commits = require('./data/commits.json');
const commitJsons = [];
for (let i = 0; i < 59; i++) {
  commitJsons.push(require(`./data/commit${i}`))
}
let stub;

test.beforeEach(t => {
  // Arrange
  nock('https://api.github.com')
    .get(/commits/)
    .reply(200, commits);

  for (let i = 0; i < 59; i++) {
    nock('https://api.github.com')
      .get(`/repos/igrigorik/bugspots/commits/${commitJsons[i].sha}`)
      .reply(200, commitJsons[i]);
  }

  stub = sinon.stub(Date, 'now');
  stub.returns(1532046987011);
});

test.afterEach(t => {
  // Teardown
  stub.restore();
});

test('Default analyze pick up fix or close', async t => {
  // Action
  const data = await new Bugspots('igrigorik', 'bugspots', '12341234')
    .analyze();

  // Assertion
  let spots = [
    {
      file: 'lib/bugspots/scanner.rb',
      score: 0.023741093261799063
    },
    {
      file: 'bin/git-bugspots',
      score: 0.013426364277509215
    },
    {
      file: 'bugspots.gemspec',
      score: 0.0009667481499961029
    },
    {
      file: 'bin/bugspots',
      score: 0.0003294669496008751
    },
    {
      file: 'Gemfile',
      score: 0.00032332277499866037
    }
  ];

  let fixes = [
    {
      message: 'refactor + a few fixes',
      date: 1323932017000,
      files: ['bin/bugspots', 'lib/bugspots/scanner.rb']
    }
    , {
      message: "Allow imperative form of 'fix'.",
      date: 1324297444000,
      files: ['lib/bugspots/scanner.rb']
    }
    , {
      message: "Allow imperative form of 'close'.\r",
      date: 1324321306000,
      files: ['lib/bugspots/scanner.rb']
    }
    , {
      message: 'Merge pull request #9 from airblade/master',
      date: 1324349845000,
      files: ['lib/bugspots/scanner.rb']
    }
    , {
      message: 'rename bin script to integrate with native git commands - closes #11',
      date: 1325570790000,
      files: ['bin/git-bugspots']
    }
    , {
      message: 'Only Track Files at HEAD',
      date: 1325796500000,
      files: ['lib/bugspots/scanner.rb']
    }
    , {
      message: 'Fix https://github.com/mojombo/grit/issues/41 using suggestion from msgerbush.',
      date: 1334673603000,
      files: ['lib/bugspots/scanner.rb']
    }
    , {
      message: 'Merge pull request #18 from cleeland/master',
      date: 1334676316000,
      files: ['lib/bugspots/scanner.rb']
    }
    , {
      message: 'Fix for repositories with spaces in their path.',
      date: 1358802720000,
      files: ['bin/git-bugspots']
    }
    , {
      message: 'fix scoring function, use latest rugged build',
      date: 1392670032000,
      files: ['Gemfile',
        'bin/bugspots',
        'bugspots.gemspec',
        'lib/bugspots/scanner.rb']
    }
    , {
      message: 'update to use latest rugged API, closes #24',
      date: 1404610198000,
      files: ['bugspots.gemspec', 'lib/bugspots/scanner.rb']
    }
    , {
      message: 'Fixed "invalid byte sequence in UTF-8"',
      date: 1435703660000,
      files: ['lib/bugspots/scanner.rb']
    }
    , {
      message: 'Merge pull request #27 from philipp-classen/master',
      date: 1435706454000,
      files: ['lib/bugspots/scanner.rb']
    }
    , {
      message: 'fix cli argument from git extension',
      date: 1445316156000,
      files: ['bin/git-bugspots']
    }
    , {
      message: 'Merge pull request #28 from giwa/fix-cli-argument-from-git-extension',
      date: 1445317423000,
      files: ['bin/git-bugspots']
    }
    , {
      message: 'Fix bugspot calculation for current time',
      date: 1447334064000,
      files: ['lib/bugspots/scanner.rb']
    }
    , {
      message: 'Merge pull request #29 from niwatolli3/fix-current-time',
      date: 1447341589000,
      files: ['lib/bugspots/scanner.rb']
    },
  ];

  t.deepEqual(data.fixes, fixes);
  t.deepEqual(data.spots, spots);

});

