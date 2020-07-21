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

import vlgParser from "../vlgParser.js";
import vlgMode from "./vlgMode.js";

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
          "Ctrl-L": "toggleComment",
          "Ctrl-Q": function(cm) {
            cm.foldCode(cm.getCursor());
          }
        },
        lint: { selfContain: true },
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
    onReady(cm) {
      const parse = vlgParser(this.value);
      const errors =
        parse.lint.length == 0 && parse.isError ? 1 : parse.lint.length;

      this.$emit("parsed", errors);
    },
    onChange(val) {
      this.$emit("input", val);
      const parse = vlgParser(val);
      const errors =
        parse.lint.length == 0 && parse.isError ? 1 : parse.lint.length;

      this.$emit("parsed", errors);
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
