import * as fs from 'fs'
import * as irm from './issuerules'
import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
    const ymlPath = core.getInput('configuration-path', {required: true});
    const token = core.getInput('repo-token', {required: true});
    let fileContents: string = fs.readFileSync(ymlPath, {encoding: 'utf8'});

    if (github.context.payload.action !== 'opened') {
      console.log('No issue or PR was opened, skipping');
      return;
    }

    if (!github.context.payload.issue) {
      console.log(
        'The event that triggered this action was not a issue, skipping.'
      );
      return;
    }

    try {
      if (!fileContents) {
        console.log('No file contents found in the rules file.')
        return;
      }

      let issueRules: irm.IIssueRules = irm.parseYamlContents(fileContents);
      let eng: irm.RuleEngine = new irm.RuleEngine();

      // Just look at most recent issues
      const client = new github.GitHub(token);

      // TODO - we probably should be able to get this from context
      const { data: issue } = await client.issues.get({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number
      });

      if (!issue.pull_request) {
        let results: irm.ITagResults = eng.processRules(issue.body, issueRules.rules);

        if (results.labelsToAdd && results.labelsToAdd.length == 0) {
          results = eng.processRules(issue.body, issueRules.noMatches);
        }

        eng.processTags(results.labelsToAdd, issueRules.tags);

        if (results.labelsToAdd.length > 0) {
          console.log('Adding labels', JSON.stringify(results.labelsToAdd));
        }
        else {
          console.log('No labels to add');
        }

        if (results.assigneesToAdd.length > 0) {
          console.log('Adding assignees', JSON.stringify(results.assigneesToAdd));
        }
        else {
          console.log('No assignees to add');
        }

        let labels: string[] = [];
        issue.labels.forEach((label: any) => {
          labels.push(label.name);
        })
        labels = labels.concat(results.labelsToAdd);

        let assignees: string[] = [];
        issue.assignees.forEach((assignee: any) => {
          assignees.push(assignee.login);
        })
        assignees = assignees.concat(results.assigneesToAdd);

        await client.issues.update({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: issue.number,
          labels: labels,
          assignees: assignees
        });
      }
    }
    catch (err) {
      // TODO: figure out a good tracing / logging story
    }
}

run();
