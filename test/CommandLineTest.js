const assert = require('assert');
const CommandLine = require('../lib/CommandLine');

describe('CommandLine', function() {
  describe('#getParam()', function() {
    it('should return all params when all args are passed', function() {
      const organization = 'testOrg';
      const repository = "testRepo";
      const token = '1234567890';
      const branch = 'feature';
      const depth = '99';
      const regex = 'testRegex';
      
      // Arrange
      process.argv = process.argv.slice(0, 2);
      process.argv.push(organization, repository, token, "-b", branch, "-w", depth, "-r", regex);
      
      // Act
      const param = new CommandLine(process).getParam();
      
      // Assert
      assert.equal(param.organization, organization);
      assert.equal(param.repository, repository);
      assert.equal(param.token, token);
      assert.equal(param.depth, depth);
      assert.equal(param.branch, branch);
      assert.equal(param.regex, regex);
      assert.equal(param.displayTimestamps, true);
    });
  });
});
