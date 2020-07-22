import {
  str,
  between,
  optionalWhitespace,
  whitespace,
  sepBy,
  sequenceOf,
  regex,
  possibly,
  choice,
  coroutine,
  many,
  many1,
  everythingUntil,
  char,
  digit,
  digits,
  endOfInput,
  recursiveParser,
  skip,
  lookAhead,
  anythingExcept,
  either,
  succeedWith,
  fail,
  tapParser
} from "arcsecond";

// Global ======================================================================

var definedVariables = []; // global variable but for current module only
var definedControls = [];

var lint = [];
const lintError = (lintError, severity) => (error, index) => {
  lint.push({
    index,
    error: lintError,
    severity: severity ? severity : "error"
  });
  return lintError;
};

// Utility parsers ===================================================================

const comment = sequenceOf([
  str("//"),
  everythingUntil(char("\n")),
  optionalWhitespace
]);
const optionalWhitespaceOrComment = possibly(choice([whitespace, comment])).map(
  x => x || ""
);
const ws = myparser =>
  between(optionalWhitespaceOrComment)(optionalWhitespaceOrComment)(myparser);
const commaSeparated = sepBy(ws(char(",")));
const semicolonSeparated = sepBy(ws(char(";")));
const betweenRoundBrackets = between(ws(char("(")))(ws(char(")")));
const betweenCurlyBrackets = between(ws(char("{")))(ws(char("}")));
const betweenSquareBrackets = between(ws(char("[")))(ws(char("]")));
const binaryDigit = regex(/^[0-1]/).map(x => parseInt(x));
const anyOfArray = strs => choice(strs.map(x => str(x)));

// Token parsers ===============================================================

const identifier = ws(
  sequenceOf([
    regex(/^[a-zA-Z_]/),
    possibly(regex(/^[a-zA-Z0-9_]+/)).map(x => (x === null ? "" : x))
  ])
).map(x => x.join(""));

const logicOperator = ws(
  choice([str("and"), str("nand"), str("or"), str("nor")])
);

const primary = recursiveParser(() =>
  choice([identifier, betweenRoundBrackets(expression)])
);

const factor = recursiveParser(() =>
  choice([sequenceOf([str("not"), ws(primary)]), primary])
);

const expression = sequenceOf([
  factor,
  many(sequenceOf([logicOperator, factor]))
]);

const numberParser = coroutine(function*() {
  const bits = yield digits;
  yield str("'");
  const base = yield str("b"); //choice([str("b"), str("h", str("d"))]);
  const value = yield digits;
  return { type: "number", bits, base, value };
});

const definedVariableParser = coroutine(function*() {
  const variable = yield identifier.errorMap(lintError("Invalid identifier"));

  if (!definedVariables.some(x => x == variable)) {
    yield tapParser(state =>
      lintError("Undefined variable", "warning")(
        "",
        state.index - variable.length
      )
    );
  }
  return variable;
});

const definedControlParser = coroutine(function*() {
  const variable = yield identifier.errorMap(lintError("Invalid identifier"));

  if (!definedControls.some(x => x == variable)) {
    yield tapParser(state =>
      lintError("Must be control variable", "warning")(
        "",
        state.index - variable.length
      )
    );
  }
  return variable;
});

// Instance parsers =====================================================

const variableParser = coroutine(function*() {
  const id = yield definedVariableParser;
  const index = yield possibly(betweenSquareBrackets(digits));
  return { id, index };
});

const instanceParamsParser = coroutine(function*() {
  const instanceVar = yield sequenceOf([str("."), identifier]).map(x => x[1]);
  const moduleVar = yield betweenRoundBrackets(variableParser);
  return { param: instanceVar, mapped: moduleVar };
});

const instanceParser = coroutine(function*() {
  const module = yield ws(identifier).errorMap(x => "no module");
  const id = yield ws(identifier).errorMap(x => "no id");
  const params = yield betweenRoundBrackets(
    commaSeparated(ws(instanceParamsParser))
  );
  yield str(";");
  return { type: "instance", module, id, params };
});

// Gate parser ===========================================================

const gateParser = coroutine(function*() {
  const gate = yield choice([
    str("and"),
    str("nand"),
    str("or"),
    str("xor"),
    str("nor"),
    str("not"),
    str("control"),
    str("buffer")
  ]);

  const params = yield betweenRoundBrackets(
    commaSeparated(
      definedVariableParser.errorMap(lintError("Undefined variable"))
    )
  );

  yield ws(str(";"));

  return { type: "gate", id: params[0], gate, params: params.slice(1) };
});

const assignParser = coroutine(function*() {
  yield str("assign ");
  const id = yield ws(identifier);
  yield str("=");
  const value = yield ws(numberParser);
  yield str(";");
  return { type: "assign", id, value };
});

// MODULE =============================================================

const arrayDimParser = coroutine(function*() {
  const dim = yield betweenSquareBrackets(
    sequenceOf([digits, str(":"), digits])
  ).map(x => [x[0], x[2]]);
  return dim;
});

const portParser = coroutine(function*() {
  const type = yield choice([ws(str("input")), ws(str("output"))]).errorMap(
    lintError("Invalid port type: must be 'input' or 'output'")
  );
  const arrayDim = yield possibly(arrayDimParser);
  const id = yield ws(identifier).errorMap(
    lintError("Invalid port identifier")
  );
  return { type, dim: arrayDim, id };
});

const wireParser = coroutine(function*() {
  yield str("wire ");
  const vars = yield commaSeparated(
    ws(identifier).errorMap(lintError("Invalid wire identifier"))
  );
  yield ws(str(";"));
  return vars;
});

const moduleParser = coroutine(function*() {
  // TODO: Wrap each of these in an either. If error yield a everythingUntil("endmodule").map(x=>{}) so that parsing can continue to next module

  yield str("module ").errorMap(lintError("Expecting 'module'"));

  const id = yield ws(identifier).errorMap(
    lintError("Invalid module identifier")
  );

  const ports = yield possibly(
    betweenRoundBrackets(
      commaSeparated(
        portParser.errorMap(
          (error, index) => `Invalid ports section : ${error}`
        )
      )
    )
  );

  yield ws(str(";"));

  var wires = yield possibly(ws(wireParser));
  wires = wires ? wires : [];

  // global
  definedVariables = [...ports.map(x => x.id), ...wires];
  definedControls = [];

  // TODO: check for undefined variables modules and add these to lint
  const statements = yield many(
    choice([
      ws(gateParser),
      ws(instanceParser)
      //ws(assignParser)
    ])
  );

  statements.forEach(x => {
    if (x.gate == "control") definedControls.push(x.id);
  });

  var clock;
  if (id == "main")
    clock = yield testParser.errorMap(lintError("Invalid test block"));

  yield ws(str("endmodule"));

  return { type: "module", id, ports, wires, statements, clock };
});

// Test sections parsers ================================================

const testAssignmentParser = coroutine(function*() {
  const id = yield ws(definedControlParser);
  yield str("=");
  const value = yield sequenceOf([
    ws(binaryDigit),
    lookAhead(anythingExcept(binaryDigit))
  ])
    .map(x => x[0])
    .errorMap(lintError("Expected 0 or 1"));
  return { id, value: parseInt(value, 10) };
});

const testTimeParser = coroutine(function*() {
  yield str("#");
  const time = yield digits.errorMap(lintError("Invalid time"));
  yield optionalWhitespace;
  var assignments = yield possibly(
    betweenCurlyBrackets(commaSeparated(ws(testAssignmentParser)))
  );
  assignments = assignments || [];
  yield str(";");
  return { time: parseInt(time, 10), assignments };
});

const testParser = coroutine(function*() {
  yield ws(str("test begin"));
  const times = yield many(ws(testTimeParser));
  yield ws(str("end"));
  return times;
});

// top level parser ======================================================

const vlgParser = code => {
  lint = [];
  const parseState = sequenceOf([many1(ws(moduleParser)), endOfInput])
    .map(x => x[0]) // don't include the endofinput in result
    .run(code);
  return {
    parseState,
    lint
  };
};

export default vlgParser;
