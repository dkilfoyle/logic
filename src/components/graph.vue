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
    },
    graphConfig: function(val) {
      console.log("graphConfig Watch");
      this.graph.updateLayout(val.layout);
    }
  },
  methods: {
    redraw: function() {
      console.log("redraw");
      this.graph.data(this.graphData);
      this.graph.render();
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
          nodes: this.gates.map(x => ({
            id: x.id,
            label: this.showNodeLabels
              ? x.id.substring(x.id.lastIndexOf(".") + 1)
              : null,
            description: x.id,
            style:
              x.state == 1
                ? {
                    stroke: "orangered",
                    fill: "lightsalmon"
                  }
                : {
                    stroke: "royalblue",
                    fill: "skyblue"
                  },
            type: "circle",
            icon: {
              show: true,
              img: "" + x.logic + ".svg"
            },
            comboId: x.instance
          })),
          edges: this.gates
            .map(gate => {
              if (gate.inputs) {
                return gate.inputs.map(input => ({
                  source: input,
                  target: gate.id
                }));
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
    console.log("mounted");
    this.graph = new G6.Graph({
      container: this.$refs.graph,
      width: 700,
      height: 600,
      groupByTypes: false,
      fitView: true,
      fitViewPadding: 20,
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
        style: {
          // fill: "#bae637",
          // stroke: "#eaff8f",
          // lineWidth: 5
        },
        linkPoints: {
          top: false,
          bottom: false,
          left: false,
          right: true,
          fill: "#fff",
          size: 5
        },
        anchorPoints: [
          [0, 0.25],
          [0, 0.75],
          [0, 0.5],
          [1, 0.25],
          [1, 0.75],
          [1, 0.5]
        ],
        sourceAnchor: 3,
        targetAnchor: 0,
        // clipCfg: {
        //   show: true,
        //   type: "circle",
        //   r: 25
        // },
        labelCfg: {
          style: {
            fill: "#1890ff",
            fontSize: 6
          },
          position: "bottom"
        }
      },
      defaultEdge: {
        type: "can-running",
        // type: "polyline",
        // configure the bending radius and min distance to the end nodes
        style: {
          // radius: 5,
          // offset: 30,
          endArrow: {
            path: G6.Arrow.triangle(3, 3),
            d: 0 // offset
          },
          startArrow: false,
          stroke: "#999"
          // stroke: "#F6BD16"
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
        active: {
          opacity: 1
        },
        inactive: {
          opacity: 0.4
        }
      },
      edgeStateStyles: {
        active: {
          stroke: "#F6BD16",
          lineWidth: 3,
          opacity: 1
        },
        inactive: {
          opacity: 0.4,
          stroke: "#999",
          lineWidth: 1
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
      // console.log(ev);
      // console.log(node._cfg.id);
      this.$emit("nodeClick", node._cfg.id, this.time);
    });
    this.graph.on("node:mouseenter", ev => {
      // set all edges to inactive
      var edges = this.graph.getEdges();
      edges.forEach(edge => {
        edge.update({
          style: {
            opacity: 0.3
          }
        });
      });
      // now set edges connected to this node to active style and then change state to running
      const node = ev.item;
      edges = node.getEdges();
      edges.forEach(edge => {
        edge.update({
          style: {
            opacity: 1,
            lineWidth: 2,
            endArrow: {
              path: G6.Arrow.triangle(0, 0, 0), // for some reason endArrow: false doesn't work
              d: 0 // offset
            }
          }
        });
        this.graph.setItemState(edge, "running", true);
      });
    });
    this.graph.on("node:mouseleave", ev => {
      // reset all edges to default
      var edges = this.graph.getEdges();
      edges.forEach(edge => {
        edge.update({
          style: {
            opacity: 1,
            lineWidth: 1,
            endArrow: {
              path: G6.Arrow.triangle(4, 4, 0),
              d: 0 // offset
            }
          }
        });
      });
      const node = ev.item;
      edges = node.getEdges();
      edges.forEach(edge => this.graph.setItemState(edge, "running", false));
    });
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
