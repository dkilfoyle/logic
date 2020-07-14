var modules, instances, gates;

const createInstance = (parentNamespace, instance) => {
  // instance of main will have empty parentNamespace
  if (parentNamespace !== "") parentNamespace = parentNamespace + ".";

  const varMap = instance.params.reduce((acc, param) => {
    acc[param.param] = parentNamespace + param.mapped.id;
    return acc;
  }, {});

  instances.push({
    id: parentNamespace + instance.id,
    inputs: instance.params.filter(i => i.type == "input"),
    output: instance.params.filter(i => i.type == "output")
  });

  modules[instance.module].wires.forEach(wire => {
    varMap[wire] = parentNamespace + instance.id + "." + wire;
  });

  modules[instance.module].statements.forEach(statement => {
    if (statement.type == "gate") {
      gates.push({
        id: parentNamespace + instance.id + "." + statement.id,
        logic: statement.gate,
        inputs: statement.params.map(param => varMap[param]),
        instance: parentNamespace + instance.id,
        state: "x"
      });
    }
    if (statement.type == "instance") {
      createInstance(parentNamespace + instance.id, statement);
    }
  });
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
    params: [],
    id: "main",
    module: "main"
  };

  createInstance("", mainInstance);

  return { instances, gates };
};

export default walk;
