var modules, mygates;

const createInstance = (parentNamespace, instance) => {
  const varMap = instance.params.reduce((acc, param) => {
    acc[param.param] = parentNamespace + "." + param.mapped.id;
    return acc;
  }, {});

  modules[instance.module].wires.forEach(wire => {
    varMap[wire] = parentNamespace + "." + instance.id + "." + wire;
  });

  modules[instance.module].statements.forEach(statement => {
    if (statement.type == "gate") {
      mygates.push({
        id: parentNamespace + "." + instance.id + "." + statement.id,
        logic: statement.gate,
        inputs: statement.params.map(param => varMap[param])
      });
    }
    if (statement.type == "instance") {
      createInstance(parentNamespace + "." + instance.id, statement);
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

  mygates = [];
  modules.main.wires.forEach(wire =>
    mygates.push({
      logic: "controlled",
      id: "main." + wire,
      output: undefined
    })
  );

  modules.main.statements.forEach(statement => {
    if (statement.type == "instance") createInstance("main", statement);
  });

  return mygates;
};

export default walk;
