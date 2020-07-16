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
        <q-radio v-model="view" val="gates" label="Gates" />
        <q-radio v-model="view" val="outputs" label="Outputs" />
        <q-markup-table v-if="view == 'gates'">
          <thead>
            <tr>
              <th>ID</th>
              <th>Function</th>
              <th>Inputs</th>
              <th>State</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="g in gates.filter(gf => gf.id.startsWith(selected))"
              :key="g.id"
            >
              <td>{{ g.id }}</td>
              <td>{{ g.logic }}</td>
              <td>{{ g.inputs.join(", ") }}</td>
              <td>{{ g.state }}</td>
            </tr>
          </tbody>
        </q-markup-table>

        <q-markup-table v-if="view == 'outputs'">
          <thead>
            <tr>
              <th>Port</th>
              <th>Gate</th>
              <th>Function</th>
              <th>Inputs</th>
              <th>State</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="g in gates.filter(gf =>
                selectedInstance.outputs.some(o => o.instanceportid == gf.id)
              )"
              :key="g.id"
            >
              <td>
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
</template>

<script>
import { debounce } from "quasar";
export default {
  props: ["gates", "instances"],
  data() {
    return {
      selected: "main",
      view: "gates"
    };
  },

  methods: {},
  computed: {
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
