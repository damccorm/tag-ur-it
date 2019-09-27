export interface IIssueRules {
    rules: IIssueRule[];
    noMatches: IIssueRule[];
    tags: ITagsRule[];
}
export interface IIssueRule {
    valueFor?: string;
    option: string[];
    contains: string;
    equals: string;
    addLabels: string[];
    assign: string[];
}
export interface ITagsRule {
    noneIn: string[];
    noneMatch: string;
    addLabels: string[];
}
export interface ITagResults {
    labelsToAdd: string[];
    assigneesToAdd: string[];
}
export declare function loadYamlContents(yamlPath: string): Promise<any>;
export declare function splitLines(contents: string): string[];
export declare function parseYamlContents(contents: string): IIssueRules;
export declare class RuleEngine {
    private _valueForMap;
    constructor();
    processRules(issueContents: string, rules: IIssueRule[]): ITagResults;
    processTags(tags: string[], tagRules: ITagsRule[]): void;
    addIfNoneIn(add: string[], ifNone: string[], inTags: string[]): void;
    addIfNoneMatch(add: string[], ifNoneMatch: string, inTags: string[]): void;
    private processRulesForLine;
    private processContentRulesForLine;
    private pushValues;
}
