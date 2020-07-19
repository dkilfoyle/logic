import CodeMirror from "codemirror";
import vlgParser from "../vlgParser.js";
var lineColumn = require("line-column");

CodeMirror.defineSimpleMode("vlg", {
  start: [
    { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
    {
      regex: /(?:module|input|output|endmodule|begin|end)\b/,
      token: "def"
    },
    {
      regex: /(?:and|or|xor|nand|control|buffer)\b/,
      token: "keyword"
    },
    {
      regex: /(?:wire|test)\b/,
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

CodeMirror.registerHelper("fold", "vlg", function(cm, start) {
  function hasSection(lineNo, line) {
    var match = line && line.match(/^(begin|module)+/);
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

CodeMirror.registerHelper("lint", "vlg", text => {
  if (text == "") return [];
  var found = [];
  const parse = vlgParser(text);
  console.log(parse.parseState.result);

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
