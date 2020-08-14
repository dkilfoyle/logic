<template>
  <div class="q-pa-sm q-gutter-sm">
    <div class="row">
      <div class="col-3">
        <div class="text-subtitle2">{{ file }}</div>
        <q-tree
          :nodes="instanceTree"
          node-key="id"
          selected-color="primary"
          :selected.sync="instanceID"
          default-expand-all
        />
      </div>

      <div class="col-9 q-gutter-md">
        <div class="row">
          <q-radio v-model="showWhichGates" val="all" label="All" />
          <q-radio v-model="showWhichGates" val="inputs" label="Inputs" />
          <q-radio v-model="showWhichGates" val="outputs" label="Outputs" />
        </div>

        <div v-if="selectedInstance">
          <q-scroll-area style="height:70vh">
            <div class="row q-pb-sm" v-for="g in selectedGates" :key="g">
              <div class="col-10">
                <dygraph
                  :data="tracedata(g)"
                  :options="traceOptions(g)"
                  ref="traces"
                ></dygraph>
              </div>
              <div class="col-2">
                <div class="text-caption">{{ getLocalId(g) }}</div>
              </div>
            </div>
            <div class="row q-pt-lg">
              <div class="col-10">
                <dygraph
                  :data="clock"
                  :options="{
                    showRangeSelector: true,
                    rangeSelectorHeight: 80,
                    axes: { y: { axisLabelWidth: 5 } }
                  }"
                  ref="clock"
                >
                </dygraph>
              </div>
              <div class="col-2"><div class="text-caption">Clock</div></div>
            </div>
          </q-scroll-area>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SelectionMixin from "./selections";
import dygraph from "./dygraph";

import _DygraphRoot from "dygraphs";
window.Dygraph = _DygraphRoot;
require("dygraphs/src/extras/synchronizer");

export default {
  props: ["simulation", "gates", "instances", "file"],
  mixins: [SelectionMixin],
  components: { dygraph },
  data() {
    return {};
  },
  computed: {
    clock: function() {
      return this.simulation.clock.map((x, i) => [i, x]);
    }
  },
  watch: {
    selectedGates: function(newselection) {
      this.$nextTick(() => {
        this.syncTraces();
      });
    }
  },
  methods: {
    syncTraces() {
      if (this.$refs.traces.length == 0) return;
      let traces = this.$refs.traces.map(x => x.graph);
      traces.push(this.$refs.clock.graph);
      Dygraph.synchronize(traces);
    },
    tracedata: function(id) {
      let data = [];
      for (let i = 0; i < this.simulation.time.length; i++) {
        data.push([this.simulation.time[i], this.simulation.gates[id][i]]);
      }
      return data;
    },
    traceOptions: function(id) {
      return {
        height: 50,
        showRangeSelector: false,
        xrangePad: 5,
        axes: {
          x: {
            drawAxis: false,
            drawGrid: false
            // axisLabelWidth: 0,
            // axisLabelFontSize: 0,
          },
          y: {
            drawAxis: true,
            drawGrid: false,
            axisLabelWidth: 5,
            axisLineColor: "white",
            axisLabelFormatter: () => {
              return null;
            }
          }
        },
        series: {
          Y1: { color: this.traceColor(id) }
        }
      };
    },
    traceColor: function(id) {
      if (this.selectedInstance.outputs.some(x => x == id))
        return "rgb(255,99,132)";
      if (this.selectedInstance.inputs.some(x => x == id)) {
        return "steelblue";
      }

      return "darkgrey";
    }
  },
  mounted() {
    this.syncTraces();
  }
};
</script>

<style></style>
