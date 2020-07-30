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
var lint = [];
var savePosition = 0;

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

const numberLiteral = coroutine(function*() {
  const bits = yield digits.map(x => parseInt(bits));
  yield str("'");
  const base = yield choice([
    str("b").map(x => 2),
    str("h").map(x => 16),
    str("d").map(x => 10)
  ]);
  const value = yield digits;
  return { type: "number", bits, base, value: parseInt(value, base) };
});

const bitLiteral = takeLeft(ws(binaryDigit))(
  lookAhead(anythingExcept(digit))
).map(x => ({ type: "number", bits: 1, base: 2, value: parseInt(x) }));

const definedVariable = coroutine(function*() {
  const id = yield identifier; //.errorMap(lintError("Invalid identifier"));
  const index = yield possibly(betweenSquareBrackets(digits));

  const found = definedVariables.find(x => x.id == id);
  if (!found)
    yield lintWarningParser("undefined variable", "warning", id.length);

  // check to see if dim is valid
  if (index) {
    if (found.dim == 1)
      yield lintWarningParser(
        "Variable is not a vector",
        "warning",
        name.length + 3
      );
    if (index > found.dim[0] || index < found.dim[1])
      yield lintWarningParser(
        "Array index is outside of bounds for this variable",
        "warning",
        id.length + 3
      );
  }

  return { type: "variableInstance", id, index: index || 1 };
});

const definedControl = coroutine(function*() {
  const id = yield identifier; //.errorMap(lintError("Invalid identifier"));
  const index = yield possibly(betweenSquareBrackets(digits));

  const found = definedControls.find(x => x.id.id == id); // x is a gate with an id which is a variable
  if (!found)
    yield lintWarningParser("undefined variable", "warning", id.length);

  // check to see if dim is valid
  if (index) {
    if (found.dim == 1)
      yield lintWarningParser(
        "Variable is not a vector",
        "warning",
        id.length + 3
      );
    if (index > found.dim[1] || index < found.dim[0])
      yield lintWarningParser(
        "Array index is outside of bounds for this variable",
        "warning",
        id.length + 3
      );
  }

  return { type: "variableInstance", id, index: index || 1 };
});

// Instance parsers =====================================================

const instanceParamsParser = coroutine(function*() {
  const port = yield sequenceOf([str("."), identifier]).map(x => x[1]);
  const mapped = yield betweenRoundBrackets(definedVariable);
  return { port, mapped };
});

const tapPosition = tapParser(state => (savePosition = state.index)).map(
  x => savePosition
);

const instanceParser = coroutine(function*() {
  yield optionalWhitespace;
  const start = yield tapPosition;
  const module = yield ws(identifier).errorMap(x => "no module");
  // let moduleEnd = 0;
  // yield tapParser(res => (moduleEnd = res.index));
  const id = yield ws(identifier).errorMap(x => "no id");
  const params = yield betweenRoundBrackets(
    commaSeparated(ws(instanceParamsParser))
  );
  yield str(";");

  const found = definedModules.find(x => x == module);
  if (!found)
    yield lintWarningParser("Module " + module + " not defined", "warning", {
      from: start
    });

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

  const params = yield betweenRoundBrackets(commaSeparated(definedVariable));

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
  definedVariable
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
  const output = yield ws(definedVariable).errorMap(
    lintError("Invalid assign identifier")
  );
  yield ws(str("="));
  const value = yield squareBracketExpr.errorMap(
    lintError("Invalid expression")
  );
  // console.log("assignParser: ", id, value);
  return { type: "assign", output, value };
});

// MODULE =============================================================

const arrayDimParser = coroutine(function*() {
  const dim = yield betweenSquareBrackets(
    sequenceOf([digits, str(":"), digits])
  ).map(x => [parseInt(x[0]), parseInt(x[2])]);
  return dim;
});

const listOfIds = sequenceOf([
  ws(identifier),
  many(takeRight(str(","))(ws(identifier)))
])
  .map(x => x.flat())
  .errorMap(lintError("Invalid port identifier"));

const portParser = coroutine(function*() {
  const varType = yield choice([ws(str("input")), ws(str("output"))]).errorMap(
    lintError("Invalid port type: must be 'input' or 'output'")
  );
  const dim = yield possibly(ws(arrayDimParser));
  const ids = yield listOfIds.errorMap(lintError("Invalid port identifier"));
  return ids.map(x => ({
    type: "variableDeclaration",
    varType,
    id: x,
    dim: dim || 1
  }));
  // return { type, dim: arrayDim, id: ids[0] };
});

const wireParser = coroutine(function*() {
  yield str("wire ");
  const dim = yield possibly(ws(arrayDimParser));
  const ids = yield commaSeparated(
    ws(identifier).errorMap(lintError("Invalid wire identifier"))
  );
  yield ws(str(";"));
  return ids.map(x => ({
    type: "variableDeclaration",
    varType: "wire",
    id: x,
    dim: dim || 1
  }));
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
  );

  yield ws(str(";"));

  var wires = yield possibly(ws(wireParser));
  wires = wires || [];

  // global
  definedVariables = [...ports, ...wires];
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
    if (x.gate == "control") definedControls.push(x);
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
  const variable = yield ws(definedControl);
  yield str("=");
  const number = yield choice([numberLiteral, bitLiteral]).errorMap(
    lintError("Expected 0 or 1 or number")
  );
  return { variable, value: parseInt(number.value, 10) };
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
  definedModules = [];

  const parseState = takeLeft(
    many1(ws(moduleParser.errorMap(lintError("Invalid module"))))
  )(endOfInput).run(code);
  return {
    parseState,
    lint
  };
};

export default vlgParser;
