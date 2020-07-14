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
        <q-markup-table>
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
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["gates", "instances"],
  data() {
    return {
      selected: "main"
    };
  },

  methods: {},
  computed: {
    instanceNodes: function() {
      const nodeArray = [];
      const sortedInstances = [...this.instances].sort();

      const nodeFinder = dir => {
        var parent = nodeArray;
        dir.forEach((d, dirIndex) => {
          console.log("1", parent, d);
          var foundIndex = nodeArray.findIndex(e => e.label == d);
          if (foundIndex == -1) {
            parent.push({
              label: d,
              dir: dir.slice(0, dirIndex + 1).join("."),
              children: []
            });
            parent = parent[0].children;
            console.log("2", parent);
          } else {
            parent = parent[foundIndex].children;
            console.log("3", parent);
          }
        });
      };

      sortedInstances.forEach(i => {
        console.log(i);
        nodeFinder(i.id.split("."));
      });

      return nodeArray;
    }
  },
  mounted() {}
};
</script>

<style></style>
