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
          <div class="row" v-for="g in selectedGates" :key="g.globalid">
            <div class="col-9">
              <trace-chart
                :chart-data="tracedata(g.globalid)"
                :options="traceoptions"
              ></trace-chart>
            </div>
            <div class="col-3">
              <div class="text-caption">{{ g.globalid }}</div>
              <div class="text-caption">{{ g.instanceid }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TraceChart from "./traceChart.js";
import SelectionMixin from "./selections";

export default {
  props: ["simulation", "gates", "instances", "file"],
  mixins: [SelectionMixin],
  components: { TraceChart },
  data() {
    return {};
  },

  methods: {
    tracedata: function(id) {
      return {
        labels: this.simulation.time,
        datasets: [
          {
            ...this.traceColor(id),
            label: id,
            data: this.simulation[id],
            steppedLine: true,
            pointRadius: 0
          }
        ]
      };
    },
    traceColor: function(id) {
      if (this.selectedInstance.outputs.some(x => x.globalid == id))
        return {
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)"
        };
      if (this.selectedInstance.inputs.some(x => x.globalid == id))
        return {
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)"
        };
    }
  },
  computed: {
    clockData: function() {
      return {
        labels: this.simulation.time,
        datasets: [
          {
            label: "clock",
            data: this.simulation.clock,
            steppedLine: true,
            pointRadius: 0
          }
        ]
      };
    },
    traceoptions: function() {
      return {
        legend: {
          display: false
        },
        scales: {
          yAxes: [
            {
              ticks: {
                stepSize: 1
              }
            }
          ]
        }
      };
    }
  }
};
</script>

<style></style>
