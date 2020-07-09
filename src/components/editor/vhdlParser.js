import A from "./parserLib.js";

// Utility parsers
// const peek = A.lookAhead(A.regex(/^./));
const upperOrLowerStr = s =>
  A.choice([A.str(s.toUpperCase()), A.str(s.toLowerCase())]).errorMap(
    (error, index) => "choice 000"
  );
const ws = parser =>
  A.between(A.optionalWhitespace, A.optionalWhitespace)(parser);
const wsBounded = parser => A.between(A.whitespace, A.whitespace)(parser);
const commaSeparated = A.sepBy(ws(A.char(",")));
const semicolonSeparated = A.sepBy(ws(A.char(";")));
const betweenRoundBrackets = A.between(ws(A.char("(")), ws(A.char(")")));
const betweenCurlyBrackets = A.between(ws(A.char("{")), ws(A.char("}")));

const tag = type => value => ({ type, value });
const mapJoin = parser => parser.map(items => items.join(""));

// Token parsers
const identifier = ws(
  A.sequenceOf([
    A.regex(/^[a-zA-Z_]/),
    A.possibly(A.regex(/^[a-zA-Z0-9_]+/)).map(x => (x === null ? "" : x))
  ])
).map(x => x.join(""));

const portType = A.choice([A.str("bit")]);

const portDefinition = A.contextual(function*() {
  const names = yield A.sequenceOf([commaSeparated(identifier), ws(A.str(":"))])
    .map(x => x[0])
    .errorMap((e, i) => throwLintError("Invalid or missing port name(s)", i));
  const dir = yield A.choice([
    ws(A.str("in")),
    ws(A.str("out"))
  ]).errorMap((e, i) => throwLintError(`Invalid or missing port direction`, i));
  const type = yield portType.errorMap((e, i) =>
    throwLintError("Invalid or missing port type", i)
  );

  return { names, dir, type };
});

const portParser = A.contextual(function*() {
  yield ws(A.str("port"));
  const definitions = yield betweenRoundBrackets(
    A.sepBy(ws(A.str(";")))(portDefinition)
  ).errorMap(x => "Invalid port definition");

  yield ws(A.str(";"));

  return tag("portDeclaration")({ definitions });
});

const entityParser = A.contextual(function*() {
  yield A.str("entity ");
  const id = yield ws(identifier).errorMap(
    (error, index) => `Invalid entity identifier`
  );
  yield A.str("is").errorMap(error => "Expected 'is'");

  const portDeclaration = yield A.possibly(
    portParser.errorMap((error, index) =>
      throwLintError(`Invalid port declaration: ${error}`, index)
    )
  );

  yield ws(A.str("end entity;"));

  return tag("entity")({
    id,
    ports: portDeclaration ? portDeclaration.value.definitions : null
  });
});

const signalDefParser = A.contextual(function*() {
  yield ws(A.str("signal"));
  const names = yield commaSeparated(identifier).errorMap((e, i) =>
    throwLintError("Invalid or missing signal name(s)", i)
  );
  yield ws(A.str(":"));
  const type = yield portType.errorMap((e, i) =>
    throwLintError("Invalid or missing signal type", i)
  );

  yield ws(A.str(";"));

  return { names, type };
});

const logicOperator = ws(
  A.choice([A.str("and"), A.str("nand"), A.str("or"), A.str("nor")])
);

const primary = A.choice([identifier, betweenRoundBrackets(expression)]);

// const factor = A.choice([primary, A.sequenceOf([A.str("not"), ws(primary)])]);

const factor = A.contextual(function*() {
  const mynot = yield A.possibly(A.str("not"));
  console.log(mynot);
  const id = yield ws(primary);
  console.log(id);
  return ["not", id];
});

const expression = A.sequenceOf([
  factor,
  A.many(A.sequenceOf([logicOperator, factor]))
]);

// const processStatementParser = A.contextual(function*() {

// })

// const signalAssignmentStatementParser = A.contextual(function*() {

// })

const expressionParser = A.contextual(function*() {});

const statementParser = A.contextual(function*() {
  const id = yield ws(identifier);
  yield ws(A.str("<="));

  const exp = yield expression;

  yield ws(A.str(";"));
  return { id, exp };
});

const archParser = A.contextual(function*() {
  yield A.str("architecture ");

  const archid = yield ws(identifier).errorMap(
    (error, index) => `Invalid architecture identifier`
  );

  yield A.str("of").errorMap(error => "Expected 'of'");
  const entityid = yield ws(identifier).errorMap(
    (error, index) => `Invalid entity identifier at ${index}`
  );
  yield ws(A.str("is")).errorMap(error => "Expected 'is'");

  const signals = yield A.many(ws(signalDefParser));

  yield A.str("begin");
  const statements = yield A.many(ws(statementParser));
  yield A.str("end architecture");

  return tag("architecture")({ id: archid, of: entityid, signals, statements });
});

const throwLintError = (newerror, newindex) => {
  if (newindex > globalLintObject.index) {
    globalLintObject.index = newindex;
    globalLintObject.error = newerror;
  }
  // console.log(newerror);
  return newerror;
};

const endOfCodeParser = A.endOfInput.map(tag("end"));

const globalLintObject = {};

const vhdlParser = code => {
  console.log("vhdlParser");
  globalLintObject.index = -1;
  globalLintObject.error = null;
  return {
    parseState: A.sequenceOf([ws(entityParser), ws(archParser)])
      .errorMap((error, index) =>
        throwLintError(`Invalid entity definition at ${index}: ${error}`, index)
      )
      .run(code),
    lint: globalLintObject
  };
};

export default vhdlParser;
