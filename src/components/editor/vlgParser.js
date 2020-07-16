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
const betweenSquareBrackets = A.between(ws(A.char("[")), ws(A.char("]")));

const tag = type => value => ({ type, value });
const mapJoin = parser => parser.map(items => items.join(""));

// Token parsers
const identifier = ws(
  A.sequenceOf([
    A.regex(/^[a-zA-Z_]/),
    A.possibly(A.regex(/^[a-zA-Z0-9_]+/)).map(x => (x === null ? "" : x))
  ])
).map(x => x.join(""));

const lazy = parserThunk =>
  new A.Parser(parserState => {
    const parser = parserThunk();
    return parser.parserStateTransformerFn(parserState);
  });

const logicOperator = ws(
  A.choice([A.str("and"), A.str("nand"), A.str("or"), A.str("nor")])
);

const primary = lazy(() =>
  A.choice([identifier, betweenRoundBrackets(expression)])
);

const factor = lazy(() =>
  A.choice([A.sequenceOf([A.str("not"), ws(primary)]), primary])
);

const expression = A.sequenceOf([
  factor,
  A.many(A.sequenceOf([logicOperator, factor]))
]);

const gateParser = A.contextual(function*() {
  const gate = yield A.choice([
    A.str("and"),
    A.str("nand"),
    A.str("or"),
    A.str("xor"),
    A.str("nor"),
    A.str("not"),
    A.str("control"),
    A.str("buffer")
  ]);

  const params = yield betweenRoundBrackets(commaSeparated(identifier));
  yield ws(A.str(";"));

  return { type: "gate", id: params[0], gate, params: params.slice(1) };
});

const assignParser = A.contextual(function*() {
  yield A.str("assign ");
  const id = yield ws(identifier);
  yield A.str("=");
  const value = yield ws(numberParser);
  yield A.str(";");
  return { type: "assign", id, value };
});

const instanceParser = A.contextual(function*() {
  const module = yield ws(identifier).errorMap(x => "no module");
  const id = yield ws(identifier).errorMap(x => "no id");
  const params = yield betweenRoundBrackets(
    commaSeparated(ws(instanceParamsParser))
  ).errorMap(x => {
    console.log(x);
    return x;
  });
  yield A.str(";");
  return { type: "instance", module, id, params };
});

const variableParser = A.contextual(function*() {
  const id = yield identifier;
  const index = yield A.possibly(betweenSquareBrackets(A.digits));
  return { id, index };
});

const instanceParamsParser = A.contextual(function*() {
  const instanceVar = yield A.sequenceOf([A.str("."), identifier]).map(
    x => x[1]
  );
  const moduleVar = yield betweenRoundBrackets(variableParser);
  return { param: instanceVar, mapped: moduleVar };
});

const numberParser = A.contextual(function*() {
  const bits = yield A.digits;
  yield A.str("'");
  const base = yield A.str("b"); //A.choice([A.str("b"), A.str("h", A.str("d"))]);
  const value = yield A.digits;
  return { type: "number", bits, base, value };
});

const arrayDimParser = A.contextual(function*() {
  const dim = yield betweenSquareBrackets(
    A.sequenceOf([A.digits, A.str(":"), A.digits])
  ).map(x => [x[0], x[2]]);
  return dim;
});

const portParser = A.contextual(function*() {
  const type = yield A.choice([ws(A.str("input")), ws(A.str("output"))]);
  const arrayDim = yield A.possibly(arrayDimParser);
  const id = yield ws(identifier);
  return { type, dim: arrayDim, id };
});

const testAssignmentParser = A.contextual(function*() {
  const id = yield ws(identifier);
  yield A.str("=");
  const value = yield ws(A.digits);
  return { type: "assignment", id, value };
});

const testClockParser = A.contextual(function*() {
  yield A.str("#");
  const time = yield A.digits;
  yield A.whitespace;
  const assignments = yield betweenCurlyBrackets(
    commaSeparated(ws(testAssignmentParser))
  );
  yield A.str(";");
  return { time, assignments };
});

const moduleParser = A.contextual(function*() {
  yield A.str("module ");

  const id = yield ws(identifier).errorMap(
    (error, index) => `Invalid module identifier`
  );

  const ports = yield A.possibly(
    betweenRoundBrackets(
      commaSeparated(
        portParser.errorMap(
          (error, index) => `Invalid ports section : ${error}`
        )
      )
    )
  );

  yield ws(A.str(";"));

  const wires = yield A.possibly(
    A.sequenceOf([
      A.str("wire "),
      commaSeparated(ws(identifier)),
      ws(A.str(";"))
    ]).map(x => x[1])
  );

  const statements = yield A.many(
    A.choice([ws(gateParser), ws(instanceParser), ws(assignParser)])
  );

  var clock;
  if (id == "main") {
    yield ws(A.str("test begin"));
    clock = yield A.many(ws(testClockParser));
    yield ws(A.str("end"));
  }

  yield ws(A.str("endmodule"));

  return { type: "module", id, ports, wires, statements, clock };
});

const throwLintError = (newerror, newindex) => {
  if (newindex > globalLintObject.index) {
    globalLintObject.index = newindex;
    globalLintObject.error = newerror;
  }
  // console.log(newerror);
  return newerror;
};

const globalLintObject = {};

const vlgParser = code => {
  globalLintObject.index = -1;
  globalLintObject.error = null;
  return {
    parseState: A.many(
      ws(moduleParser).errorMap((error, index) =>
        throwLintError(`Invalid module definition: ${error}`, index)
      )
    ).run(code),
    lint: globalLintObject
  };
};

export default vlgParser;
