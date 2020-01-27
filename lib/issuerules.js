"use strict";
// You can import your modules
// import index from '../src/index'
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var js_yaml_1 = __importDefault(require("js-yaml"));
function loadYamlContents(yamlPath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs_1.default.readFile(yamlPath, function (err, data) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(data.toString());
                        }
                    });
                })];
        });
    });
}
exports.loadYamlContents = loadYamlContents;
function splitLines(contents) {
    return contents.split(/\r\n|\n|\r/);
}
exports.splitLines = splitLines;
function parseYamlContents(contents) {
    var yaml = js_yaml_1.default.safeLoad(contents);
    var issueRules = {};
    issueRules.rules = yaml['rules'];
    issueRules.noMatches = yaml['nomatches'];
    issueRules.tags = yaml['tags'];
    return issueRules;
}
exports.parseYamlContents = parseYamlContents;
var RuleEngine = /** @class */ (function () {
    function RuleEngine() {
        this._valueForMap = {};
    }
    RuleEngine.prototype.processRules = function (issueContents, rules) {
        var results = {};
        results.labelsToAdd = [];
        results.assigneesToAdd = [];
        this._valueForMap = {};
        console.log('inner test');
        if (rules) {
            for (var i = 0; i < rules.length; i++) {
                var key = rules[i].valueFor;
                if (key) {
                    this._valueForMap[key.toUpperCase()] = true;
                }
            }
        }
        console.log('inner test 1');
        var lines = splitLines(issueContents);
        for (var i = 0; i < lines.length; i++) {
            var lr = this.processRulesForLine(lines[i], rules);
            if (lr.labelsToAdd.length == 0 && lr.assigneesToAdd.length == 0) {
                lr = this.processContentRulesForLine(lines[i], rules);
            }
            this.pushValues(results.labelsToAdd, lr.labelsToAdd);
            this.pushValues(results.assigneesToAdd, lr.assigneesToAdd);
        }
        console.log('inner test 2');
        return results;
    };
    RuleEngine.prototype.processTags = function (tags, tagRules) {
        for (var i = 0; i < tagRules.length; i++) {
            var rule = tagRules[i];
            if (rule.noneIn) {
                this.addIfNoneIn(rule.addLabels, rule.noneIn, tags);
            }
            else if (rule.noneMatch) {
                this.addIfNoneMatch(rule.addLabels, rule.noneMatch, tags);
            }
        }
    };
    RuleEngine.prototype.addIfNoneIn = function (add, ifNone, inTags) {
        var found = false;
        for (var i = 0; i < ifNone.length; i++) {
            if (inTags.indexOf(ifNone[i]) >= 0) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.pushValues(inTags, add);
        }
    };
    RuleEngine.prototype.addIfNoneMatch = function (add, ifNoneMatch, inTags) {
        var found = false;
        //let regex = new RegExp(ifNoneMatch, "i");
        for (var i = 0; i < inTags.length; i++) {
            if (inTags[i].match(ifNoneMatch)) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.pushValues(inTags, add);
        }
    };
    RuleEngine.prototype.processRulesForLine = function (line, rules) {
        var results = {};
        results.labelsToAdd = [];
        results.assigneesToAdd = [];
        line = line.trim();
        // valuesFor
        var ci = line.indexOf(':');
        if (ci > 0 && line.length + 1 > ci) {
            var key = line.substr(0, ci);
            // only process this line against all rules if key is in any rule (n^2)
            if (this._valueForMap[key.toUpperCase()] == true) {
                var value = line.substr(ci + 1).trim().toUpperCase();
                for (var i = 0; i < rules.length; i++) {
                    var match = false;
                    var rule = rules[i];
                    if (rule.equals && rule.equals.toUpperCase() === value) {
                        match = true;
                    }
                    if (rule.contains && value.indexOf(rule.contains.toUpperCase()) >= 0) {
                        match = true;
                    }
                    if (match) {
                        this.pushValues(results.labelsToAdd, rule.addLabels);
                        this.pushValues(results.assigneesToAdd, rule.assign);
                    }
                }
            }
        }
        return results;
    };
    RuleEngine.prototype.processContentRulesForLine = function (line, rules) {
        var results = {};
        results.labelsToAdd = [];
        results.assigneesToAdd = [];
        line = line.trim();
        for (var i = 0; i < rules.length; i++) {
            var match = false;
            var rule = rules[i];
            if (!rule.valueFor && rule.contains && line.toUpperCase().indexOf(rule.contains.toUpperCase()) >= 0) {
                match = true;
            }
            if (match) {
                this.pushValues(results.labelsToAdd, rule.addLabels);
                this.pushValues(results.assigneesToAdd, rule.assign);
            }
        }
        return results;
    };
    RuleEngine.prototype.pushValues = function (arr, values) {
        if (values) {
            for (var i = 0; i < values.length; i++) {
                if (values[i] && arr.indexOf(values[i]) < 0) {
                    arr.push(values[i]);
                }
            }
        }
    };
    return RuleEngine;
}());
exports.RuleEngine = RuleEngine;
//# sourceMappingURL=issuerules.js.map
