import state from "src/store/module-example/state";

var modules, instances, gates;

// const log = d => ({ ...d });
const log = d => JSON.parse(JSON.stringify(d));

const createInstance = (outputNamespace, instance) => {
  // instance of main will have empty outputNamespace
  if (outputNamespace !== "") outputNamespace = outputNamespace + ".";

  const instanceModule = modules[instance.module];

  console.log(
    `createInstance: ${instance.id} of ${instance.module} in ${outputNamespace} namespace`
  );
  console.log(`-- Instance`, log(instance));
  console.log(`-- Module`, log(instanceModule));

  const varMap = instance.params.reduce((acc, param) => {
    acc[param.port] = {
      globalid: outputNamespace + param.mapped.id,
      type: "port",
      index: param.mapped.index,
      moduleid: param.port,
      instanceid: outputNamespace + instance.id + "." + param.port,
      porttype: instanceModule.ports.find(x => x.id == param.port).varType
    };
    return acc;
  }, {});

  const addWire = wireLocalID => {
    varMap[wireLocalID] = {
      globalid: outputNamespace + instance.id + "." + wireLocalID,
      instanceid: outputNamespace + instance.id + "." + wireLocalID,
      moduleid: wireLocalID,
      type: "wire"
    };
    return varMap[wireLocalID].globalid;
  };

  instanceModule.wires.forEach(x => addWire(x.id));

  console.log("-- varMap: ", varMap);

  // create all the gates first because instance processes needs to refer back to gates
  const addGate = gate => {
    console.log("-- Adding gate: ", log(gate), log(varMap));
    gates.push({
      id: varMap[gate.id.id].instanceid,
      logic: gate.gate,
      inputs: gate.params.map(param => varMap[param.id].globalid),
      instance: outputNamespace + instance.id,
      state: 0
    });
    return varMap[gate.id.id].moduleid;
  };

  instanceModule.statements.filter(x => x.type == "gate").forEach(addGate);
  console.log("-- gates: ", gates);

  const evaluateAssignNode = (node, output) => {
    console.log(`output: ${output}, Type: ${node.type}`);
    let lastOutput;
    if (
      node.type == "BRACKETED_EXPRESSION" ||
      node.type == "ASSIGN_EXPRESSION"
    ) {
      let expr = node.value;
      console.log(" -- " + expr.map(x => x.type + ":" + x.value.id).join(", "));

      // for each operation triplet
      for (let i = 1; i < expr.length; i += 2) {
        let curOutput = i == expr.length - 2 ? output : output + "op" + i; // final operation, connect to final output
        if (!varMap[curOutput]) addWire(curOutput);
        lastOutput = addGate({
          id: curOutput,
          gate: expr[i].value.id,
          params: [
            i == 1
              ? evaluateAssignNode(expr[i - 1], output + "op" + (i - 1))
              : lastOutput,
            evaluateAssignNode(expr[i + 1], output + "op" + (i + 1))
          ]
        });
      }
      return lastOutput;
    }

    if (node.type == "VARIABLE") {
      lastOutput = node.value.id;
      if (node.invert) {
        // prepare an inverter gate to pipe the node output
        if (!varMap["not" + lastOutput]) {
          // add a notA wire (if it doesn't already exist)
          // add a gate: not(notA, A)
          const notA = addWire("not" + lastOutput);
          addGate({
            id: "not" + lastOutput,
            gate: "not",
            params: [lastOutput]
          });
        }
        return "not" + lastOutput;
      } else {
        return lastOutput;
      }
    }

    throw new Error(
      "vlgWalker shouldn't be here. Node is not VARIABLE or EXPRESSION"
    );
  };

  instanceModule.statements
    .filter(x => x.type == "assign")
    .forEach(statement => {
      return evaluateAssignNode(statement.value, statement.output.id);
    });

  var newInstance = {
    id: outputNamespace + instance.id,
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
        outputNamespace + instance.id,
        statement
      );

      // connect childInstance outputs to output instance gates
      // mapped output must exist as gate, at least as buffer
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
      port: p.id,
      mapped: { type: "variableInstance", id: "main." + p.id, index: 1 }
    })),
    id: "main",
    module: "main"
  };

  createInstance("", mainInstance);

  return { instances, gates };
};

export default walk;
