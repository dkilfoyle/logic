var modules, instances, gates;

const createInstance = (parentNamespace, instance) => {
  // instance of main will have empty parentNamespace
  if (parentNamespace !== "") parentNamespace = parentNamespace + ".";

  const instanceModule = modules[instance.module];

  const varMap = instance.params.reduce((acc, param) => {
    acc[param.param] = {
      globalid: parentNamespace + param.mapped.id,
      type: "port",
      moduleid: param.param,
      instanceid: parentNamespace + instance.id + "." + param.param,
      porttype: instanceModule.ports.find(x => x.id == param.param).type
    };
    return acc;
  }, {});

  const addWire = wireLocalID => {
    varMap[wireLocalID] = {
      globalid: parentNamespace + instance.id + "." + wireLocalID,
      instanceid: parentNamespace + instance.id + "." + wireLocalID,
      moduleid: wireLocalID,
      type: "wire"
    };
    return varMap[wireLocalID].globalid;
  };

  instanceModule.wires.forEach(addWire);

  // create all the gates first because instance processes needs to refer back to gates
  const addGate = gate => {
    gates.push({
      id: varMap[gate.id].instanceid,
      logic: gate.gate,
      inputs: gate.params.map(param => varMap[param].globalid),
      instance: parentNamespace + instance.id,
      state: 0
    });
    return varMap[gate.id].instanceid;
  };

  instanceModule.statements.filter(x => x.type == "gate").forEach(addGate);

  const evaluateAssign = (node, parent) => {
    // if (node.type == "variable") {
    //   console.log("evaluateAssign: ", node.type, node.id, node.inverse, parent);
    // } else
    //   console.log(
    //     "evaluateAssign: ",
    //     node.type,
    //     node.inverse,
    //     node.operator,
    //     node.operand1,
    //     node.operand2,
    //     parent
    //   );
    if (node.inverse) {
      // prepare an inverter gate to pipe the node output
      if (!varMap["not" + node.id]) {
        // add a notA wire (if it doesn't already exist)
        // add a gate: not(notA, A)
        const notA = addWire("not" + node.id);
        addGate({
          id: "not" + node.id,
          gate: "not",
          params: [node.id],
          instance: parentNamespace + instance.id,
          state: 0
        });
      }
      // return "not" + node.id;
    }

    if (node.type === "variable") {
      return node.inverse ? "not" + node.id : node.id;
    }

    if (node.type === "binaryExpression") {
      // add an intermediary wire if necessary
      if (!varMap[parent]) addWire(parent);
      var newgate = {
        id: parent,
        gate: node.operator,
        params: [
          evaluateAssign(node.operand1, parent + "op1"),
          evaluateAssign(node.operand2, parent + "op2")
        ],
        instance: parentNamespace + instance.id,
        state: 0
      };
      // console.log("Adding gate: ", newgate);
      addGate(newgate);
      return parent;
    }
  };

  instanceModule.statements
    .filter(x => x.type == "assign")
    .forEach(statement => {
      // console.log("Assign: ", statement.id);
      return evaluateAssign(statement.value, statement.id);
    });

  var newInstance = {
    id: parentNamespace + instance.id,
    inputs: Object.values(varMap).filter(
      x => x.type == "port" && x.porttype == "input"
    ),
    outputs: Object.values(varMap).filter(
      x => x.type == "port" && x.porttype == "output"
    ),
    wires: Object.values(varMap).filter(x => x.type == "wire"),
    instances: []
  };

  instanceModule.statements
    .filter(x => x.type == "instance")
    .forEach(statement => {
      var childInstance = createInstance(
        parentNamespace + instance.id,
        statement
      );

      // connect childInstance outputs to parent instance gates
      // mapped parent must exist as gate, at least as buffer
      childInstance.outputs.forEach(o => {
        gates.find(g => g.id == o.globalid).inputs.push(o.instanceid);
      });

      newInstance.instances.push(childInstance.id);
    });

  instances.push(newInstance);

  return newInstance;
};

const walk = ast => {
  modules = ast.reduce((acc, module) => {
    if (!module.type == "module") {
      console.log("top level of ast should be modules only");
      return acc;
    }
    acc[module.id] = module;
    return acc;
  }, {});

  gates = [];
  instances = [];

  // create an instance of main module
  const mainInstance = {
    params: modules.main.ports.map(p => ({
      param: p.id,
      mapped: { id: "main." + p.id }
    })),
    id: "main",
    module: "main"
  };

  createInstance("", mainInstance);

  return { instances, gates };
};

export default walk;
