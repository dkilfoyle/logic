var modules, instances, gates;

const createInstance = (outputNamespace, instance) => {
  // instance of main will have empty outputNamespace
  if (outputNamespace !== "") outputNamespace = outputNamespace + ".";

  const instanceModule = modules[instance.module];

  const varMap = instance.params.reduce((acc, param) => {
    acc[param.param] = {
      globalid: outputNamespace + param.mapped.id,
      type: "port",
      moduleid: param.param,
      instanceid: outputNamespace + instance.id + "." + param.param,
      porttype: instanceModule.ports.find(x => x.id == param.param).type
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

  instanceModule.wires.forEach(addWire);

  // create all the gates first because instance processes needs to refer back to gates
  const addGate = gate => {
    console.log(gate);
    gates.push({
      id: varMap[gate.id].instanceid,
      logic: gate.gate,
      inputs: gate.params.map(param => varMap[param].globalid),
      instance: outputNamespace + instance.id,
      state: 0
    });
    return varMap[gate.id].moduleid;
  };

  instanceModule.statements.filter(x => x.type == "gate").forEach(addGate);

  const evaluateAssignNode = (node, output) => {
    console.log(
      `output: ${output}, Type: ${node.type}, Invert: ${node.invert}`
    );

    let lastOutput;

    if (node.type == "expression") {
      let expr = node.value;
      if (expr.length < 3)
        throw new Error("Invalid expression length: must be at least 3");
      if (
        !(
          expr[0].type == "variable" &&
          expr[1].type == "binaryop" &&
          expr[2].type == "variable"
        )
      )
        throw new Error("Invalid sequence of expression values");

      console.log(" -- " + expr.map(x => x.type + ":" + x.value).join(", "));

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
    } else if (node.type == "variable") {
      lastOutput = node.value;
    }

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

// const evaluateAssign = (node, output) => {
//   // if (node.type == "variable") {
//   //   console.log("evaluateAssign: ", node.type, node.id, node.inverse, output);
//   // } else
//   //   console.log(
//   //     "evaluateAssign: ",
//   //     node.type,
//   //     node.inverse,
//   //     node.operator,
//   //     node.operand1,
//   //     node.operand2,
//   //     output
//   //   );
//   if (node.inverse) {
//     // prepare an inverter gate to pipe the node output
//     if (!varMap["not" + node.id]) {
//       // add a notA wire (if it doesn't already exist)
//       // add a gate: not(notA, A)
//       const notA = addWire("not" + node.id);
//       addGate({
//         id: "not" + node.id,
//         gate: "not",
//         params: [node.id],
//         instance: outputNamespace + instance.id,
//         state: 0
//       });
//     }
//     // return "not" + node.id;
//   }

//   if (node.type === "variable") {
//     return node.inverse ? "not" + node.id : node.id;
//   }

//   if (node.type === "binaryExpression") {
//     // add an intermediary wire if necessary
//     if (!varMap[output]) addWire(output);
//     var newgate = {
//       id: output,
//       gate: node.operator,
//       params: [
//         evaluateAssign(node.operand1, output + "op1"),
//         evaluateAssign(node.operand2, output + "op2")
//       ],
//       instance: outputNamespace + instance.id,
//       state: 0
//     };
//     // console.log("Adding gate: ", newgate);
//     addGate(newgate);
//     return output;
//   }
// };
