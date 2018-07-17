const test = require('ava');
const CommandLine = require('../lib/CommandLine');
const sinon = require('sinon');

test('CommandLine should return all params when all args are passed', t => {
  const organization = 'testOrg';
  const repository = "testRepo";
  const token = '1234567890';
  const branch = 'feature';
  const regex = '/testRegex/i';

  // Arrange
  process.argv = process.argv.slice(0, 2);
  process.argv.push(organization, repository, token, "-b", branch, "-r", regex, "--display-timestamps");

  // Act
  const param = new CommandLine(process).getParam();

  // Assert
  t.is(param.organization, organization);
  t.is(param.repository, repository);
  t.is(param.token, token);
  t.is(param.branch, branch);
  t.deepEqual(param.regex, /testRegex/i);
  t.true(param.displayTimestamps);
});

function regMacro(t, input, exp) {
  const organization = 'testOrg';
  const repository = "testRepo";
  const token = '1234567890';

  // Arrange
  process.argv = process.argv.slice(0, 2);
  process.argv.push(organization, repository, token, "-r", input);

  // Act
  const param = new CommandLine(process).getParam();

  // Assert
  t.is(param.organization, organization);
  t.is(param.repository, repository);
  t.is(param.token, token);
  t.deepEqual(param.regex, exp);
}

regMacro.title = (title) => title;

for (const data of [
  {title: 'Input is just string. Return simple regex.', input: 'test', exp: /test/},
  {title: 'Input is regex string without flags. Return regex.', input: '/test/', exp: /test/},
  {title: 'Input is regex string with flags', input: '/test/gimuy', exp: /test/gimuy},
]) {
  test(data.title, regMacro, data.input, data.exp);
}

test('CommandLine should return regex when word option passes', t => {
  const organization = 'testOrg';
  const repository = "testRepo";
  const token = '1234567890';
  const words = 'test,regex';
  const regex = /test|regex/;

  // Arrange
  process.argv = process.argv.slice(0, 2);
  process.argv.push(organization, repository, token, "-w", words);

  // Act
  const param = new CommandLine(process).getParam();

  // Assert
  t.is(param.organization, organization);
  t.is(param.repository, repository);
  t.is(param.token, token);
  t.deepEqual(param.regex, regex);
});

function argMacro(t, input) {
  // Arrange
  let stub = sinon.stub(process, 'exit');
  process.argv = process.argv.slice(0, 2);
  process.argv.push(...input);

  // Act
  const param = new CommandLine(process).getParam();

  // Assert
  t.true(stub.called);
  t.true(stub.calledWith(1));

  // teardown
  process.exit.restore();
}

argMacro.title = (count) => `CommandLine should throw an error when necessary argument is not passed. args count is ${count}`;

for (const input of [[], ["testOrg"], ["testOrg", "testRepo"]]) {
  test(`${input.length}`, argMacro, input);
}