<template>
  <div class="q-pa-md q-gutter-md">
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
          <q-radio v-model="showWhichGates" val="outputs" label="Outputs" />
        </div>
        <div class="row">
          <q-markup-table>
            <thead>
              <tr>
                <th>GlobalID</th>
                <th>InstanceID</th>
                <th>Function</th>
                <th>Inputs</th>
                <th>State</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="g in selectedGates" :key="g.globalid">
                <td>{{ g.globalid }}</td>
                <td>{{ g.instanceid }}</td>
                <td>{{ getGate(g.globalid).logic }}</td>
                <td>{{ getGate(g.globalid).inputs.join(", ") }}</td>
                <td>{{ getGate(g.globalid).state }}</td>
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
import SelectionMixin from "./selections";

export default {
  props: ["gates", "instances", "file"],
  mixins: [SelectionMixin],
  data() {
    return {
      showWhichGates: "all"
    };
  }
};
</script>

<style></style>
