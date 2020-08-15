<template>
  <q-page class="doc">
    <div class="q-pa-md row items-start q-gutter-md justify-center">
      <div class="col">
        <q-tabs inline-label v-model="tab">
          <q-tab
            name="code"
            label="Code"
            icon="functions"
            class="text-purple"
          ></q-tab>
          <q-tab
            name="gates"
            label="Gates"
            icon="toc"
            :disable="!compiled.gates.length"
          ></q-tab>
          <q-tab
            name="trace"
            icon="timeline"
            label="Trace"
            :disable="!compiled.simulation.ready"
          ></q-tab>
          <q-tab
            name="graph"
            label="Graph"
            icon="electrical_services"
            :disable="!compiled.gates.length"
          ></q-tab>

          <q-tab
            name="schematic"
            label="Schematic"
            icon="electrical_services"
            :disable="!compiled.gates.length"
          ></q-tab>
        </q-tabs>

        <q-tab-panels
          v-model="tab"
          keep-alive
          dense
          animated
          transition-prev="fade"
          transition-next="fade"
        >
          <q-tab-panel name="code" key="code" class="q-gutter-md">
            <div class="row">
              <div class="col">
                <q-toolbar class="bg-grey-4 filetabs">
                  <q-tabs
                    v-for="file in openFiles"
                    :key="file"
                    shrink
                    stretch
                    dense
                    v-model="sourceTab"
                    inline-label
                    align="left"
                    no-caps
                    active-color="white"
                    active-bg-color="grey-9"
                    indicator-color="cyan"
                  >
                    <q-tab class="filetab" :name="file" :label="file" dense>
                    </q-tab></q-tabs
                  ><q-space></q-space>
                  <div class="q-gutter-sm">
                    <q-badge v-if="sourceErrors(sourceTab) > 0" color="red"
                      >{{ sourceErrors(sourceTab) }}
                      <q-icon name="warning" color="white" class="q-ml-xs"
                    /></q-badge>
                    <q-btn-dropdown dense label="Files">
                      <q-list v-for="file in allFiles" :key="file">
                        <q-item
                          clickable
                          v-close-popup
                          @click="onOpenFile(file)"
                        >
                          <q-item-section
                            ><q-item-label>{{
                              file
                            }}</q-item-label></q-item-section
                          >
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                    <q-btn
                      @click="closeFile"
                      size="xs"
                      flat
                      round
                      icon="close"
                      class="all-pointer-events z-top"
                    />
                  </div>
                </q-toolbar>
                <q-tab-panels
                  v-model="sourceTab"
                  keep-alive
                  v-for="file in openFiles"
                  :key="file"
                >
                  <q-tab-panel :name="file" :key="file" class="q-pa-none"
                    ><editor
                      v-model="source[file]"
                      @parsed="onParsed(file, $event)"
                  /></q-tab-panel>
                </q-tab-panels>
              </div>
            </div>
            <!-- <div class="q-gutter-md"> -->
            <!-- <q-card> -->
            <div class="row">
              <q-card class="col" bordered>
                <!-- <q-separator></q-separator> -->
                <q-card-section>
                  <div class="row q-gutter-md q-pb-md">
                    <q-btn
                      @click="compile"
                      color="primary"
                      :icon-right="compileIcon"
                      label="Compile"
                      :disable="sourceErrors(sourceTab) > 0"
                    ></q-btn>
                    <q-btn
                      @click="simulate"
                      color="secondary"
                      icon-right="play_arrow"
                      label="Simulate"
                      :disable="compiled.state != 'success'"
                    ></q-btn>
                    <q-space></q-space>
                  </div>
                  <div
                    class="row q-pa-sm"
                    v-show="showTerminal"
                    style="background-color: black"
                  >
                    <div class="col" id="terminal" style="height:20vh"></div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- </div> -->
          </q-tab-panel>
          <q-tab-panel name="trace" key="trace"
            ><trace
              :file="compiled.sourceFile"
              :simulation="compiled.simulation"
              :gates="compiled.gates"
              :instances="compiled.instances"
            ></trace
          ></q-tab-panel>
          <q-tab-panel name="gates" key="gates"
            ><gates
              :file="compiled.sourceFile"
              :gates="compiled.gates"
              :instances="compiled.instances"
            ></gates
          ></q-tab-panel>
          <q-tab-panel name="graph" key="graph"
            ><graph
              ref="graph"
              @nodeClick="onNodeClick"
              :file="compiled.sourceFile"
              :gates="compiled.gates"
              :instances="compiled.instances"
              :simulation="compiled.simulation"
          /></q-tab-panel>
          <q-tab-panel name="schematic" key="schematic"
            ><schematic ref="schematic" :compiled="compiled"
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
import Schematic from "../components/schematic";

import vlgParser from "../lib/vlgParser.js";
// import vlgWalker from "../lib/vlgWalker.js";
import vlgCompiler from "../lib/vlgCompiler.js";

import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

// import { Chalk } from "chalk";
const Chalk = require("chalk");
let options = { enabled: true, level: 2 };
const chalk = new Chalk.Instance(options);
const shortJoin = strs => {
  const x = strs.join(", ");
  if (x.length < 21) return x;
  else return x.slice(0, 40) + "...";
};

const indexBy = (array, prop) =>
  array.reduce((output, item) => {
    output[item[prop]] = item;
    return output;
  }, {});

const not = x => ~x & 1;

const logicFunctions = {
  not: a => ~a & 1,
  buffer: a => a,
  response: a => a,
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
    if (component.inputs.length == 1) {
      if (!(logicFn == "not" || logicFn == "buffer" || logicFn == "response")) {
        console.log(
          "Gate evaluation error - 1 input only valid for not and buffer gates"
        );
        return;
      }
      const aOut = componentLookup[component.inputs[0]];
      if (!aOut) {
        console.log(component.inputs[0]);
        throw new Error("component not found");
      }
      component.state =
        aOut === "x" ? "x" : logicFunctions[logicFn](aOut.state);
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

import BitAdder from "../files/1bitadder.v";
import DFF from "../files/dff.v";
import Scratch from "../files/scratch.v";
import OneHotDecoder from "../files/onehotdecoder.v";
import SevenSeg from "../files/7seg.v";
import Mux2_1 from "../files/mux.v";
import DeMux from "../files/demux.v";
import RippleCounter from "../files/ripplecounter.v";

import Vue from "vue";
import UtilsMixin from "../mixins/utils";

export default {
  name: "Index",
  mixins: [UtilsMixin],
  components: {
    Editor,
    Graph,
    Gates,
    Trace,
    Schematic
  },
  data() {
    return {
      EVALS_PER_STEP: 5,
      terminal: {},
      showTerminal: true,
      fitAddon: {},
      compiled: {
        timestamp: null,
        state: "uncompiled",
        sourceFile: "",
        parseTree: { lint: [] },
        gates: [],
        instances: [],
        simulation: { ready: false, gates: {}, time: [], maxTime: 0 }
      },
      tab: "code",
      source: {
        BitAdder,
        DFF,
        Scratch,
        OneHotDecoder,
        SevenSeg,
        Mux2_1,
        DeMux,
        RippleCounter
      },
      sourceTab: "Scratch",
      openFiles: [
        "Scratch",
        "OneHotDecoder",
        "SevenSeg",
        "Mux2_1",
        "DeMux",
        "RippleCounter",
        "BitAdder"
      ],
      errors: {}
    };
  },
  computed: {
    allFiles: function() {
      return Object.keys(this.source);
    },
    compileIcon: function() {
      if (this.compiled.state == "success") return "check_circle";
      if (this.compiled.state == "error") return "error_outline";
      return "replay";
    }
  },
  methods: {
    closeFile: function() {
      var index = this.openFiles.findIndex(x => x == this.sourceTab);
      this.openFiles.splice(index, 1);
      this.sourceTab = this.openFiles[index % this.openFiles.length];
    },
    sourceErrors: function(file) {
      return this.errors[file];
    },
    onParsed(file, event) {
      Vue.set(this.errors, file, event);
    },
    onOpenFile(file) {
      if (!this.openFiles.some(x => x == file)) this.openFiles.push(file);
      this.sourceTab = file;
    },
    termWriteln(str) {
      this.terminal.write(str + "\n\r");
      this.terminal.scrollToBottom();
    },

    compile() {
      this.showTerminal = true;

      const newCompiled = {};
      newCompiled.sourceFile = this.sourceTab;
      this.termWriteln(
        chalk.bold.green("• Compiling: ") + chalk.yellow(this.sourceTab)
      );

      const parse = vlgParser(this.source[this.sourceTab]).parseState;
      console.log("Parse: ", this.stripReactive(parse));
      if (parse.isError) {
        newCompiled.state = "error";
        this.termWriteln(chalk.red("└── Parser error: ") + parse.error);
        return;
      }

      newCompiled.state = "success";
      newCompiled.parseTree = parse.result;
      this.termWriteln(
        chalk.green(
          `├── Parsed ${newCompiled.parseTree.length} modules: ${chalk.white(
            newCompiled.parseTree.map(x => x.id).join(", ")
          )}`
        )
      );

      // const walk = vlgWalker(newCompiled.parseTree);
      const walk = vlgCompiler(newCompiled.parseTree);
      console.log("Compiled: ", this.stripReactive(walk));

      newCompiled.instances = [...walk.instances];
      newCompiled.gates = [...walk.gates];

      this.termWriteln(
        chalk.green(
          `├── Generated ${
            newCompiled.instances.length
          } instances: ${chalk.white(
            shortJoin(newCompiled.instances.map(x => x.id))
          )}`
        )
      );
      this.termWriteln(
        chalk.green(
          `└── Generated ${newCompiled.gates.length} gates: ${chalk.white(
            shortJoin(newCompiled.gates.map(x => x.id))
          )}`
        )
      );

      this.termWriteln(
        chalk.green.inverse(" DONE ") + "  Compiled successfully"
      );

      newCompiled.timestamp = Date.now();
      newCompiled.simulation = { ready: false };
      this.compiled = newCompiled; // do it this way so that Vue does not propogate reactive changes until this.compiled is fully updated
    },
    onNodeClick(nodeid, clock) {
      // the user clicked a node in the graph, if it is a control node toggle its value and re-run the simulation
      // console.log("onNodeClick", nodeid, clock);
      const foundNode = this.compiled.gates.find(g => g.id == nodeid);
      if (foundNode && foundNode.logic == "control") {
        // console.log("resimulating");
        foundNode.state = ~foundNode.state & 1;
        var gatesLookup = indexBy(this.compiled.gates, "id");
        for (let i = 0; i < this.EVALS_PER_STEP; i++) {
          evaluate(this.compiled.gates, gatesLookup);
        }
        this.$refs.graph.showLogicStates();
      }
    },
    simulate() {
      this.showTerminal = true;
      this.termWriteln(
        chalk.bold.cyan("• Simulating: ") +
          chalk.yellow(this.compiled.sourceFile)
      );

      const newSimulation = {
        gates: {},
        clock: [],
        time: [],
        ready: false
      };

      this.compiled.gates.forEach(g => {
        g.state = 0;
        newSimulation.gates[g.id] = [];
      });

      var gatesLookup = indexBy(this.compiled.gates, "id");
      var instancesLookup = indexBy(this.compiled.instances, "id");
      var modulesLookup = indexBy(this.compiled.parseTree, "id");

      const maxClock = modulesLookup.main.clock.reduce(
        (acc, val) => Math.max(val.time, acc),
        0
      );

      if (gatesLookup["main_clock"]) gatesLookup["main_clock"].state = 0;

      for (let clock = 0; clock <= maxClock; clock++) {
        newSimulation.time.push(clock);
        modulesLookup.main.clock.forEach(c => {
          if (c.time == clock) {
            c.assignments.forEach(a => {
              // can only assign values to control types
              if (gatesLookup["main_" + a.id].logic == "control")
                gatesLookup["main_" + a.id].state = a.value;
            });
          }
        });

        if (gatesLookup["main_clock"])
          gatesLookup["main_clock"].state =
            ~gatesLookup["main_clock"].state & 1; // tick-tock

        for (let i = 0; i < this.EVALS_PER_STEP; i++) {
          evaluate(this.compiled.gates, gatesLookup);
        }
        this.compiled.gates.forEach(g => {
          newSimulation.gates[g.id].push(gatesLookup[g.id].state);
        });

        newSimulation.clock.push(clock % 2);

        modulesLookup.main.clock.forEach((x, index, all) => {
          if (x.time != clock) return;

          const lineChar = index == all.length - 1 ? "└" : "├";

          this.termWriteln(
            chalk.cyan(
              `${lineChar}── Time ${clock.toString().padStart(3, "0")} :`
            ) +
              shortJoin(x.assignments.map(a => a.id + "=" + a.value)) +
              chalk.cyan(" => ") +
              shortJoin(
                instancesLookup.main.gates
                  .filter(gateId => gatesLookup[gateId].logic == "response")
                  .map(o => this.getLocalId(o) + "=" + gatesLookup[o].state)
              )
          );
        });
      }
      this.termWriteln(
        chalk.cyan.inverse(" DONE ") + "  Simulated successfully"
      );
      newSimulation.maxTime = newSimulation.time[newSimulation.time.length - 1];
      newSimulation.timestamp = Date.now();
      newSimulation.ready = true;
      this.compiled.simulation = newSimulation;
      console.log("Simulation: ", this.stripReactive(this.compiled.simulation));
    }
  },
  mounted() {
    this.terminal = new Terminal({ rows: 40 });
    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(document.getElementById("terminal"));
    this.fitAddon.fit();
  }
};
</script>

<style>
.doc {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.filetab.q-tab {
  padding: 0 8px;
}

.filetab.q-tab--inactive {
  border-right: 2px solid #c5c5c5;
}

.filetabs {
  padding-left: 0px;
  min-height: 40px;
}
</style>
