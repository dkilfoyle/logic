<template>
  <div>
    <svg ref="svgSchematic" id="svgSchematic" height="600" width="100%" />
  </div>
</template>

<script>
import * as d3 from "d3";
import { HwSchematic } from "./d3-hwschematic";
import scratch2 from "./scratch2";

import vlgCompile from "./vlgCompile.js";

const strip = x => JSON.parse(JSON.stringify(x));
const log = x => console.log(strip(x));
const localid = x => x.substr(x.lastIndexOf(".") + 1);
const namespace = x => x.substr(0, x.lastIndexOf("."));

export default {
  // name: 'ComponentName',
  props: ["parseTree"],
  data() {
    return { elkData: {}, g: {}, instances: [], gates: [] };
  },
  watch: {
    parseTree(newval) {
      this.buildNetlist();
    }
  },
  methods: {
    getGate(id) {
      return this.gates.find(i => i.id == id);
    },
    getInstance(id) {
      return this.instances.find(i => i.id == id);
    },
    buildInstance(currentNet) {
      const currentInstance = this.getInstance(currentNet.id);
      console.log("Building ", currentInstance.id, strip(currentInstance));

      // build gates of this instance
      currentInstance.gates.forEach(gateId => {
        const gate = this.getGate(gateId);

        const gateNet = {
          id: gate.id + ".gate",
          hwMeta: {
            name:
              gate.logic == "control" ||
              gate.logic == "buffer" ||
              gate.logic == "response"
                ? gate.id
                : gate.logic.toUpperCase()
          },
          properties: {},
          hideChildren: true,
          ports: []
        };
        gate.inputs.forEach((input, i) => {
          gateNet.ports.push({
            id: gate.id + "_input_" + i,
            hwMeta: { name: null },
            direction: "INPUT",
            properties: { portSide: "WEST" }
          });
          currentNet.edges.push({
            id: input + " : " + gate.id + "_input_" + i,
            source: namespace(gate.inputs[i]),
            sourcePort: gate.inputs[i],
            target: gate.id + ".gate",
            targetPort: gate.id + "_input_" + i,
            hwMeta: { name: null }
          });
        });
        // single output unless response
        if (gate.logic != "response") {
          gateNet.ports.push({
            id: gate.id,
            hwMeta: { name: null },
            direction: "OUTPUT",
            properties: { portSide: "EAST" }
          });
        }
        currentNet.children.push(gateNet);
        console.log("-- Gate: ", gate.id, strip(gateNet));
      });

      // build any sub-instances
      currentInstance.instances.forEach(childInstanceID => {
        const childInstance = this.getInstance(childInstanceID);
        console.log("-- childInstance: ", childInstanceID, childInstance);
        const childNet = {
          id: childInstanceID,
          hwMeta: {
            name: childInstanceID,
            maxID: currentNet.hwMeta.maxId + 100
          },
          properties: {
            "org.eclipse.elk.portConstraints": "FREE",
            "org.eclipse.elk.hierarchyHandling": "INCLUDE_CHILDREN"
          },
          hideChildren: false,
          ports: [],
          children: [],
          edges: []
        };

        // Build ports for childinstance and connect to currentinstance gates
        childInstance.inputs.forEach(input => {
          console.log(`---- Port Input: ${localid(input)} = ${input}`);
          let port = {
            id: input,
            hwMeta: { name: localid(input) },
            direction: "INPUT",
            properties: { portSide: "WEST" }
          };
          childNet.ports.push(port);
          // get the buffer gate for this port
          const portGate = this.getGate(input);
          childNet.edges.push({
            id: portGate.inputs[0] + "_" + input,
            hwMeta: { name: null },
            source: portGate.inputs[0] + ".gate",
            sourcePort: portGate.inputs[0],
            target: namespace(input),
            targetPort: input
          });
        });
        childInstance.outputs.forEach(output => {
          console.log(`---- Port Output: ${localid(output)} = ${output}`);
          let port = {
            id: output,
            hwMeta: { name: localid(output) },
            direction: "OUTPUT",
            properties: { portSide: "EAST" }
          };
          childNet.ports.push(port);
          const portGate = this.getGate(output);
          childNet.edges.push({
            id: output + "_" + portGate.inputs[0],
            source: portGate.inputs[0] + ".gate",
            sourcePort: portGate.inputs[0],
            target: namespace(output),
            targetPort: output,
            hwMeta: { name: null }
          });
        });

        this.buildInstance(childNet); // add any child instances of this child
        currentNet.children.push(childNet);
      });
    },
    buildNetlist() {
      // this.buildMain();
      this.elkData = {
        id: "main",
        hwMeta: { name: "main", maxId: 200 },
        properties: {
          "org.eclipse.elk.portConstraints": "FREE",
          "org.eclipse.elk.hierarchyHandling": "INCLUDE_CHILDREN"
        },
        hideChildren: false,
        ports: [],
        children: [],
        edges: []
      };

      const compileResult = vlgCompile(this.parseTree);
      this.instances = compileResult.instances;
      this.gates = compileResult.gates;
      console.log(compileResult);

      this.buildInstance(this.elkData);
      log(this.elkData);
      console.log(JSON.stringify(this.elkData));
      this.g.bindData(this.elkData);
    },
    zoom() {
      this.g.root.attr("transform", d3.event.transform);
    }
  },

  mounted() {
    var svg = d3.select("#svgSchematic");
    // .attr("width", 600)
    // .attr("height", 600);
    this.g = new HwSchematic(svg);
    var zoom = d3.zoom();
    zoom.on("zoom", this.zoom);
    svg.call(zoom).on("dblclick.zoom", null);
    // this.g.bindData(this.elkData);
    this.buildNetlist();
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
  stroke-width: 8;
  fill: none;
  stroke: deepskyblue;
}

.link-wrap {
  stroke-width: 8;
  fill: none;
  /* stroke: white; */
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
</style>
