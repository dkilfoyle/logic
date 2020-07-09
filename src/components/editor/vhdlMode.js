import CodeMirror from "codemirror";
import vhdlParser from "./vhdlParser.js";
var lineColumn = require("line-column");

CodeMirror.defineSimpleMode("vhdl", {
  start: [
    { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
    {
      regex: /(?:is|end|of|begin)\b/,
      token: "def"
    },
    {
      regex: /(?:entity|architecture|process|port)\b/,
      token: "keyword"
    },
    {
      regex: /(?:in|out|bit)\b/,
      token: "variable-2"
    },
    // {
    //   regex: /(?:not|nand|call|controlled|and|or)\b/,
    //   token: "def"
    // },
    { regex: /true|false|null|undefined/, token: "atom" },
    {
      regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
      token: "number"
    },
    { regex: /\/\/.*/, token: "comment" },
    { regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3" },
    { regex: /\/\*/, token: "comment", next: "comment" },
    { regex: /[-+\/*=<>!]+/, token: "operator" },
    { regex: /[\{\[\(]/, indent: true },
    { regex: /[\}\]\)]/, dedent: true },
    { regex: /[a-zA-Z$][\w$]*/, token: "variable" }
  ],
  comment: [
    { regex: /.*?\*\//, token: "comment", next: "start" },
    { regex: /.*/, token: "comment" }
  ]
});

CodeMirror.registerHelper("fold", "vhdl", function(cm, start) {
  function hasSection(lineNo, line) {
    var match = line && line.match(/^(entity|architecture)+/);
    return match;
  }

  var firstLine = cm.getLine(start.line);
  var has = hasSection(start.line, firstLine);
  if (!has) return undefined;

  var lastLineNo = cm.lastLine();
  var end = start.line,
    nextLine = cm.getLine(end + 1);
  while (end < lastLineNo) {
    if (hasSection(end + 1, nextLine)) break;
    ++end;
    nextLine = cm.getLine(end + 1);
  }

  return {
    from: CodeMirror.Pos(start.line, firstLine.length),
    to: CodeMirror.Pos(end, cm.getLine(end).length)
  };
});

CodeMirror.registerHelper("lint", "vhdl", text => {
  if (text == "") return [];
  var found = [];
  const parse = vhdlParser(text);
  console.log(parse);

  if (parse.parseState.isError) {
    var finder = lineColumn(text, { origin: 0 });
    var errorPos1 = finder.fromIndex(parse.lint.index);
    var errorPos2 = finder.fromIndex(parse.lint.index + 5);
    found[0] = {
      message: parse.lint.error,
      from: CodeMirror.Pos(errorPos1.line, errorPos1.col),
      to: CodeMirror.Pos(errorPos2.line, errorPos2.col)
    };
  }
  return found;
});
