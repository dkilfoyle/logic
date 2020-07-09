function asmMode() {
  function words(str) {
    var obj = {},
      words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
  var keywords = words("function");
  var specialInstructions = words("db dw");
  var sections = words("nand segment");
  var builtins = words("nand not and controlled call");
  var lineCommentStartSymbol = ";";

  return {
    startState: function() {
      return {
        tokenize: null,
        function: false
      };
    },

    token: function(stream, state) {
      if (state.tokenize) {
        console.log("tokenize", state);
        return state.tokenize(stream, state);
      }

      var cur,
        ch = stream.next();

      // comment
      if (ch === lineCommentStartSymbol) {
        stream.skipToEnd();
        return "comment";
      }

      // string style 1
      if (ch === "'") {
        stream.skipTo("'");
        return "string";
      }

      // string style 2
      if (ch === '"') {
        stream.eatWhile(/\w/);
        return "string";
      }

      if (["(", ")", "="].includes(ch)) {
        return "def";
      }

      if (ch == ":") {
        state.function = true;
      }

      if (ch === ".") {
        stream.eatWhile(/\w/);
        cur = stream.current().toLowerCase();
        if (sections.propertyIsEnumerable(cur)) return "tag";
      }

      // decimal and hexadecimal numbers
      if (/\d/.test(ch)) {
        if (ch === "0" && stream.eat("x")) {
          stream.eatWhile(/[0-9a-fA-F]/);
          return "number"; // hexadecimal number 0x11 0xff
        }
        stream.eatWhile(/\d/);
        return "number"; // normal number 12345
      }

      // labels and sections/segments - \w matches any alphanumeric or underscore
      if (/\w/.test(ch)) {
        stream.eatWhile(/\w/);
        if (stream.eat(":")) return "tag"; // return label eg _label:

        cur = stream.current().toLowerCase();
        // console.log("1: ", cur);

        if (cur === "section" || cur === "segment") {
          stream.eatSpace();
          stream.eatWhile(/\w|\./);

          cur = stream.current().toLowerCase();
          // console.log("2: ", cur);
          if (/(section|segment)\s\.text/.test(cur)) {
            state.section = "text";
            return "variable";
          } else if (/(section|segment)\s\.data/.test(cur)) {
            state.section = "data";
            return "variable";
          }
          state.section = "none";
          return null;
        }
      }

      if (keywords.propertyIsEnumerable(cur)) {
        stream.eatWhile(/\w/);
        return "keyword";
      }

      if (specialInstructions.propertyIsEnumerable(cur)) {
        stream.eatWhile(/\w/);
        return "tag";
      }

      if (builtins.propertyIsEnumerable(cur)) {
        stream.eatWhile(/\w/);
        return "atom";
      }
    },

    lineComment: lineCommentStartSymbol,
    // eslint-disable-next-line no-unused-vars
    indent: function(state, textAfter) {
      if (state.function == true) return 2;
    }
  };
}

export default asmMode;
