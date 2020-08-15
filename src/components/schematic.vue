<template>
  <div>
    <svg ref="svgSchematic" id="svgSchematic" height="70vh" width="100%" />
    <q-btn @click="onSelect">select</q-btn>
  </div>
</template>

<script>
// import * as d3 from "d3";
// import { HwSchematic } from "./d3-hwschematic";

import UtilsMixin from "../mixins/utils";

export default {
  // name: 'ComponentName',
  props: ["compiled"],
  mixins: [UtilsMixin],
  data() {
    return { elkData: {}, g: {} };
  },
  watch: {
    compiled: {
      handler() {
        this.$nextTick(() => this.buildNetlist());
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    onSelect() {
      console.log(this.g.root);
    },
    getGate(id) {
      let res = this.compiled.gates.find(i => i.id == id);
      if (!res) throw new Error(`getGate(${id}): gate ${id} does not exist`);
      return res;
    },
    getInstance(id) {
      return this.compiled.instances.find(i => i.id == id);
    },

    buildNetlist() {
      this.elkData = {
        id: "main",
        hwMeta: { name: "main", maxId: 200 },
        properties: {
          "org.eclipse.elk.portConstraints": "FIXED_ORDER",
          "org.eclipse.elk.randomSeed": 0,
          "org.eclipse.elk.layered.mergeEdges": 1
        },
        hideChildren: false,
        ports: [],
        children: [],
        edges: []
      };

      this.buildInstance(this.elkData);
      console.log("Schematic: ", this.stripReactive(this.elkData));
      //console.log(JSON.stringify(this.elkData));

      this.g.bindData(this.elkData).then(() => {
        // add click handlers to all non-port gates
        console.log("buildNetList1: ", this.g.root);
        this.compiled.instances.forEach(instance =>
          instance.gates.forEach(gateId => {
            const node = this.g.root.select("#node-id-" + gateId + "_gate");
            node.on("click", d => console.log(d.id));
          })
        );
      });
    },
    buildInstance(currentNet) {
      const currentInstance = this.getInstance(currentNet.id);
      // console.log(
      //   "Building ",
      //   currentInstance.id,
      //   this.stripReactive(currentInstance)
      // );

      // build gates of this instance and edges for each of the gates inputs
      // gate inputs might be another gate or an input port
      currentInstance.gates.forEach((gateId, gateCount) => {
        const gate = this.getGate(gateId);

        const gateNet = {
          id: gate.id + "_gate",
          hwMeta: {
            maxId: currentNet.hwMeta.maxId + 50 + gateCount,
            cls_name: "gate",
            name:
              gate.logic == "control" ||
              gate.logic == "buffer" ||
              gate.logic == "response"
                ? this.getLocalId(gate.id)
                : gate.logic.toUpperCase(),
            isExternalPort: gate.logic == "control" || gate.logic == "response"
          },
          properties: {
            "org.eclipse.elk.portConstraints": "FIXED_ORDER",
            "org.eclipse.elk.randomSeed": 0,
            "org.eclipse.elk.layered.mergeEdges": 1
          },
          hideChildren: true,
          ports: []
        };

        // single output unless response
        if (gate.logic != "response") {
          gateNet.ports.push({
            id: gate.id,
            hwMeta: { name: this.getLocalId(gate.id) },
            direction: "OUTPUT",
            properties: { portSide: "EAST", portIndex: 0 }
          });
        }

        gate.inputs.forEach((input, i) => {
          gateNet.ports.push({
            id: gate.id + "_input_" + i,
            hwMeta: { name: this.getLocalId(gate.id) },
            direction: "INPUT",
            properties: {
              portSide: "WEST",
              portIndex: gate.inputs.length > 1 ? i + 1 : 0
            }
          });

          currentNet.edges.push({
            id: input + "-" + gate.id + "_input_" + i,
            type: "gate2gate",
            source: this.compiled.gates.some(
              x => x.type == "port" && x.id == gate.inputs[i]
            )
              ? this.getNamespace(gate.inputs[i]) // if the gate input is a port then source is the instance,
              : gate.inputs[i] + "_gate", // else source is a gate
            sourcePort: gate.inputs[i],
            target: gate.id + "_gate",
            targetPort: gate.id + "_input_" + i,
            hwMeta: { name: null }
          });
        });

        currentNet.children.push(gateNet);
        // console.log("-- Gate: ", gate.id, this.stripReactive(gateNet));
      });

      // build any sub-instances
      // build edges to connect currentNet mapped values to the sub-instance input ports
      currentInstance.instances.forEach(childInstanceID => {
        const childInstance = this.getInstance(childInstanceID);
        // console.log("-- childInstance: ", childInstanceID, childInstance);
        const childNet = {
          id: childInstanceID,
          hwMeta: {
            name: childInstanceID,
            maxID: currentNet.hwMeta.maxId + 100
          },
          properties: {
            // "org.eclipse.elk.portConstraints": "FREE"
            "org.eclipse.elk.portConstraints": "FIXED_ORDER",
            "org.eclipse.elk.randomSeed": 0,
            "org.eclipse.elk.layered.mergeEdges": 1
          },
          hideChildren: false,
          ports: [],
          children: [],
          edges: []
        };

        childInstance.outputs.forEach(output => {
          // console.log(`---- Port Output: ${this.getLocalId(output)} = ${output}`);
          let port = {
            id: output, // output will be in form {this.getNamespace}_{port}-out
            hwMeta: { name: this.getLocalId(output) },
            direction: "OUTPUT",
            properties: { portSide: "EAST", portIndex: 0 }
          };
          childNet.ports.push(port);

          // get the buffer gate for the output port = output-out
          const portGate = this.getGate(output);
          const feederGate = this.getGate(
            output.substr(0, output.indexOf("-out"))
          );

          childNet.edges.push({
            id: output + "_" + portGate.inputs[0],
            type: "gate2output",
            source: portGate.inputs[0] + "_gate",
            sourcePort: portGate.inputs[0],
            target: this.getNamespace(output),
            targetPort: output,
            hwMeta: { name: null }
          });
        });

        // Build ports for childinstance and connect to currentinstance gates
        childInstance.inputs.forEach((input, i) => {
          // console.log(`---- Port Input: ${this.getLocalId(input)} = ${input}`);
          let port = {
            id: input,
            hwMeta: { name: this.getLocalId(input), level: 0 },
            direction: "INPUT",
            properties: { portSide: "WEST", portIndex: i + 1 }
          };
          childNet.ports.push(port);

          // get the buffer gate for this port
          const portGate = this.getGate(input);
          currentNet.edges.push({
            id: portGate.inputs[0] + "-" + input,
            type: "parent2input",
            hwMeta: { name: null },
            source: currentInstance.inputs.some(x => x == portGate.inputs[0]) // is the input to the port gate itself a port of the parent instance rather than a local gate
              ? currentInstance.id
              : portGate.inputs[0] + "_gate", // TODO: source might be a gate or a port - ie a pass through, is this handled??
            sourcePort: portGate.inputs[0],
            target: this.getNamespace(input),
            targetPort: input
          });
        });

        this.buildInstance(childNet); // add any child instances of this child
        currentNet.children.push(childNet);
      });
    },

    zoom() {
      this.g.root.attr("transform", d3.event.transform);
    }
  },

  mounted() {
    const width = this.$refs.svgSchematic.clientWidth;
    const height = this.$refs.svgSchematic.clientHeight;
    var svg = d3
      .select("#svgSchematic")
      .attr("width", width)
      .attr("height", height);
    this.g = new d3.HwSchematic(svg);
    var zoom = d3.zoom();
    zoom.on("zoom", this.zoom);
    svg.call(zoom).on("dblclick.zoom", null);

    // this.buildNetlist();
  }
};
</script>

<style>
text {
  font-family: monospace;
}

.node {
  stroke: #bdbdbd;
  stroke-width: 1px;
  fill: #e6ffff;
  border: 2px;
}

.node text {
  font-style: normal;
  font-family: monospace;
  fill: black;
  stroke-width: 0px;
}

.node-operator {
  stroke: BLACK;
  stroke-width: 1px;
  fill: #e6ffff;
  border: 2px;
}

g.node-operator:hover {
  fill: red;
  stroke: red;
}

.node-operator text {
  font-style: normal;
  font-family: monospace;
  fill: black;
  stroke-width: 0px;
}

.node-external-port {
  stroke: #000;
  stroke-width: 0px;
  fill: #bdbdbd;
  border: 1px;
}

.node-external-port text {
  font-style: normal;
  font-family: monospace;
  fill: black;
  stroke-width: 0px;
}

.link {
  stroke: #000;
  stroke-opacity: 0.6;
  fill: none;
}

.link-selected {
  stroke: orange;
  /*stroke-opacity: .9;*/
  fill: none;
}

.link-wrap-activated {
  stroke-width: 4;
  fill: none;
  stroke: deepskyblue;
}

.link-wrap {
  stroke-width: 4;
  fill: none;
  stroke: white;
  opacity: 0;
}

.port {
  stroke: #000;
  opacity: 0.6;
}

tspan {
  white-space: pre;
}

body {
  margin: 0;
}

.hwschematic-tooltip {
  background: cornsilk;
  border: 1px solid black;
  border-radius: 5px;
  padding: 5px;
  position: fixed;
}

.gate {
  fill: red;
}
</style>
