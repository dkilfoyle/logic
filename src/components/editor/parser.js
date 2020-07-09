import A from "./parserLib.js";

// Utility parsers
// const peek = A.lookAhead(A.regex(/^./));
const upperOrLowerStr = s =>
  A.choice([A.str(s.toUpperCase()), A.str(s.toLowerCase())]).errorMap(
    (error, index) => "choice 000"
  );
const whitespaceSurrounded = parser =>
  A.between(A.optionalWhitespace, A.optionalWhitespace)(parser);
const commaSeparated = A.sepBy(whitespaceSurrounded(A.char(",")));
const semicolonSeparated = A.sepBy(whitespaceSurrounded(A.char(";")));
const betweenRoundBrackets = A.between(
  whitespaceSurrounded(A.char("(")),
  whitespaceSurrounded(A.char(")"))
);
const betweenCurlyBrackets = A.between(
  whitespaceSurrounded(A.char("{")),
  whitespaceSurrounded(A.char("}"))
);

const tag = type => value => ({ type, value });
const mapJoin = parser => parser.map(items => items.join(""));

// Token parsers
const idParser = whitespaceSurrounded(
  A.sequenceOf([
    A.regex(/^[a-zA-Z_]/),
    A.possibly(A.regex(/^[a-zA-Z0-9_]+/)).map(x => (x === null ? "" : x))
  ])
).map(x => x.join(""));

const operatorParser = whitespaceSurrounded(
  A.choice([
    upperOrLowerStr("nand"),
    upperOrLowerStr("and"),
    upperOrLowerStr("xnor"),
    upperOrLowerStr("xor"),
    upperOrLowerStr("nor"),
    upperOrLowerStr("or"),
    upperOrLowerStr("not")
  ])
);

const argumentsParser = betweenRoundBrackets(commaSeparated(idParser));

const logicParser = A.contextual(function*() {
  // const op = yield operatorParser.errorMapAndLint(
  //   (error, index) => "Invalid logic operator",
  //   globalLintObject
  // );
  const op = yield operatorParser.errorMap((error, index) =>
    throwLintError(
      `Invalid logic operator at ${index} old message ${error}`,
      index
    )
  );
  // {
  //   var x = throwLintError(
  //     `Invalid logic operator at ${index} old message ${error}`,
  //     index
  //   );
  //   console.log(x);
  //   return x;
  // });

  const args = yield argumentsParser;

  return tag("logic")({ op, args });
});

const callParser = A.contextual(function*() {
  yield A.str("call");
  const args = yield argumentsParser;
  return tag("call")({ args });
});

const controlledParser = A.str("controlled").map(x => ({
  type: "controlled",
  value: null
}));

const assignmentStatementParser = A.contextual(function*() {
  const id = yield whitespaceSurrounded(idParser);
  yield whitespaceSurrounded(A.str("="));
  const op = yield A.choice([logicParser, controlledParser, callParser]);
  // yield A.optionalWhitespace;
  // console.log(op);
  return tag(op.type)({ id, op: op.value });
});

const functionParser = A.contextual(function*() {
  yield whitespaceSurrounded(A.str("function")).errorMap((error, index) => {
    return `Expected "function" keyword at ${index}`;
  });
  const id = yield idParser.errorMap(
    (error, index) => `Invalid function identifier at ${index}`
  );
  const args = yield argumentsParser.errorMap(
    (error, index) => `Invalid function arguments at ${index}`
  );
  yield A.str(":").errorMap(
    (error, index) => `Expected ":" at end of function defintion at ${index}`
  );
  const code = yield A.many1(assignmentStatementParser);
  // .errorMapAndLint(
  //   (error, index) =>
  //     `Expected logic command (and, nand, or, nor, controlled, call)`,
  //   globalLintObject
  // );

  // console.log("function: ", code);

  return tag("function")({ id, args, code });
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

const circuitResult = code => {
  globalLintObject.index = -1;
  globalLintObject.error = null;
  return {
    parseState: A.many1(functionParser)
      .errorMap((error, index) => `Invalid function defintion`)
      .run(code),
    lint: globalLintObject
  };
};

export default circuitResult;
