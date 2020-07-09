<template>
  <div ref="graph"></div>
</template>

<script>
import G6 from "@antv/g6";

G6.registerNode("and", {
  draw(cfg, group) {
    // If there is style object in cfg, it should be mixed here
    const keyShape = group.addShape("path", {
      attrs: {
        path: this.getPath(cfg), // Get the path by cfg
        stroke: cfg.color // Apply the color to the stroke. For filling, use fill: cfg.color instead
      },
      // must be assigned in G6 3.3 and later versions. it can be any value you want
      name: "path-shape",
      // allow the shape to response the drag events
      draggable: true
    });
    if (cfg.label) {
      // If the label exists
      // The complex label configurations can be defined by labeCfg
      // const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
      // style.text = cfg.label;
      const label = group.addShape("text", {
        attrs: {
          x: 0, // center
          y: 0,
          textAlign: "center",
          textBaseline: "middle",
          text: cfg.label,
          fill: "#666"
        },
        // must be assigned in G6 3.3 and later versions. it can be any value you want
        name: "text-shape",
        // allow the shape to response the drag events
        draggable: true
      });
    }
    return keyShape;
  },
  // Return the path of a diamond
  getPath(cfg) {
    const size = cfg.size || [40, 40];
    const width = size[0];
    const height = size[1];
    //  / 1 \
    // 4     2
    //  \ 3 /
    const path = [
      ["M", 34, 3.5],
      ["L", 34, 5],
      ["L", 34, 75],
      ["L", 34, 76.5],
      ["L", 35.5, 76.5],
      ["C", 55.6316, 76.5, 72, 60.1316, 72, 40],
      ["C", 72, 19.8684, 55.6316, 3.5, 35.5, 3.5],
      ["L", 34, 3.5],
      ["Z"]
    ];
    return path;
  }
});

export default {
  // name: 'ComponentName',
  props: ["graphData", "graphConfig"],
  data() {
    return {
      graph: null
    };
  },
  watch: {
    graphData: function() {
      this.graph.data(this.graphData);
      this.graph.render();
    },
    graphConfig: function() {
      this.graph.updateLayout(this.graphConfig.layout);
    }
  },
  mounted() {
    this.graph = new G6.Graph({
      container: this.$refs.graph,
      width: 900,
      height: 600,
      fitView: true,
      // renderer: "svg",
      layout: this.graphConfig.layout,
      defaultNode: {
        type: "circle",
        size: 20,
        anchorPoints: [
          [0, 0],
          [0, 1],
          [0, 0.5],
          [1, 0.5]
        ],
        sourceAnchor: 3,
        targetAnchor: 0,
        clipCfg: {
          show: true,
          type: "circle",
          r: 15
        },
        labelCfg: {
          style: {
            fill: "#1890ff",
            fontSize: 6
          },
          position: "bottom"
        }
      },
      defaultEdge: {
        type: "polyline",
        // configure the bending radius and min distance to the end nodes
        style: {
          radius: 10,
          offset: 30,
          endArrow: true,
          startArrow: false,
          stroke: "#F6BD16"
        }
      },
      defaultCombo: {
        type: "rect"
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
            }
            // offset: 30
          }
        ]
      }
    });
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
