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
  skip
} from "arcsecond";

var lint = [];
const lintError = lintError => (error, index) => {
  lint.push({ index, error: lintError });
  return lintError;
};

// Utility parsers
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

// Token parsers
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

  const params = yield betweenRoundBrackets(commaSeparated(identifier));
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

const instanceParser = coroutine(function*() {
  const module = yield ws(identifier).errorMap(x => "no module");
  const id = yield ws(identifier).errorMap(x => "no id");
  const params = yield betweenRoundBrackets(
    commaSeparated(ws(instanceParamsParser))
  ).errorMap(x => {
    console.log(x);
    return x;
  });
  yield str(";");
  return { type: "instance", module, id, params };
});

const variableParser = coroutine(function*() {
  const id = yield identifier;
  const index = yield possibly(betweenSquareBrackets(digits));
  return { id, index };
});

const instanceParamsParser = coroutine(function*() {
  const instanceVar = yield sequenceOf([str("."), identifier]).map(x => x[1]);
  const moduleVar = yield betweenRoundBrackets(variableParser);
  return { param: instanceVar, mapped: moduleVar };
});

const numberParser = coroutine(function*() {
  const bits = yield digits;
  yield str("'");
  const base = yield str("b"); //choice([str("b"), str("h", str("d"))]);
  const value = yield digits;
  return { type: "number", bits, base, value };
});

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

const testAssignmentParser = coroutine(function*() {
  const id = yield ws(identifier);
  yield str("=");
  const value = yield ws(digits);
  return { id, value: parseInt(value, 10) };
});

const testClockParser = coroutine(function*() {
  yield str("#");
  const time = yield digits;
  yield whitespace;
  const assignments = yield betweenCurlyBrackets(
    commaSeparated(ws(testAssignmentParser))
  );
  yield str(";");
  return { time: parseInt(time, 10), assignments };
});

// MODULE ================================================

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

  const wires = yield possibly(
    sequenceOf([
      str("wire "),
      commaSeparated(ws(identifier)),
      ws(str(";"))
    ]).map(x => x[1])
  );

  const statements = yield many(
    choice([ws(gateParser), ws(instanceParser), ws(assignParser)])
  );

  var clock;
  if (id == "main") {
    yield ws(str("test begin"));
    clock = yield many(ws(testClockParser));
    yield ws(str("end"));
  }

  yield ws(str("endmodule"));

  return { type: "module", id, ports, wires, statements, clock };
});

// ===================================

const vlgParser = code => {
  lint = [];
  const parseState = sequenceOf([many1(ws(moduleParser)), endOfInput])
    .map(x => x[0]) // don't include the endofinput in result
    .run(code);
  // TODO: check for undefined variables in modules and add these to lint
  return {
    parseState,
    lint
  };
};

export default vlgParser;
