<template>
  <codemirror
    ref="cmEditor"
    :value="value"
    @input="onChange"
    :options="cmOptions"
  ></codemirror>
</template>

<script>
import { codemirror } from "vue-codemirror";
import CodeMirror from "codemirror";
global.CodeMirror = CodeMirror;
import "codemirror/addon/mode/simple.js";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/foldgutter.css";

import vlgParser from "../vlgParser.js";
import vhdlMode from "./vhdlMode.js";
import vlgMode from "./vlgMode.js";

import "codemirror/lib/codemirror.css";
// import "codemirror/theme/base16-dark.css";
// import "codemirror/theme/ambiance.css";
import "codemirror/theme/monokai.css";

export default {
  // name: 'PageName',
  components: {
    codemirror
  },
  props: ["value"],
  data() {
    return {
      // code: exampleCode,

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
    onChange(val) {
      this.$emit("input", val);
    }
  },
  computed: {
    codemirror() {
      return this.$refs.cmEditor.codemirror;
    }
  }
};
</script>

<style>
.CodeMirror {
  height: 50vh;
}
</style>
