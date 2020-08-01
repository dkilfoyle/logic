<template>
  <div class="q-pa-md q-gutter-md">
    <q-card
      ><q-card-section>
        <q-btn @click="redraw" label="Redraw"></q-btn>
        <q-radio v-model="layout" val="force" label="Force"></q-radio
        ><q-radio v-model="layout" val="dagre" label="Dagre"></q-radio>
        <q-slider
          v-if="layout == 'force'"
          v-model="linkDistance"
          :min="10"
          :max="300"
          :step="25"
        ></q-slider>
        <q-checkbox v-model="showNodeLabels" label="Node Labels"></q-checkbox>
      </q-card-section>
      <q-separator />
      <q-card-section> <div ref="graph"></div></q-card-section
    ></q-card>
  </div>
</template>

<script>
import G6 from "@antv/g6";

const lineDash = [4, 2, 1, 2];
G6.registerEdge(
  "can-running",
  {
    setState(name, value, item) {
      // console.log("can-cunning: setState: ", name, value);
      const shape = item.get("keyShape");
      if (name === "running") {
        if (value) {
          let index = 0;
          shape.animate(
            () => {
              index++;
              if (index > 9) {
                index = 0;
              }
              const res = {
                lineDash: [4, 2, 1, 2],
                lineDashOffset: -index
              };
              // return the params for this frame
              return res;
            },
            {
              repeat: true,
              duration: 3000
            }
          );
        } else {
          shape.stopAnimate();
          shape.attr("lineDash", null);
        }
      } else {
        // for other states call the cubic-horizontal edge that we are extending
        item
          .get("shapeFactory")
          .getShape("cubic-horizontal")
          .setState(name, value, item);
        // shape.setState(name, value, item);
      }
    }
  },
  "cubic-horizontal"
);

// TODO: Edge animation for running state: https://g6.antv.vision/en/examples/scatter/stateChange

export default {
  // name: 'ComponentName',
  props: ["gates", "instances"],
  data() {
    return {
      graph: null,
      layout: "dagre",
      showNodeLabels: false,
      linkDistance: 150,
      time: 0
    };
  },
  watch: {
    graphData: function(val) {
      console.log("graphData Watch");
      // this.graph.data(val);
      this.graph.changeData(val);
      this.updateLogicStates();
    },
    graphConfig: function(val) {
      console.log("graphConfig Watch");
      this.graph.updateLayout(val.layout);
    }
  },
  methods: {
    redraw: function() {
      // console.log("redraw");
      this.graph.data(this.graphData);
      this.graph.render();
      this.updateLogicStates();
    },
    updateLogicStates: function() {
      this.gates.forEach(gate => {
        const node = this.graph.findById(gate.id);
        node.setState("logic", gate.state == 1 ? "on" : "off");
        node
          .getEdges()
          .forEach(edge =>
            edge.setState("logic", gate.state == 1 ? "on" : "off")
          );
      });
    }
  },
  computed: {
    graphConfig: function() {
      if (this.layout == "force")
        return {
          layout: {
            type: "force",
            preventOverlap: true,
            linkDistance: this.linkDistance
          }
        };
      if (this.layout == "dagre") {
        return {
          layout: {
            type: "dagre",
            rankdir: "LR",
            align: "DL",
            // sortByCombo: true,
            controlPoints: true,
            nodesepFunc: () => 1,
            ranksepFunc: () => 1
          }
        };
      }
      return { layout: { type: "force" } };
    },
    graphData: function() {
      if (this.gates) {
        const graphData = {
          nodes: this.gates.map(x => {
            const graphNode = {
              id: x.id,
              label: this.showNodeLabels
                ? x.id.substring(x.id.lastIndexOf(".") + 1)
                : null,
              description: x.id,
              icon: {
                show: true,
                img: "" + x.logic + ".svg"
              },
              comboId: x.instance
              // logicState: x.state
            };
            if (x.logic == "buffer" || x.logic == "control") {
              (graphNode.anchorPoints = [
                [0, 0.5],
                [1, 0.5]
              ]),
                (graphNode.sourceAnchor = 0);
              graphNode.targetAnchor = 1;
            }
            return graphNode;
          }),
          edges: this.gates
            .map(gate => {
              if (gate.inputs) {
                return gate.inputs.map(input => {
                  return {
                    source: input,
                    target: gate.id
                  };
                });
              } else return null;
            })
            .flat()
            .filter(x => x),
          combos: this.instances.map(i => {
            const parentId = i.id.substring(0, i.id.lastIndexOf("."));
            const level = i.id.split(".").length - 1;
            const x = {
              id: i.id,
              label: i.id.substring(i.id.lastIndexOf(".") + 1),
              style: { fillOpacity: level * 0.3 }
            };
            if (parentId != "") x.parentId = parentId;
            return x;
          })
        };

        console.log("graphData Computed: ", graphData);
        return graphData;
      }
      return {};
    }
  },
  mounted() {
    // console.log("mounted");
    this.graph = new G6.Graph({
      container: this.$refs.graph,
      width: 700,
      height: 700,
      groupByTypes: false,
      fitView: true,
      fitViewPadding: 40,
      // renderer: "svg",
      layout: this.graphConfig.layout,
      animate: true, // Boolean, whether to activate the animation when global changes happen
      animateCfg: {
        duration: 500, // Number, the duration of one animation
        easing: "easeLinear" // String, the easing function
      },
      defaultNode: {
        type: "circle",
        size: 30,
        linkPoints: {
          top: false,
          bottom: false,
          left: false,
          right: false,
          fill: "#fff",
          size: 5
        },
        anchorPoints: [
          [0, 0.25],
          [0, 0.75],
          // [0, 0.5],
          // [1, 0.25],
          // [1, 0.75],
          [1, 0.5]
        ],
        sourceAnchor: 2, //3,
        targetAnchor: 0,
        labelCfg: {
          style: {
            fill: "#1890ff",
            fontSize: 6
          },
          position: "bottom"
        },
        style: {
          opacity: 1,
          lineWidth: 1,
          stroke: "#999"
        }
      },
      defaultEdge: {
        type: "can-running",
        style: {
          endArrow: {
            path: G6.Arrow.triangle(4, 4, 0),
            d: 0,
            fill: "#999"
          },
          startArrow: false,
          opacity: 1,
          lineWidth: 1,
          stroke: "#999"
        }
      },
      defaultCombo: {
        type: "rect",
        anchorPoints: [
          [0, 0.25],
          [0, 0.75],
          [0, 0.5],
          [1, 0.5]
        ],
        sourceAnchor: 3,
        targetAnchor: 0
      },
      nodeStateStyles: {
        "hover:connected": {
          opacity: 1
        },
        "hover:notconnected": {
          opacity: 0.6
        },
        "hover:nothovering": {
          opacity: 1
        },
        selected: {},
        "logic:on": {
          stroke: "orangered",
          fill: "lightsalmon"
        },
        "logic:off": {
          stroke: "royalblue",
          fill: "skyblue"
        }
      },
      edgeStateStyles: {
        "hover:connected": {
          opacity: 1,
          lineWidth: 2
        },
        "hover:notconnected": {
          opacity: 0.2
        },
        "hover:nothovering": {
          opacity: 1
        },
        "logic:on": {
          stroke: "orangered",
          endArrow: {
            path: G6.Arrow.triangle(4, 4, 0),
            d: 5,
            fill: "orangered"
          }
        },
        "logic:off": {
          stroke: "royalblue",
          endArrow: { fill: "royalblue" }
        }
      },
      modes: {
        default: [
          "drag-node",
          "drag-canvas",
          "drag-combo",
          "collapse-expand-combo",
          "zoom-canvas",
          {
            type: "tooltip",
            formatText: function formatText(model) {
              const text = model.description;
              return text;
            },
            offset: 30
          }
        ]
      }
    });
    this.graph.on("node:click", ev => {
      const shape = ev.target;
      const node = ev.item;
      this.$emit("nodeClick", node.get("id"), this.time);
      const saveState = node.hasState("selected");
      node.setState("selected", !saveState);
    });
    this.graph.on("node:mouseenter", ev => {
      // set all edges and nodes to inactive
      var edges = this.graph
        .getEdges()
        .forEach(edge => edge.setState("hover", "notconnected"));
      var edges = this.graph
        .getNodes()
        .forEach(node => node.setState("hover", "notconnected"));
      // now set edges connected to this node to active and running
      const node = ev.item;
      edges = node.getEdges();
      edges.forEach(edge => {
        edge.setState("running", true);
        edge.setState("hover", "connected");
        // this.graph.setItemState(edge, "active", true);
      });
      node.setState("hover", "connected");
    });
    this.graph.on("node:mouseleave", ev => {
      // reset all edges to default
      var edges = this.graph
        .getEdges()
        .forEach(edge => edge.setState("hover", "nothovering"));
      var edges = this.graph
        .getNodes()
        .forEach(node => node.setState("hover", "nothovering"));
      const node = ev.item;
      edges = node.getEdges();
      edges.forEach(edge => edge.setState("running", false));
      node.setState("hover", "nothovering");
    });
    this.set;
    this.redraw();
  }
};
</script>
<style>
.g6-tooltip {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 12px;
  color: #545454;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 8px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}
</style>
