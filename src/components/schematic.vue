<template>
  <div>
    <svg ref="svgSchematic" id="svgSchematic" height="600" width="100%" />
  </div>
</template>

<script>
import * as d3 from "d3";
import { HwSchematic } from "./d3-hwschematic";
import scratch2 from "./scratch2";

const strip = x => JSON.parse(JSON.stringify(x));
const log = x => console.log(strip(x));

export default {
  // name: 'ComponentName',
  props: ["instances", "gates"],
  data() {
    return { elkData: scratch2, g: {} };
  },
  watch: {
    instances(newval) {
      this.buildNetlist();
    }
  },
  methods: {
    getInstance(id) {
      return this.instances.find(i => i.id == id);
    },
    buildInstance(currentNet) {
      const currentInstance = this.getInstance(currentNet.id);
      console.log("Building ", currentInstance.id, strip(currentInstance));

      // build gates of this instance
      this.gates
        .filter(gate => gate.instance == currentNet.id)
        .forEach(gate => {
          console.log("-- Gate: ", gate.id, gate);

          const gateNet = {
            id: gate.id + ".gate",
            hwMeta: {
              name:
                gate.logic == "control" || gate.logic == "buffer"
                  ? gate.id
                  : gate.logic.toUpperCase()
            },
            properties: {},
            hideChildren: true,
            ports: []
          };
          gate.inputs.forEach((input, i) => {
            console.log("----Gate Input: ", input);
            // is the input a port or a gate
            gateNet.ports.push({
              id: gate.id + "_input_" + i,
              hwMeta: { name: null },
              direction: "INPUT",
              properties: { portSide: "WEST" }
            });
            currentNet.edges.push({
              id: input + " : " + gate.id + "_input_" + i,
              source: currentNet.id,
              sourcePort: gate.inputsLocal[i], // input - todo: make walker same structure with ports
              target: gate.id + ".gate",
              targetPort: gate.id + "_input_" + i,
              hwMeta: { name: null }
            });
          });
          // single output
          gateNet.ports.push({
            id: gate.id, // + "_output",
            hwMeta: { name: null },
            direction: "OUTPUT",
            properties: { portSide: "EAST" }
          });
          // if gate is same name as an output
          if (currentNet.ports.some(port => port.id == gate.id + "_output")) {
            let edge = {
              id: gate.id + "_connection",
              hwMeta: { name: null },
              source: gateNet.id,
              sourcePort: gate.id, // + "_output",
              target: currentNet.id,
              targetPort: gate.id + "_output"
            };
            console.log("---- Connection to output: ", edge);
            currentNet.edges.push(edge);
          }
          currentNet.children.push(gateNet);
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
          console.log(
            "---- Port Input: " + input.instanceid + " = " + input.globalid
          );
          let port = {
            id: input.instanceid,
            hwMeta: { name: input.moduleid },
            direction: "INPUT",
            properties: { portSide: "WEST" }
          };
          childNet.ports.push(port);
          // currentNet.edges.push({
          //   id: input.globalid + "_" + port.id,
          //   hwMeta: { name: null },
          //   source: currentNet.id,
          //   sourcePort: input.globalid,
          //   target: childNet.id,
          //   targetPort: port.id
          // });
        });
        childInstance.outputs.forEach(output => {
          console.log(
            `---- Port Output: ${output.instanceid} = ${output.globalid}`
          );
          let port = {
            id: output.instanceid + "_output",
            hwMeta: { name: output.moduleid },
            direction: "OUTPUT",
            properties: { portSide: "EAST" }
          };
          childNet.ports.push(port);
          // currentNet.edges.push({
          //   source: childNet.id,
          //   sourcePort: port.id,
          //   target: currentNet.id, // == "main" ? "main_controls" : parent.id,
          //   targetPort: output.globalid,
          //   id: port.id + "_" + output.globalid,
          //   hwMeta: { name: null }
          // });
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
      this.buildInstance(this.elkData);
      log(this.elkData);
      console.log(JSON.stringify(this.elkData));

      // this.elkData = mynet;
      this.elkData = scratch2;

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
    this.g.bindData(this.elkData);
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
