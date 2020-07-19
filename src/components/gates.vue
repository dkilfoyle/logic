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

      <div class="col-9 q-gutter-md">
        <div class="row">
          <q-radio v-model="view" val="gates" label="Gates" />
          <q-radio v-model="view" val="outputs" label="Outputs" />
          <q-checkbox v-model="children" label="Include Children" />
        </div>
        <div class="row">
          <q-markup-table>
            <thead>
              <tr>
                <th v-if="view == 'outputs'">Port</th>
                <th>Gate</th>
                <th>Function</th>
                <th>Inputs</th>
                <th>State</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="g in selectedGates" :key="g.id">
                <td v-if="view == 'outputs'">
                  {{
                    selectedInstance.outputs.find(x => x.instanceportid == g.id)
                      .moduleportid
                  }}
                </td>
                <td>{{ g.id }}</td>
                <td>{{ g.logic }}</td>
                <td>{{ g.inputs.join(", ") }}</td>
                <td>{{ g.state }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from "quasar";
export default {
  props: ["gates", "instances"],
  data() {
    return {
      selected: "main",
      view: "gates",
      children: false
    };
  },

  methods: {},
  computed: {
    selectedGates: function() {
      if (this.view == "gates") {
        if (this.children) {
          return this.gates.filter(gf => gf.id.startsWith(this.selected));
        } else {
          return this.gates.filter(
            gf => gf.id.slice(0, gf.id.lastIndexOf(".")) == this.selected
          );
        }
      } else {
        return this.gates.filter(gf =>
          this.selectedInstance.outputs.some(o => o.instanceportid == gf.id)
        );
      }
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
