var modules, instances, gates;

const createInstance = (parentNamespace, instanceDeclaration) => {
  var namespace;
  if (parentNamespace == "") namespace = "main";
  else namespace = parentNamespace + "." + instanceDeclaration.id;
  const instanceModule = modules[instanceDeclaration.module];
  const varMap = {};

  var newInstance = {
    id: namespace,
    inputs: [], // input port gate ids
    outputs: [], // output port gate ids
    instances: [], // child instance ids
    gates: [] // non port gate ids
  };

  // if (instanceDeclaration.id == "dffe") debugger;

  // instanceDeclaration is generated from module statement Mymodule foo(.a(user1), .b(user2), .X(o1))
  // => { id: "foo", module: "Mymodule", parameters: [{port:"a", value: {id: "user1", index: 0}}, ...]}

  // Build varMap - do it now because gates may be referred to before declaration
  instanceModule.wires.forEach(wire => {
    varMap[wire] = `${namespace}.${wire}`;
  });
  instanceModule.ports.forEach(port => {
    varMap[port.id] =
      port.type == "output"
        ? `${namespace}.${port.id}!` // gates referring to an output port are mapped to port.id{!}
        : `${namespace}.${port.id}`;
  });

  // create all the gates defined in the instance's module statements
  // gate declaration has the form { id: "X", gate: "and", inputs: ["a", "b"], type: "gate"}
  // if the gate has the same id as an output port then map that id to id.gate and set the output ports input to id.gate
  instanceModule.statements
    .filter(statement => statement.type == "gate")
    .forEach(gateDeclaration => {
      // if this gate shares an output id, ie is connected to an output port then add ! to indicate last gate before output
      const newGate = {
        id: varMap[gateDeclaration.id],
        logic: gateDeclaration.gate,
        inputs: gateDeclaration.inputs.map(input => varMap[input]),
        instance: namespace,
        state: 0,
        type: "gate"
      };
      gates.push(newGate);
      newInstance.gates.push(newGate.id);
    });

  const evaluateAssignNode = (node, output) => {
    console.log(`output: ${output}, Type: ${node.type}`);
    let lastOutput;
    if (
      node.type == "BRACKETED_EXPRESSION" ||
      node.type == "ASSIGN_EXPRESSION"
    ) {
      let expr = node.value;
      console.log(
        " -- " +
          expr.map(x => x.type + ":" + JSON.stringify(x.value)).join(", ")
      );

      // for each operation triplet
      for (let i = 1; i < expr.length; i += 2) {
        let curOutput = i == expr.length - 2 ? output + "!" : output + "op" + i; // if final operation, connect to output{!}, else a intermediate variable output{op}{i}

        if (!varMap[curOutput]) varMap[curOutput] = `${namespace}.${curOutput}`;

        gates.push({
          id: varMap[curOutput],
          logic: expr[i].value,
          inputs: [
            i == 1
              ? evaluateAssignNode(expr[i - 1], output + "op" + (i - 1))
              : varMap[lastOutput],
            evaluateAssignNode(expr[i + 1], output + "op" + (i + 1))
          ],
          state: 0,
          type: "gate",
          instance: instanceDeclaration.id
        });
        newInstance.gates.push(varMap[curOutput]);
        lastOutput = curOutput;
      }
      return varMap[lastOutput];
    }

    if (node.type == "VARIABLE") {
      lastOutput = node.value;
      if (node.invert) {
        // prepare an inverter gate to pipe the node output
        if (!varMap["not" + lastOutput]) {
          // add a notA wire (if it doesn't already exist)
          // add a gate: not(notA, A)
          const newgateID = `${namespace}.not${lastOutput}`;
          varMap["not" + lastOutput] = newInstance.outputs.some(
            x => x == newgateID
          )
            ? newgateID + "!"
            : newgateID;
          gates.push({
            id: varMap["not" + lastOutput],
            logic: "not",
            inputs: [varMap[lastOutput]],
            state: 0,
            type: "gate",
            instance: instanceDeclaration.id
          });
          newInstance.gates.push(varMap["not" + lastOutput]);
        }
        return varMap["not" + lastOutput];
      } else {
        return varMap[lastOutput];
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

  // create a gate for each port
  // create a gate for each gate in statements
  // recursively call any child instances

  // create a buffer gate for each port in the instance's module definition
  instanceModule.ports.forEach(port => {
    const portGate = {
      id: `${namespace}.${port.id}`,
      logic: "buffer",
      instance: namespace,
      inputs: [],
      state: 0,
      type: "port"
    };

    // connect the input port buffer gate's input to the mapped parent value in the instanceDeclaration parameters
    /*
                           |           |
      param.value.id ----->| port      | 
                           |           | 
    */
    if (port.type == "input") {
      const param = instanceDeclaration.parameters.find(
        param => param.port == port.id
      );
      if (param) {
        // if the input port is connected
        portGate.inputs.push(`${parentNamespace}.${param.value.id}`);
        newInstance.inputs.push(varMap[port.id]);
      }
    }

    /*
        | input           | port ------> parentGate
        |           gate! | port ------> parentGate = param.value.id
        |             ^   | 
        |             |   |
        | varMap[port.id] |
    */
    if (port.type == "output") {
      const param = instanceDeclaration.parameters.find(
        param => param.port == port.id
      );
      if (param) {
        // if the output port is connected

        if (port.id == "F3") debugger;

        // connect the mapped parent gate's input back to the output port buffer gate
        const parentGate = gates.find(
          gate => gate.id == `${parentNamespace}.${param.value.id}`
        );
        if (!parentGate)
          throw new Error(
            `${param.value.id} is not a gate in ${parentNamespace}`
          );
        parentGate.inputs.push(portGate.id);

        // connect the output port buffer gate's input to a gate with the same name + "!" if such a gate exists
        const sameNameGate = gates.find(gate => gate.id == varMap[port.id]);
        if (sameNameGate) portGate.inputs.push(varMap[port.id]);

        newInstance.outputs.push(portGate.id);
      }
    }
    gates.push(portGate);
  });

  // instantiate a module
  instanceModule.statements
    .filter(x => x.type == "instance")
    .forEach(statement => {
      var childInstance = createInstance(namespace, statement);
      newInstance.instances.push(childInstance.id);
    });

  newInstance.varMap = varMap;
  instances.push(newInstance);
  return newInstance;
};

const compiler = parseTree => {
  modules = parseTree.reduce((modules, module) => {
    modules[module.id] = module;
    return modules;
  }, {});

  gates = [];
  instances = [];

  // create an instance of main module
  const mainInstance = {
    id: "main",
    module: "main",
    parameters: []
  };

  createInstance("", mainInstance);

  return { instances, gates };
};

export default compiler;
