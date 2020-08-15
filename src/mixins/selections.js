export default {
  data: function() {
    return { instanceID: "main", showWhichGates: "all" };
  },
  watch: {
    instances: function() {
      this.instanceID = "main";
      this.showWhichGates = "all";
    }
  },
  computed: {
    selectedInstance: function() {
      return this.getInstance(this.instanceID);
    },
    instanceTree: function() {
      const buildNode = id => {
        const instance = this.instances.find(x => x.id == id);
        return {
          label: instance.id.slice(instance.id.lastIndexOf("_") + 1),
          id: instance.id,
          children: instance.instances.map(ci => buildNode(ci))
        };
      };
      return [buildNode("main")];
    },
    selectedGates: function() {
      switch (this.showWhichGates) {
        case "all":
          return this.allInstanceGates;
        case "wires":
          return [...this.getGates(this.instanceID)];
        case "outputs":
          return [...this.getOutputs(this.instanceID)];
        case "inputs":
          return [...this.getInputs(this.instanceID)];
        case "ports":
          return [
            ...this.getInputs(this.instanceID),
            ...this.getOutputs(this.instanceID)
          ];
      }
      return [];
    },
    allInstanceGates: function() {
      return [
        ...new Set([
          ...this.getInputs(this.instanceID),
          ...this.getGates(this.instanceID),
          ...this.getOutputs(this.instanceID)
        ])
      ];
    }
  },
  methods: {
    getInputs: function(instanceId) {
      return this.getInstance(instanceId).inputs;
    },
    getOutputs: function(instanceId) {
      return this.getInstance(instanceId).outputs.map(x =>
        x.substr(0, x.indexOf("-out"))
      );
    },
    getGates: function(instanceId) {
      return this.getInstance(instanceId).gates.filter(
        x => this.getGate(x).type == "gate"
      );
    },
    isInput: function(instanceId, id) {
      return (
        this.getInputs(instanceId).some(x => x == id) ||
        this.getGate(id).logic == "control"
      );
    },
    isOutput: function(instanceId, id) {
      return (
        this.getOutputs(instanceId).some(x => x == id) ||
        this.getGate(id).logic == "response"
      );
    },
    getGate: function(id) {
      return this.gates.find(x => x.id == id);
    },
    getInstance: function(id) {
      return this.instances.find(x => x.id == id);
    },
    getLocalId: function(x) {
      return x.substr(x.lastIndexOf("_") + 1);
    }
  }
};
