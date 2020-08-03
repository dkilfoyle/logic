export default {
  data: function() {
    return { instanceID: "main", showWhichGates: "all" };
  },
  computed: {
    selectedInstance: function() {
      return this.getInstance(this.instanceID);
    },
    instanceTree: function() {
      const buildNode = id => {
        const instance = this.instances.find(x => x.id == id);
        return {
          label: instance.id.slice(instance.id.lastIndexOf(".") + 1),
          id: instance.id,
          children: instance.instances.map(ci => buildNode(ci))
        };
      };
      return [buildNode("main")];
    },
    selectedGates: function() {
      var instance = this.selectedInstance;

      switch (this.showWhichGates) {
        case "all":
          return [...instance.inputs, ...instance.wires, ...instance.outputs];
        case "wires":
          return [...instance.wires];
        case "outputs":
          return [...instance.outputs];
        case "inputs":
          return [...instance.inputs];
      }
      return [];
    },
    allInstanceGates: function() {
      var instance = this.selectedInstance;
      return [...instance.inputs, ...instance.wires, ...instance.outputs];
    }
  },
  methods: {
    getGate: function(id) {
      return this.gates.find(x => x.id == id);
    },
    getInstance: function(id) {
      return this.instances.find(x => x.id == id);
    }
  }
};
