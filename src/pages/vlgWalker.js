var modules, instances, gates;

const createInstance = (parentNamespace, instance) => {
  // instance of main will have empty parentNamespace
  if (parentNamespace !== "") parentNamespace = parentNamespace + ".";

  const instanceModule = modules[instance.module];

  const varMap = instance.params.reduce((acc, param) => {
    acc[param.param] = {
      globalid: parentNamespace + param.mapped.id,
      type: "port",
      moduleportid: param.param,
      instanceportid: parentNamespace + instance.id + "." + param.param,
      porttype: instanceModule.ports.find(x => x.id == param.param).type
    };
    return acc;
  }, {});

  instanceModule.wires.forEach(wire => {
    varMap[wire] = {
      globalid: parentNamespace + instance.id + "." + wire,
      type: "wire"
    };
  });

  // create all the gates first because instance processes needs to refer back to gates
  instanceModule.statements
    .filter(x => x.type == "gate")
    .forEach(statement => {
      gates.push({
        id: parentNamespace + instance.id + "." + statement.id,
        logic: statement.gate,
        inputs: statement.params.map(param => varMap[param].globalid),
        instance: parentNamespace + instance.id,
        state: "x"
      });
    });

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
        gates.find(g => g.id == o.globalid).inputs.push(o.instanceportid);
      });

      // childInstance.outputs.forEach(output => {
      //   // patch output.portid to params mapped
      //   var childInstanceParam = childInstance.params.find(
      //     x => x.param == output.portid
      //   );
      //   outputMappings.push({
      //     portid: childInstanceParam.mapped.id,
      //     gate: output.gate
      //   });
      // });
    });

  var newInstance = {
    id: parentNamespace + instance.id,
    inputs: Object.values(varMap).filter(
      x => x.type == "port" && x.porttype == "input"
    ),
    outputs: Object.values(varMap).filter(
      x => x.type == "port" && x.porttype == "output"
    )
  };
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
