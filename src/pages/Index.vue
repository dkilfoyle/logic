<template>
  <q-page class="doc">
    <div class="q-pa-md row items-start q-gutter-md justify-center">
      <div class="col">
        <q-tabs inline-label v-model="tab">
          <q-tab name="code" label="Code"></q-tab>
          <q-tab name="gates" label="Gates" :disable="!gates.length"></q-tab>
          <q-tab
            name="graph"
            label="Schematic"
            :disable="!gates.length"
          ></q-tab>
        </q-tabs>
        <q-tab-panels v-model="tab">
          <q-tab-panel name="code" key="code"
            ><editor @onCompile="processAST"></editor
          ></q-tab-panel>
          <q-tab-panel name="gates" key="gates"
            ><gates :gates="gates" :instances="instances"></gates
          ></q-tab-panel>
          <q-tab-panel name="graph" key="graph"
            ><graph :gates="gates" :instances="instances"
          /></q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script>
import Editor from "../components/editor/Editor";
import Graph from "../components/graph";
import Gates from "../components/gates";
import vlgWalker from "./vlgWalker.js";

export default {
  name: "PageIndex",
  components: {
    Editor,
    Graph,
    Gates
  },
  data() {
    return {
      tab: "code",
      layout: "dagre",
      parseTree: null,
      gates: [],
      instances: []
    };
  },
  methods: {
    processAST(parseTree) {
      console.log("index onCompile:", parseTree);
      const walk = vlgWalker(parseTree);
      this.instances = [...walk.instances];
      this.gates = [...walk.gates];
      console.log(this.gates);
    }
  }
};
</script>

<style>
.doc {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
</style>
