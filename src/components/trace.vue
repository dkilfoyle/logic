<template>
  <div class="q-pa-sm q-gutter-sm">
    <div class="row">
      <div class="col-3">
        <div class="text-subtitle2">Instances</div>
        <q-tree
          :nodes="instanceNodes"
          node-key="dir"
          selected-color="primary"
          :selected.sync="selected"
          default-expand-all
        />
      </div>

      <div class="col-9 q-gutter-md">
        <div class="row">
          <q-radio v-model="include" val="all" label="All" />
          <q-radio v-model="include" val="inputs" label="Inputs" />
          <q-radio v-model="include" val="outputs" label="Outputs" />
          <q-checkbox v-model="includeClock" label="Clock" />
        </div>

        <div class="row" v-if="includeClock">
          <div class="col-9">
            <trace-chart
              :chart-data="clockData"
              :options="traceoptions"
            ></trace-chart>
          </div>
          <div class="col-3">
            <div class="text-caption">Clock</div>
          </div>
        </div>
        <div v-if="selectedInstance">
          <div class="row" v-for="g in selectedGates" :key="g.id">
            <div class="col-9">
              <trace-chart
                :chart-data="tracedata(g.id)"
                :options="traceoptions"
              ></trace-chart>
            </div>
            <div class="col-3">
              <div class="text-caption">{{ g.id }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TraceChart from "./traceChart.js";

export default {
  props: ["simulation", "gates", "instances"],
  components: { TraceChart },
  data() {
    return {
      selected: "main",
      include: "all",
      includeClock: true
    };
  },

  methods: {
    tracedata: function(id) {
      return {
        labels: this.simulation.time,
        datasets: [
          {
            label: id,
            data: this.simulation[id],
            steppedLine: true,
            pointRadius: 0
          }
        ]
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
    },
    selectedGates: function() {
      switch (this.include) {
        case "all":
          return this.gates.filter(
            gf => gf.id.slice(0, gf.id.lastIndexOf(".")) == this.selected
          );
          break;
        case "outputs":
          return this.gates.filter(gf =>
            this.selectedInstance.outputs.some(x => x.globalid == gf.id)
          );
          break;
        case "inputs":
          return this.gates.filter(gf =>
            this.selectedInstance.inputs.some(x => x.globalid == gf.id)
          );
          break;
      }
      return [];
    },
    selectedInstance: function() {
      return this.instances.find(x => x.id == this.selected);
    },
    instanceNodes: function() {
      const nodeArray = [];
      const sortedInstances = [...this.instances].sort();

      // TODO: more elegant solution?
      const nodeFinder = dir => {
        var parent = nodeArray;
        dir.forEach((d, dirIndex) => {
          var foundIndex = nodeArray.findIndex(e => e.label == d);
          if (foundIndex == -1) {
            parent.push({
              label: d,
              dir: dir.slice(0, dirIndex + 1).join("."),
              children: []
            });
            parent = parent[0].children;
          } else {
            parent = parent[foundIndex].children;
          }
        });
      };

      sortedInstances.forEach(i => {
        nodeFinder(i.id.split("."));
      });

      return nodeArray;
    }
  },
  mounted() {}
};
</script>

<style></style>
