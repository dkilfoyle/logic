import CodeMirror from "codemirror";
CodeMirror.defineSimpleMode("asm", {
  start: [
    { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
    {
      regex: /(function)(\s+)([a-zA-Z$][\w$]*)/,
      token: ["keyword", null, "variable-2"]
    },
    {
      regex: /(?:not|nand|call|controlled|and|or)\b/,
      token: "def"
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
    { regex: /\:/, indent: true },
    { regex: /[\{\[\(]/, indent: true },
    { regex: /[\}\]\)]/, dedent: true },
    { regex: /[a-zA-Z$][\w$]*/, token: "variable" }
  ],
  comment: [
    { regex: /.*?\*\//, token: "comment", next: "start" },
    { regex: /.*/, token: "comment" }
  ]
});

var dictionary = {
  start: [
    "function ",
    "nand(",
    "and(",
    "or(",
    "nor(",
    "not(",
    "controlled",
    "call("
  ],
  none: ["section .text", "section .data"]
};

CodeMirror.registerHelper("hint", "dictionaryHint", function(editor) {
  var cur = editor.getCursor();
  var curLine = editor.getLine(cur.line);
  var start = cur.ch;
  var end = start;
  var state = editor.getTokenAt(editor.getCursor()).state;
  console.log(state);
  while (end < curLine.length && /[\w$]/.test(curLine.charAt(end))) ++end;
  while (start && /[\w$]/.test(curLine.charAt(start - 1))) --start;
  var curWord = start !== end && curLine.slice(start, end);
  var regex = new RegExp("^" + curWord, "i");
  console.log(dictionary[state.section]);
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

CodeMirror.registerHelper("fold", "asm", function(cm, start) {
  function hasSection(lineNo, line) {
    var match = line && line.match("function"); // /^(section|segment)\s((\.text)|(\.data))+/);
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

CodeMirror.registerHelper("lint", "asm", text => {
  var found = [];
  var lines;
  const parse = circuitParser(text);
  // console.log(parse);
  if (parse.parseState.isError) {
    // found = parse.error.map(e => ({
    found[0] = {
      message: parse.lint.error,
      from: this.codemirror.getDoc().posFromIndex(parse.lint.index),
      to: this.codemirror.getDoc().posFromIndex(parse.lint.index + 5)
      // }));
    };
  }
  return found;
});
