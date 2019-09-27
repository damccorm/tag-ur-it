// You can import your modules
// import index from '../src/index'

import nock from 'nock'
import path from 'path'
import * as irm from '../src/issuerules'

nock.disableNetConnect()

function testYamlPath(name: string): string {
  return path.join(__dirname, 'res', name + '.yml');
}

describe('tag-ur-it', () => {

  test('can parse basic yaml file', async(done) => {
    let yc = await irm.loadYamlContents(testYamlPath('basic'));
    let issueRules: irm.IIssueRules = irm.parseYamlContents(yc);

    expect(issueRules.rules.length).toBeGreaterThan(0);
    expect(issueRules.noMatches.length).toBeGreaterThan(0);
    expect(issueRules.tags.length).toBeGreaterThan(0);
    done();
  })

  test('splitLines correctly splits on new lines', async(done) => {
    // mix CR and casing along with whitespace
    let contents: string = 'some line\r\n  Item: Bar \r other line \r\n Item: baz';
    let lines: string[] = irm.splitLines(contents);
    expect(lines.length).toBe(4);
    done();
  })

  test('valueFor equals rules work', async(done) => {
    let yc = await irm.loadYamlContents(testYamlPath('valueFor'));
    let issueRules: irm.IIssueRules = irm.parseYamlContents(yc);
    let eng: irm.RuleEngine = new irm.RuleEngine();

    // mix CR and casing along with whitespace
    // notice case insensitive value on key and value
    let contents: string = 'some line\r\n  item: Bar \r other line \r\n Item: baz';

    let res: irm.ITagResults = eng.processRules(contents, issueRules.rules);
    expect(res.labelsToAdd.indexOf('Area: Bar')).toBeGreaterThanOrEqual(0);
    expect(res.assigneesToAdd.indexOf('John')).toBeGreaterThanOrEqual(0);
    done();
  })

  test('valueFor contains rules work', async(done) => {
    let yc = await irm.loadYamlContents(testYamlPath('valueFor'));
    let issueRules: irm.IIssueRules = irm.parseYamlContents(yc);
    let eng: irm.RuleEngine = new irm.RuleEngine();

    // aFooBar should match the rule of contains Foo
    // mix CR and casing along with whitespace
    // notice case insensitive value on key and value
    let contents: string = 'some line\r\n  item: aFooBar \r other line \r\n Item: baz';

    let res: irm.ITagResults = eng.processRules(contents, issueRules.rules);
    expect(res.labelsToAdd.indexOf('Area: Foo')).toBeGreaterThanOrEqual(0);
    expect(res.assigneesToAdd.indexOf('John')).toBeGreaterThanOrEqual(0);
    done();
  }) 

  test('noMatch text contains', async(done) => {
    let yc = await irm.loadYamlContents(testYamlPath('noMatch'));
    let issueRules: irm.IIssueRules = irm.parseYamlContents(yc);
    let eng: irm.RuleEngine = new irm.RuleEngine();

    let contents: string = '  description here \r\n using Bash and Azure together';

    let res: irm.ITagResults = eng.processRules(contents, issueRules.noMatches);
    expect(res.labelsToAdd.indexOf('Area: Release')).toBeGreaterThanOrEqual(0);
    expect(res.labelsToAdd.indexOf('Area: Core')).toBeGreaterThanOrEqual(0);
    done();
  })   
  
  test('adds tags if noneIn set', async(done) => {
    let eng: irm.RuleEngine = new irm.RuleEngine();
    let tagSet: string[] = ['el1', 'el2'];
    eng.addIfNoneIn(['add1', 'add2'], // add
                    ['xyz'],          // ifNone
                    tagSet);          // in

    expect(tagSet.length).toBe(4);
    done();
  })

  test('does not adds tags if in set', async(done) => {
    let eng: irm.RuleEngine = new irm.RuleEngine();
    let tagSet: string[] = ['el1', 'el2'];
    eng.addIfNoneIn(['add1', 'add2'], // add
                    ['el1'],          // ifNone
                    tagSet);          // in

    expect(tagSet.length).toBe(2);
    done();
  })  
  
  test('adds tags if none match expression', async(done) => {
    let eng: irm.RuleEngine = new irm.RuleEngine();
    let tagSet: string[] = ['el1', 'el2'];
    eng.addIfNoneMatch(['add1', 'add2'], '\s*Area:\s*([^]*)', tagSet);

    expect(tagSet.length).toBe(4);
    done();
  })  

  test('does not add tags if set matches expression', async(done) => {
    let eng: irm.RuleEngine = new irm.RuleEngine();
    let tagSet: string[] = ['Area: Foo', 'el2'];
    eng.addIfNoneMatch(['add1', 'add2'], '\s*Area:\s*([^]*)', tagSet);

    expect(tagSet.length).toBe(2);
    done();
  })    

  test('e2e adds triage tag appropriately', async(done) => {
    let yc = await irm.loadYamlContents(testYamlPath('basic'));
    let issueRules: irm.IIssueRules = irm.parseYamlContents(yc);
    let eng: irm.RuleEngine = new irm.RuleEngine();

    // aFooBar should match the rule of contains Foo
    // mix CR and casing along with whitespace
    // notice case insensitive value on key and value
    let contents: string = 'some line\r\n  item: aFooBar \r other line \r\n Item: baz';

    let res: irm.ITagResults = eng.processRules(contents, issueRules.rules);
    console.log(res);
    expect(res.labelsToAdd.indexOf('Area: Foo')).toBeGreaterThanOrEqual(0);
    expect(res.assigneesToAdd.indexOf('Bob')).toBeGreaterThanOrEqual(0);

    eng.processTags(res.labelsToAdd, issueRules.tags);
    expect(res.labelsToAdd.indexOf('triage')).toBeGreaterThanOrEqual(0);
    done();
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about using TypeScript in your tests, Jest recommends:
// https://github.com/kulshekhar/ts-jest

// For more information about testing with Nock see:
// https://github.com/nock/nock
