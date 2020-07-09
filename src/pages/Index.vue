<template>
  <q-page class="doc">
    <div class="q-pa-md row items-start q-gutter-md justify-center">
      <div class="col"><editor @onCompile="processAST"></editor></div>
    </div>

    <div class="q-pa-md row items-start q-gutter-md justify-center">
      <div class="col">
        <q-card
          ><q-card-section>
            <q-radio v-model="layout" val="force" label="Force"></q-radio
            ><q-radio v-model="layout" val="dagre" label="Dagre"></q-radio>
            <q-slider
              v-if="layout == 'force'"
              v-model="linkDistance"
              :min="10"
              :max="300"
              :step="25"
            ></q-slider>
            <q-checkbox
              v-model="showNodeLabels"
              label="Node Labels"
            ></q-checkbox>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="q-pa-md row items-start q-gutter-md justify-center">
      <div class="col" style="position:relative">
        <q-card
          ><graph :graphData="astGraphData" :graphConfig="graphConfig"></graph
        ></q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import Editor from "../components/editor/Editor";
import Graph from "../components/graph";
export default {
  name: "PageIndex",

  components: {
    Editor,
    Graph
  },
  data() {
    return {
      layout: "dagre",
      showNodeLabels: false,
      linkDistance: 150,
      parseTree: null,
      functions: null,
      gates: null
    };
  },
  methods: {
    processAST(parseTree) {
      console.log("index onCompile:", parseTree);
      this.parseTree = parseTree;
      this.functions = this.parseTree
        .map(x => ({
          name: x.value.id,
          args: x.value.args,
          code: x.value.code.map(y => {
            if (y.type == "controlled") {
              return {
                type: "controlled",
                id: y.value.id
              };
            }
            return {
              type: y.type == "call" ? "call" : y.value.op.op,
              id: y.value.id,
              args: y.value.op.args
            };
          })
        }))
        .reduce((obj, item) => {
          return {
            ...obj,
            [item["name"]]: item
          };
        }, {});

      console.log(this.functions);

      const callFunction = (functionName, namespace, inputs) => {
        // map call inputs into function arguments
        const vars = inputs.reduce((acc, cur, i) => {
          acc[this.functions[functionName].args[i]] = cur;
          return acc;
        }, {});

        return this.functions[functionName].code.map(expression => {
          if (expression.type == "call") {
            return callFunction(
              expression.args[0],
              expression.id,
              expression.args
                .slice(1)
                .map(x => (vars[x] ? vars[x] : namespace + "." + x))
            );
          } else {
            return {
              group: namespace,
              id: namespace + "." + expression.id,
              inputs: expression.args
                ? expression.args.map(x =>
                    vars[x] ? vars[x] : namespace + "." + x
                  )
                : null,
              logic: expression.type
            };
          }
        });
      };

      this.gates = callFunction("main", "main", []).flat();
      console.log(this.gates);
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
            nodesepFunc: () => 1,
            ranksepFunc: () => 1
          }
        };
      }
      return { layout: { type: "force" } };
    },
    astGraphData: function() {
      if (this.gates) {
        const graphData = {
          nodes: this.gates.map(x => ({
            id: x.id,
            label: this.showNodeLabels
              ? x.id.substring(x.id.lastIndexOf(".") + 1)
              : null,
            description: x.id,
            type: "image",
            img: "statics/" + x.logic + ".png",
            comboId: x.group
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
          combos: this.gates.reduce((acc, cur) => {
            if (!acc.some(e => e.id === cur.group)) {
              acc.push({
                id: cur.group,
                label: cur.group
              });
            }
            return acc;
          }, [])
        };
        console.log(graphData);
        return graphData;
      }
      return {};
    }
  }
};
</script>

<style>
.doc {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
</style>
