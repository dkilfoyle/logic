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
        <q-scroll-area style="height:70vh">
          <div class="row q-pa-md">
            <q-markup-table class="full-width">
              <thead class="bg-teal">
                <tr class="text-white">
                  <th class="text-left">GlobalID</th>
                  <!-- <th>InstanceID</th> -->
                  <th class="text-left">Function</th>
                  <th class="text-left">Inputs</th>
                  <th class="text-right">State</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="g in selectedGates" :key="g">
                  <td>{{ g }}</td>
                  <!-- <td>{{ g.instanceid }}</td> -->
                  <td>{{ getGate(g).logic }}</td>
                  <td>{{ getGate(g).inputs.join(", ") }}</td>
                  <td class="text-right">{{ getGate(g).state }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div></q-scroll-area
        >
        <p>{{ selectedGates }}</p>
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
