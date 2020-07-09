const reDigit = /[0-9]/;
const reDigits = /^[0-9]+/;
const reLetter = /[a-zA-Z]/;
const reLetters = /^[a-zA-Z]+/;
const reWhitespaces = /^\s+/;

const updateParserState = (state, index, result) => ({
  ...state,
  index,
  result
});

const updateParserResult = (state, result) => ({
  ...state,
  result
});

// TODO: replace if index is greater than current error index, else push if index is same
const updateParserError = (state, errorMsg) => {
  // console.log("UpdateParserError: ", state, errorMsg);

  const newState = {
    ...state,
    isError: true,
    error: errorMsg
  };
  // if (newState.error.length == 0 || state.index > newState.error[0].index)
  //   newState.error = [
  //     {
  //       index: state.index,
  //       msg: errorMsg,
  //       code: state.targetString.slice(Math.max(0, state.index - 10), 20)
  //     }
  //   ];
  // else
  //   newState.error.push({
  //     index: state.index,
  //     msg: errorMsg,
  //     code: state.targetString.slice(Math.max(0, state.index - 10), 30)
  //   });
  // console.log("updateParserError: ", newState);
  return newState;
};

class Parser {
  constructor(parserStateTransformerFn) {
    this.parserStateTransformerFn = parserStateTransformerFn;
  }

  run(targetString) {
    const initialState = {
      targetString,
      index: 0,
      result: null,
      isError: false,
      error: []
    };
    console.log("initialState");
    return this.parserStateTransformerFn(initialState);
  }

  map(fn) {
    return new Parser(parserState => {
      const nextState = this.parserStateTransformerFn(parserState);
      if (nextState.isError) return nextState;
      return updateParserResult(nextState, fn(nextState.result));
    });
  }

  errorMap(fn) {
    return new Parser(parserState => {
      const nextState = this.parserStateTransformerFn(parserState);
      if (!nextState.isError) return nextState;
      return updateParserError(nextState, fn(nextState.error, nextState.index));
    });
  }

  // errorMapAndLint(fn, lint) {
  //   return new Parser(parserState => {
  //     const nextState = this.parserStateTransformerFn(parserState);
  //     if (!nextState.isError) return nextState;
  //     const newErrorMessage = fn(nextState.error, nextState.index);
  //     console.log(lint);
  //     if (nextState.index > lint.index) {
  //       lint.error = newErrorMessage;
  //       lint.index = nextState.index;
  //     }
  //     return updateParserError(nextState, newErrorMessage);
  //   });
  // }

  chain(fn) {
    return new Parser(parserState => {
      const nextState = this.parserStateTransformerFn(parserState);
      if (nextState.isError) return nextState;

      const nextParser = fn(nextState.result);
      return nextParser.parserStateTransformerFn(nextState);
    });
  }
}

const char = c =>
  new Parser(parserState => {
    const { targetString, index, isError } = parserState;
    if (isError) return parserState;
    if (targetString[index] !== c)
      return updateParserError(
        parserState,
        `char: Tried to match "${c}" at ${index}`
      );

    return updateParserState(parserState, index + 1, c);
  });

const str = s =>
  new Parser(parserState => {
    const { targetString, index, isError } = parserState;
    if (isError) return parserState;
    const slicedTarget = targetString.slice(index);
    if (slicedTarget.length == 0)
      return updateParserError(
        parserState,
        `str: Tried to match "${s}", but got Unexpected end of input.`
      );

    if (slicedTarget.startsWith(s)) {
      return updateParserState(parserState, index + s.length, s);
    }

    return updateParserError(
      parserState,
      `str: Tried to match "${s}", but got "${targetString.slice(
        index,
        index + 10
      )}"`
    );
  });

const regex = re =>
  new Parser(parserState => {
    const { targetString, index, isError } = parserState;
    if (isError) return parserState;

    const slicedTarget = targetString.slice(index);
    if (slicedTarget.length == 0)
      return updateParserError(
        parserState,
        `regex: Got Unexpected end of input.`
      );

    const regexMatch = slicedTarget.match(re);

    if (regexMatch) {
      return updateParserState(
        parserState,
        index + regexMatch[0].length,
        regexMatch[0]
      );
    }

    return updateParserError(
      parserState,
      `letters: Couldn't match letters at index ${index}`
    );
  });

const letters = regex(reLetters);
const digits = regex(reDigits);
const whitespace = regex(reWhitespaces);

const anythingExcept = parser =>
  new Parser(parserState => {
    if (parserState.isError) return parserState;
    const { target, index } = parserState;

    const out = parser.parserStateTransformerFn(parserState);
    if (out.isError) {
      return updateParserState(parserState, target[index], index + 1);
    }
    return updateParserError(
      parserState,
      `ParseError 'anythingExcept' (position ${index}): Matched '${out.result}' from the exception parser`
    );
  });

const tapParser = fn =>
  new Parser(parserState => {
    fn(parserState);
    return parserState;
  });

const sequenceOf = parsers =>
  new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }

    const results = [];
    let nextState = parserState;

    for (let p of parsers) {
      nextState = p.parserStateTransformerFn(nextState);
      results.push(nextState.result);
    }

    if (nextState.isError) {
      return nextState;
    }

    return updateParserResult(nextState, results);
  });

const possibly = parser =>
  new Parser(parserState => {
    if (parserState.isError) return parserState;

    const nextState = parser.parserStateTransformerFn(parserState);
    return nextState.isError
      ? updateParserResult(parserState, null)
      : nextState;
  });

const optionalWhitespace = possibly(whitespace).map(x => x || "");

const choice = parsers =>
  new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }

    for (let p of parsers) {
      const nextState = p.parserStateTransformerFn(parserState);
      if (!nextState.isError) {
        return nextState;
      }
    }

    return updateParserError(
      parserState,
      `choice: Unable to match with any parser at index ${parserState.index}`
    );
  });

const many = parser =>
  new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }

    let nextState = parserState;
    const results = [];
    let done = false;

    while (!done) {
      let testState = parser.parserStateTransformerFn(nextState);
      if (!testState.isError) {
        results.push(testState.result);
        nextState = testState;
      } else {
        done = true;
      }
    }

    return updateParserResult(nextState, results);
  });

const many1 = parser =>
  new Parser(parserState => {
    if (parserState.isError) {
      return parserState;
    }

    let nextState = parserState;
    const results = [];

    let done = false;
    let testState;

    while (!done) {
      testState = parser.parserStateTransformerFn(nextState);
      if (!testState.isError) {
        results.push(testState.result);
        nextState = testState;
      } else {
        done = true;
      }
    }

    if (results.length == 0) {
      return updateParserError(
        {
          ...parserState,
          error: testState.error,
          lint: testState.lint,
          lintIndex: testState.lintIndex
        },
        `many1: expected at least 1 match at ${parserState.index}`
      );
    }

    return updateParserResult(nextState, results);
  });

const between = (leftParser, rightParser) => contentParser =>
  sequenceOf([leftParser, contentParser, rightParser]).map(
    results => results[1]
  );

const sepBy = separatorParser => valueParser =>
  new Parser(parserState => {
    const results = [];
    let nextState = parserState;
    while (true) {
      const thingWeWantState = valueParser.parserStateTransformerFn(nextState);
      if (thingWeWantState.isError) break;
      results.push(thingWeWantState.result);
      nextState = thingWeWantState;

      const separatorState = separatorParser.parserStateTransformerFn(
        nextState
      );
      if (separatorState.isError) {
        break;
      }
      nextState = separatorState;
    }
    return updateParserResult(nextState, results);
  });

const sepBy1 = separatorParser => valueParser =>
  new Parser(parserState => {
    const results = [];
    let nextState = parserState;
    while (true) {
      const thingWeWantState = valueParser.parserStateTransformerFn(nextState);
      if (thingWeWantState.isError) break;
      results.push(thingWeWantState.result);
      nextState = thingWeWantState;

      const separatorState = separatorParser.parserStateTransformerFn(
        nextState
      );
      if (separatorState.isError) {
        break;
      }
      nextState = separatorState;
    }
    if (results.length == 0) {
      return updateParserError(
        parserState,
        `sepby1: Unable to capture any results at index ${parserState.index}`
      );
    }
    return updateParserResult(nextState, results);
  });

const fail = errMsg =>
  new Parser(parserState => {
    return updateParserError(parserState, errMsg);
  });

const succeed = value =>
  new Parser(parserState => {
    return updateParserResult(parserState, value);
  });

const endOfInput = new Parser(state => {
  if (state.isError) return state;
  const { targetString, index } = state;
  if (index !== targetString.length) {
    return updateParserError(
      state,
      `ParseError 'endOfInput' (position ${index}): Expected end of input but got '${targetString.slice(
        index,
        index + 1
      )}'`
    );
  }

  return updateParserResult(state, null);
});

const contextual = generatorFn => {
  return succeed(null).chain(() => {
    const iterator = generatorFn();

    const runStep = nextValue => {
      const iteratorResult = iterator.next(nextValue);

      if (iteratorResult.done) {
        return succeed(iteratorResult.value);
      }

      const nextParser = iteratorResult.value;

      if (!(nextParser instanceof Parser)) {
        throw new Error("contextual: yielded values must always be parsers!");
      }

      return nextParser.chain(runStep);
    };

    return runStep();
  });
};

const either = parser =>
  new Parser(state => {
    if (state.isError) return state;

    const nextState = parser.parserStateTransformerFn(state);

    return updateParserResult(
      { ...nextState, isError: false },
      {
        isError: nextState.isError,
        value: nextState.isError ? nextState.error : nextState.result
      }
    );
  });

// const parser = many(choice([letters, digits]));
// console.log(parser.run("ddd111"));

// module.exports = {
export default {
  str,
  regex,
  char,
  tapParser,
  letters,
  digits,
  sequenceOf,
  anythingExcept,
  choice,
  possibly,
  many,
  many1,
  between,
  sepBy,
  sepBy1,
  fail,
  succeed,
  endOfInput,
  contextual,
  whitespace,
  optionalWhitespace,
  either,

  Parser,

  updateParserState,
  updateParserResult,
  updateParserError
};
