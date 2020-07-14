<template>
  <div>
    <codemirror
      ref="cmEditor"
      v-model="sourceCode"
      :options="cmOptions"
    ></codemirror>

    <div class="row q-pa-md">
      <q-btn @click="compile" :icon-right="compileIcon" label="Compile"></q-btn>
    </div>
  </div>
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

import vlgParser from "./vlgParser.js";
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
  data() {
    return {
      // code: exampleCode,
      cmOptions: {
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
      },
      compileState: "uncompiled",
      //       sourceCode: `function DFF(clk, d_in):
      //   not_d_in  = not(d_in)
      //   d_nand_a  = nand(d_in, clk)
      //   q         = nand(d_nand_a, q_)
      //   d_nand_c  = nand(not_d_in, clk)
      //   q_        = nand(d_nand_c, q)

      // function main():
      //   clock     = controlled
      //   A         = controlled
      //   E         = controlled
      //   gated_clk = and(clock, E)
      //   DFF1      = call(DFF, gated_clk, A)
      // `
      sourceCode: `module SingleStage (
	 input a,
	 input b,
	 input cin,
	 output s,
	 output cout );
	 
	 wire w1, w2, w3;
	 
	 and( w1, a, b );
	 and( w2, a, cin );
	 and( w3, b, cin );
	 or( cout, w1, w2, w3 );

	 xor( s, a, b, cin );

endmodule

module main(
  output sum,
  output cout);

  wire a, b, cin;

  control(a);
  control(b);
  control(cin);

  SingleStage uut(
		.a(a), 
		.b(b), 
		.cin(cin), 
		.s(sum), 
		.cout(cout)
	);

	test begin
		#0  {a=0, b=0, cin=0};
    #2  {a=0, b=0, cin=0};
    #4  {a=0, b=0, cin=1};
    #6  {a=0, b=1, cin=0};
    #8  {a=0, b=1, cin=1};
    #10 {a=1, b=0, cin=0};
    #12 {a=1, b=0, cin=1};
    #14 {a=1, b=1, cin=0};
    #16 {a=1, b=1, cin=1};
	end
endmodule
`
      // entity T01 is
      //   port (A, B, C : in bit;
      //         F       : out bit);
      // end entity;

      // architecture sim of T01 is
      // signal An : bit;
      // begin
      // An <= not A;
      // end architecture;
    };
  },

  methods: {
    compile() {
      const parse = vlgParser(this.codemirror.getDoc().getValue()).parseState;
      if (parse.isError) {
        this.compileState = "error";
        console.log("Error");
      } else {
        this.compileState = "success";
        this.$emit("onCompile", parse.result);
      }
    }
  },
  computed: {
    codemirror() {
      return this.$refs.cmEditor.codemirror;
    },
    compileIcon: function() {
      if (this.compileState == "success") return "check_circle";
      if (this.compileState == "error") return "error_outline";
      return "replay";
    }
  },
  mounted() {}
};
</script>

<style></style>
