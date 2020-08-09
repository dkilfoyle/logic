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
  takeLeft,
  takeRight,
  succeedWith,
  fail,
  tapParser
} from "arcsecond";

// Global ======================================================================

var definedVariables = []; // global variable but for current module only
var definedControls = [];
var definedModules = [];
var savePosition = 0;
var lint = [];

const lintError = (lintError, severity) => (error, index) => {
  lint.push({
    index,
    error: lintError,
    severity: severity ? severity : "error"
  });
  return lintError;
};

const lintWhere = (state, where) => {
  if (where.from) return where.from;
  if (where.back) return state.index - where.back;
  return state.index - where;
};

const lintWarningParser = (error, level, where) =>
  tapParser(state => lintError(error, level)("", lintWhere(state, where)));

const tapPosition = tapParser(state => (savePosition = state.index)).map(
  x => savePosition
);

const asType = type => x => ({ type, value: x });
const last = a => a[a.length - 1];

// Utility parsers ===================================================================

const peek = lookAhead(regex(/^./));

const singleLineComment = sequenceOf([
  str("//"),
  everythingUntil(char("\n")),
  optionalWhitespace
]);

const multipleLineComment = sequenceOf([
  str("/*"),
  everythingUntil(str("*/")),
  str("*/")
]);

const optionalWhitespaceOrComment = many(
  choice([whitespace, singleLineComment, multipleLineComment])
).map(x => x || "");

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

// const UNARY_OPERATOR = choice([str("~")]);

// const BINARY_OPERATOR = choice([
//   str("&").map(x => "and"),
//   str("|").map(x => "or"),
//   str("^").map(x => "xor"),
//   str("~&").map(x => "nand"),
//   str("~|").map(x => "nor")
// ]);

const keywords = [
  "module",
  "begin",
  "input",
  "output",
  "wire",
  "assign",
  "endmodule",
  "buffer",
  "and",
  "not",
  "or",
  "xor",
  "nor",
  "nand"
];

const identifier = coroutine(function*() {
  const id = yield either(
    ws(
      sequenceOf([
        regex(/^[a-zA-Z_]/),
        possibly(regex(/^[a-zA-Z0-9_]+/)).map(x => (x === null ? "" : x))
      ])
    ).map(x => x.join(""))
  );
  if (id.isError) {
    yield fail("Invalid ID");
  }
  if (keywords.some(x => x == id.value))
    yield fail("Identifier cannot be keyword");
  return id.value;
});

const number = coroutine(function*() {
  const bits = yield digits;
  yield str("'");
  const base = yield str("b"); //choice([str("b"), str("h", str("d"))]);
  const value = yield digits;
  return { type: "number", bits, base, value };
});

const definedVariableParser = coroutine(function*() {
  const variable = yield identifier; //.errorMap(lintError("Invalid identifier"));

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

const debug = msg => x => {
  console.log(msg + ":", x);
  return x;
};

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
  return { port: instanceVar, value: moduleVar };
});

const instanceParser = coroutine(function*() {
  yield optionalWhitespace;
  const start = yield tapPosition;
  const module = yield ws(identifier).errorMap(x => "no module");
  const id = yield ws(identifier).errorMap(x => "no id");
  const parameters = yield betweenRoundBrackets(
    commaSeparated(ws(instanceParamsParser))
  );
  yield str(";");
  const found = definedModules.find(x => x == module);
  if (!found)
    yield lintWarningParser("Module " + module + " not defined", "warning", {
      from: start
    });
  return { type: "instance", module, id, parameters };
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
    str("buffer"),
    str("response")
  ]);

  const start = yield tapPosition;

  const params = yield betweenRoundBrackets(
    commaSeparated(definedVariableParser)
  );

  if (["control", "buffer", "response"].includes(gate) && params.length != 1) {
    yield lintWarningParser(
      `'${gate}' expects exactly 1 parameter`,
      "warning",
      {
        from: start
      }
    );
  }

  if (["and", "nand", "or", "xor", "nor"].includes(gate) && params.length < 3) {
    yield lintWarningParser(
      `'${gate}' expects at least 3 parameters`,
      "warning",
      {
        from: start
      }
    );
  }

  yield ws(str(";"));

  return { type: "gate", id: params[0], gate, params: params.slice(1) };
});

// Assign parser ======================================================

const operator = choice([
  char("&").map(x => ({ type: "OP_AND", value: "and" })),
  char("|").map(x => ({ type: "OP_OR", value: "or" })),
  char("^").map(x => ({ type: "OP_XOR", value: "xor" })),
  str("~&").map(x => ({ type: "OP_NAND", value: "nand" })),
  str("~|").map(x => ({ type: "OP_NOR", value: "nor" }))
]);
const variable = sequenceOf([
  possibly(char("~")),
  definedVariableParser
]).map(([n, v]) => ({ type: "VARIABLE", value: v, invert: n != null }));

const typifyBracketedExpression = expr => {
  const asBracketed = asType("BRACKETED_EXPRESSION");
  return asBracketed(
    expr.map(element => {
      if (Array.isArray(element)) {
        return typifyBracketedExpression(element);
      }
      return element;
    })
  );
};

const bracketedExpr = coroutine(function*() {
  const states = {
    OPEN_BRACKET: 0,
    OPERATOR_OR_CLOSING_BRACKET: 1,
    ELEMENT_OR_OPENING_BRACKET: 2,
    CLOSE_BRACKET: 3
  };

  let state = states.ELEMENT_OR_OPENING_BRACKET;

  const expr = [];
  const stack = [expr];
  yield char("(");

  while (true) {
    const nextChar = yield peek;

    if (state === states.OPEN_BRACKET) {
      yield char("(");
      expr.push([]);
      stack.push(last(expr));
      yield optionalWhitespace;
      state = states.ELEMENT_OR_OPENING_BRACKET;
    } else if (state === states.CLOSE_BRACKET) {
      yield char(")");
      stack.pop();
      if (stack.length === 0) {
        // We've reached the end of the bracket expression
        break;
      }

      yield optionalWhitespace;
      state = states.OPERATOR_OR_CLOSING_BRACKET;
    } else if (state === states.ELEMENT_OR_OPENING_BRACKET) {
      if (nextChar === ")") {
        yield fail("Unexpected end of expression");
      }

      if (nextChar === "(") {
        state = states.OPEN_BRACKET;
      } else {
        last(stack).push(yield variable);
        yield optionalWhitespace;
        state = states.OPERATOR_OR_CLOSING_BRACKET;
      }
    } else if (state === states.OPERATOR_OR_CLOSING_BRACKET) {
      if (nextChar === ")") {
        state = states.CLOSE_BRACKET;
        continue;
      }

      last(stack).push(yield operator);
      yield optionalWhitespace;
      state = states.ELEMENT_OR_OPENING_BRACKET;
    } else {
      // This shouldn't happen!
      throw new Error("Unknown state");
    }
  }
  return typifyBracketedExpression(expr);
});

const squareBracketExpr = coroutine(function*() {
  yield optionalWhitespace;

  const states = {
    EXPECT_ELEMENT: 0,
    EXPECT_OPERATOR: 1
  };

  const expr = [];
  let state = states.EXPECT_ELEMENT;

  while (true) {
    if (state === states.EXPECT_ELEMENT) {
      const result = yield choice([bracketedExpr, variable]);
      expr.push(result);
      state = states.EXPECT_OPERATOR;
      yield optionalWhitespace;
    } else if (state === states.EXPECT_OPERATOR) {
      const nextChar = yield peek;
      if (nextChar === ";") {
        yield char(";");
        yield optionalWhitespace;
        break;
      }

      const result = yield operator;
      expr.push(result);
      state = states.EXPECT_ELEMENT;
      yield optionalWhitespace;
    }
  }

  return asType("ASSIGN_EXPRESSION")(expr);
});

const assignParser = coroutine(function*() {
  yield str("assign ");
  const id = yield ws(identifier).errorMap(
    lintError("Invalid assign identifier")
  );
  yield ws(str("="));
  const value = yield squareBracketExpr.errorMap(
    lintError("Invalid expression")
  );
  // console.log("assignParser: ", id, value);
  return { type: "assign", id, value };
});

// MODULE =============================================================

const arrayDimParser = coroutine(function*() {
  const dim = yield betweenSquareBrackets(
    sequenceOf([digits, str(":"), digits])
  ).map(x => [x[0], x[2]]);
  return dim;
});

const listOfIds = sequenceOf([
  ws(identifier),
  many(takeRight(str(","))(ws(identifier)))
])
  .map(x => x.flat())
  .errorMap(lintError("Invalid port identifier"));

const portParser = coroutine(function*() {
  const type = yield choice([ws(str("input")), ws(str("output"))]).errorMap(
    lintError("Invalid port type: must be 'input' or 'output'")
  );
  const arrayDim = yield possibly(arrayDimParser);
  const ids = yield listOfIds.errorMap(debug("Invalid port identifier33333"));
  return ids.map(x => ({ type, dim: arrayDim, id: x }));
  // return { type, dim: arrayDim, id: ids[0] };
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
      commaSeparated(portParser.errorMap(lintError("Invalid ports section")))
    ).map(x => x.flat())
  ).map(x => x || []);
  // ports = ports || [];

  yield ws(str(";"));

  var wires = yield possibly(ws(wireParser));
  wires = wires ? wires : [];

  // global
  definedVariables = [...ports.map(x => x.id), ...wires];
  definedControls = [];

  // TODO: check for undefined variables modules and add these to lint
  const statements = yield many(
    choice([
      // todo more wiresparser here so that wires don't have to be only at top
      ws(gateParser),
      ws(instanceParser),
      ws(assignParser) //.map(debug("assign"))
    ])
  );

  statements.forEach(x => {
    if (x.gate == "control") definedControls.push(x.id);
  });

  var clock;
  if (id == "main")
    clock = yield testParser.errorMap(lintError("Invalid test block"));

  yield ws(str("endmodule"));

  var module = { type: "module", id, ports: ports.flat(), wires, statements };
  if (clock) module.clock = clock;
  // console.log(module);

  definedModules.push(id);
  return module;
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
