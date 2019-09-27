"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var irm = __importStar(require("./issuerules"));
var core = __importStar(require("@actions/core"));
var github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var ymlPath, token, fileContents, issueRules, eng, client, issue, results, labels_1, assignees_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    ymlPath = core.getInput('configuration-path', { required: true });
                    token = core.getInput('repo-token', { required: true });
                    fileContents = fs.readFileSync(ymlPath, { encoding: 'utf8' });
                    if (github.context.payload.action !== 'opened') {
                        console.log('No issue or PR was opened, skipping');
                        return [2 /*return*/];
                    }
                    if (!github.context.payload.issue) {
                        console.log('The event that triggered this action was not a issue, skipping.');
                        return [2 /*return*/];
                    }
                    if (!fileContents) {
                        console.log('No file contents found in the rules file.');
                        return [2 /*return*/];
                    }
                    issueRules = irm.parseYamlContents(fileContents);
                    eng = new irm.RuleEngine();
                    client = new github.GitHub(token);
                    return [4 /*yield*/, client.issues.get({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            issue_number: github.context.issue.number
                        })];
                case 1:
                    issue = (_a.sent()).data;
                    console.log('Got issue', issue.number);
                    results = eng.processRules(issue.body, issueRules.rules);
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
                    labels_1 = [];
                    issue.labels.forEach(function (label) {
                        labels_1.push(label.name);
                    });
                    labels_1 = labels_1.concat(results.labelsToAdd);
                    assignees_1 = [];
                    issue.assignees.forEach(function (assignee) {
                        assignees_1.push(assignee.login);
                    });
                    assignees_1 = assignees_1.concat(results.assigneesToAdd);
                    return [4 /*yield*/, client.issues.update({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            issue_number: issue.number,
                            labels: labels_1,
                            assignees: assignees_1
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    core.setFailed(err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
run();
//# sourceMappingURL=index.js.map