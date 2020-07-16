<template>
  <q-page class="doc">
    <div class="q-pa-md row items-start q-gutter-md justify-center">
      <div class="col">
        <q-tabs inline-label v-model="tab">
          <q-tab name="code" label="Code"></q-tab>
          <q-tab name="gates" label="Gates" :disable="!gates.length"></q-tab>
          <q-tab name="trace" label="Trace" :disable="!gates.length"></q-tab>
          <q-tab
            name="graph"
            label="Schematic"
            :disable="!gates.length"
          ></q-tab>
        </q-tabs>
        <q-tab-panels v-model="tab">
          <q-tab-panel name="code" key="code"
            ><editor
              @onCompile="processAST"
              @onSimulate="runSimulation"
            ></editor
          ></q-tab-panel>
          <q-tab-panel name="trace" key="trace"
            ><trace :gates="gates" :instances="instances"></trace
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
import Trace from "../components/trace";
import Gates from "../components/gates";
import vlgWalker from "./vlgWalker.js";

const indexBy = (array, prop) =>
  array.reduce((output, item) => {
    output[item[prop]] = item;
    return output;
  }, {});

const logicFunctions = {
  not: a => ~a & 1,
  and2: (a, b) => a && b,
  nand2: (a, b) => not(a && b),
  or2: (a, b) => a || b,
  nor2: (a, b) => not(a || b),
  xor2: (a, b) => a ^ b,
  xnor2: (a, b) => not(a ^ b),
  and3: (a, b, c) => a && b && c,
  nand3: (a, b, c) => not(a && b && c),
  or3: (a, b, c) => a || b || c,
  nor3: (a, b, c) => not(a || b || c),
  xor3: (a, b, c) => a ^ b ^ c,
  xnor3: (a, b, c) => not(a ^ b ^ c)
};

const evaluate = (components, componentLookup) => {
  const logicOperation = component => {
    let logicFn = component.logic;
    if (component.inputs.length == 1 && logicFn == "not") {
      const aOut = componentLookup[component.inputs[0]];
      component.state = aOut === "x" ? "x" : logicFunctions.not(aOut.state);
      return;
    }

    const aOut = componentLookup[component.inputs[0]];
    const bOut = componentLookup[component.inputs[1]];

    if (component.inputs.length == 2) {
      component.state =
        aOut === "x" || bOut === "x"
          ? "x"
          : logicFunctions[logicFn + "2"](aOut.state, bOut.state);
      return;
    }

    if (component.inputs.length == 3) {
      const cOut = componentLookup[component.inputs[2]];
      component.state =
        aOut === "x" || bOut === "x" || cOut === "x"
          ? "x"
          : logicFunctions[logicFn + "3"](aOut.state, bOut.state, cOut.state);
      return;
    }
  };

  components.forEach(component => {
    if (component.logic === "control") return;
    return logicOperation(component);
  });
};

export default {
  name: "PageIndex",
  components: {
    Editor,
    Graph,
    Gates,
    Trace
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
      const walk = vlgWalker(parseTree);
      this.instances = [...walk.instances];
      this.gates = [...walk.gates];
    },
    runSimulation() {
      const EVALS_PER_STEP = 5;
      var gatesLookup = indexBy(this.gates, "id");
      var instancesLookup = indexBy(this.instances, "id");
      const maxClock = 17;
      for (let clock = 0; clock < maxClock; clock++) {
        for (let i = 0; i < EVALS_PER_STEP; i++) {
          evaluate(this.gates, gatesLookup);
        }
        console.log(gatesLookup["main.uut.s"].state);
      }
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
