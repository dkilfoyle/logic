var modules, instances, gates;

const createInstance = (outputNamespace, instance) => {
  // instance of main will have empty outputNamespace
  if (outputNamespace !== "") outputNamespace = outputNamespace + ".";

  const instanceModule = modules[instance.module];

  // Mymodule foo(.a(user1), .b(user2), .X(o1))
  // foo.parameters = [{port:a, value:]

  // const varMap = instance.parameters.reduce((acc, parameter) => {
  //   acc[parameter.port] = {
  //     globalid: outputNamespace + parameter.value.id,
  //     type: "port",
  //     moduleid: parameter.port,
  //     instanceid: outputNamespace + instance.id + "." + parameter.port,
  //     porttype: instanceModule.ports.find(x => x.id == parameter.port).type
  //   };
  //   return acc;
  // }, {});

  // const addWire = wireLocalID => {
  //   varMap[wireLocalID] = {
  //     globalid: outputNamespace + instance.id + "." + wireLocalID,
  //     instanceid: outputNamespace + instance.id + "." + wireLocalID,
  //     moduleid: wireLocalID,
  //     type: "wire"
  //   };
  //   return varMap[wireLocalID].globalid;
  // };

  // instanceModule.wires.forEach(addWire);

  // create a gate for each port
  // create a gate for each gate in statements
  // recursively call any child instances

  // create all the gates first because instance processes needs to refer back to gates
  const addGate = gate => {
    // console.log(gate);
    gates.push({
      id: varMap[gate.id].instanceid,
      logic: gate.gate,
      inputs: gate.inputs.map(param => varMap[param].globalid),
      inputsLocal: gate.inputs.map(param => varMap[param].instanceid),
      instance: outputNamespace + instance.id,
      state: 0
    });
    return varMap[gate.id].moduleid;
  };

  instanceModule.statements.filter(x => x.type == "gate").forEach(addGate);

  const evaluateAssignNode = (node, output) => {
    // console.log(`output: ${output}, Type: ${node.type}`);
    let lastOutput;
    if (
      node.type == "BRACKETED_EXPRESSION" ||
      node.type == "ASSIGN_EXPRESSION"
    ) {
      let expr = node.value;
      // console.log(" -- " + expr.map(x => x.type + ":" + x.value).join(", "));

      // for each operation triplet
      for (let i = 1; i < expr.length; i += 2) {
        let curOutput = i == expr.length - 2 ? output : output + "op" + i; // final operation, connect to final output
        if (!varMap[curOutput]) addWire(curOutput);
        lastOutput = addGate({
          id: curOutput,
          gate: expr[i].value,
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
      lastOutput = node.value;
      if (node.invert) {
        // prepare an inverter gate to pipe the node output
        if (!varMap["not" + lastOutput]) {
          // add a notA wire (if it doesn't already exist)
          // add a gate: not(notA, A)
          const notA = addWire("not" + lastOutput);
          addGate({
            id: "not" + lastOutput,
            gate: "not",
            inputs: [lastOutput]
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
      return evaluateAssignNode(statement.value, statement.id);
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

const compile = parseTree => {
  modules = parseTree.reduce((modules, module) => {
    if (!module.type == "module") {
      console.log("top level of ast should be modules only");
      return modules;
    }
    modules[module.id] = module;
    return modules;
  }, {});

  gates = [];
  instances = [];

  // create an instance of main module
  const mainInstance = {
    parameters: [],
    id: "main",
    module: "main"
  };

  createInstance("", mainInstance);

  return { instances, gates };
};

export default compile;
