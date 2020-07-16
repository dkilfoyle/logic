<template>
  <div class="q-pa-md q-gutter-md">
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

      <div class="col-9">
        <trace-chart
          :chart-data="tracedata"
          :chart-options="traceoptions"
        ></trace-chart>
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
      selected: "main"
    };
  },

  methods: {},
  computed: {
    tracedata: function() {
      return {
        labels: simulation.clock.length,
        datasets: [
          {
            label: "main.sum",
            data: simulation["main.sum"]
          }
        ]
      };
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
