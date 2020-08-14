<template>
  <codemirror
    ref="cmEditor"
    :value="value"
    @ready="onReady"
    @input="onChange"
    :options="cmOptions"
  ></codemirror>
</template>

<script>
import { codemirror } from "vue-codemirror";
import CodeMirror from "codemirror";
global.CodeMirror = CodeMirror;
import "codemirror/addon/mode/simple.js";
import "codemirror/addon/edit/closebrackets.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/foldgutter.css";

import vlgParser from "../../lib/vlgParser.js";
import vlgMode from "../../lib/vlgMode.js";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";

var lineColumn = require("line-column");

export default {
  // name: 'PageName',
  components: {
    codemirror
  },
  props: ["value"],
  data() {
    return {
      parser: vlgParser,
      cmOptions: {
        viewportMargin: Infinity,
        tabSize: 2,
        indentUnit: 2,
        mode: "vlg",
        theme: "monokai",
        lineNumbers: true,
        line: true,
        extraKeys: {
          "Ctrl-Space": "autocomplete",
          "Shift-Ctrl-Space": "snippet",
          "Ctrl-/": "toggleComment",
          "Ctrl-Q": function(cm) {
            cm.foldCode(cm.getCursor());
          }
        },
        lint: { selfContain: true, getAnnotations: this.vlgValidator },
        autoCloseBrackets: true,
        matchBrackets: true,
        gutters: [
          "CodeMirror-lint-markers",
          "CodeMirror-linenumbers",
          "CodeMirror-foldgutter"
        ],
        foldGutter: true
      }
    };
  },

  methods: {
    vlgValidator: function(text, updateLinting, options) {
      if (text.length == 0) return [];
      var errors = [];

      const parse = this.parser(text);

      var finder = lineColumn(text, { origin: 0 });

      const addError = (error, index, severity) => {
        var errorStart = finder.fromIndex(index);
        var errorEnd = finder.fromIndex(
          Math.max(text.regexIndexOf(/[\s\(\)\[\]\{\},=]/, index), index)
        );
        errors.push({
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

      this.$emit("parsed", errors);
      return errors;
    },
    onReady(cm) {
      // this.$emit("parsed", errors);
    },
    onChange(val) {
      this.$emit("input", val);
    }
  },
  computed: {
    codemirror() {
      return this.$refs.cmEditor.codemirror;
    }
  },
  mounted() {}
};
</script>

<style>
.CodeMirror {
  height: 50vh;
}
.cm-s-monokai .CodeMirror-matchingbracket {
  font-weight: bold;
  text-decoration: none;
  color: #fff !important;
  background: #555 !important;
}
</style>
