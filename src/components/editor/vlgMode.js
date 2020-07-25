import CodeMirror from "codemirror";
import vlgParser from "../vlgParser.js";

var lineColumn = require("line-column");

String.prototype.regexIndexOf = function(regex, startpos) {
  var indexOf = this.substring(startpos || 0).search(regex);
  return indexOf >= 0 ? indexOf + (startpos || 0) : indexOf;
};

CodeMirror.defineSimpleMode("vlg", {
  meta: {
    lineComment: "//"
  },
  start: [
    { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
    {
      regex: /(?:module|begin)/,
      token: "def",
      indent: true
    },
    {
      regex: /(?:input|output|endmodule|end)\b/,
      token: "def"
    },

    {
      regex: /(?:not|and|or|xor|nand|control|buffer)\b/,
      token: "keyword"
    },
    {
      regex: /(?:wire|test|assign)\b/,
      token: "variable-2"
    },
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

  var finder = lineColumn(text, { origin: 0 });

  const addError = (error, index, severity) => {
    var errorStart = finder.fromIndex(index);
    var errorEnd = finder.fromIndex(
      Math.max(text.regexIndexOf(/[\s\(\)\[\]\{\},=]/, index), index)
    );
    found.push({
      message: error,
      severity,
      from: CodeMirror.Pos(errorStart.line, errorStart.col),
      to: CodeMirror.Pos(errorEnd.line, errorEnd.col)
    });
  };

  parse.lint.forEach(x => addError(x.error, x.index, x.severity));
  if (parse.parseState.isError) {
    if (parse.lint.length == 0)
      addError(parse.parseState.error, parse.parseState.index);
  }

  return found;
});

var dictionary = {
  start: [
    "nand(",
    "and(",
    "or(",
    "xor(",
    "nor(",
    "not(",
    "control",
    "input",
    "output",
    "wire",
    "assign"
  ],
  none: ["module"]
};

CodeMirror.registerHelper("hint", "dictionaryHint", function(editor) {
  var cur = editor.getCursor();
  var curLine = editor.getLine(cur.line);
  var start = cur.ch;
  var end = start;
  var state = editor.getTokenAt(editor.getCursor()).state;
  // console.log(state);
  while (end < curLine.length && /[\w$]/.test(curLine.charAt(end))) ++end;
  while (start && /[\w$]/.test(curLine.charAt(start - 1))) --start;
  var curWord = start !== end && curLine.slice(start, end);
  var regex = new RegExp("^" + curWord, "i");
  // console.log(dictionary[state.section]);
  return {
    list: (!curWord
      ? dictionary[state.state]
      : dictionary[state.state].filter(function(item) {
          return item.match(regex);
        })
    ).sort(),
    from: CodeMirror.Pos(cur.line, start),
    to: CodeMirror.Pos(cur.line, end)
  };
});

CodeMirror.commands.autocomplete = function(cm) {
  CodeMirror.showHint(cm, CodeMirror.hint.dictionaryHint);
};
