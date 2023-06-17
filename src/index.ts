import { shiftParameters } from "./shiftParameters";

export type ParamKey = `p_${number}`;

type Input = {
  strings: string[];
  expressions: unknown[];
};

export type Output = {
  text: string;
  parameters: Record<ParamKey, any>;
  i: number;
};

function isOutput(input: unknown): input is Output {
  if (typeof input === "undefined") return false;
  if (input === null) return false;
  if (Array.isArray(input)) return false;
  if (typeof input !== "object") return false;
  const paramKeys = Object.getOwnPropertyNames(input);
  return (
    paramKeys[0] === "text" &&
    paramKeys[1] === "parameters" &&
    paramKeys[2] === "i"
  );
}

export function cypher(
  strings: TemplateStringsArray,
  ...expressions: Input["expressions"]
): Output {
  const { output } = parseTemplate({
    input: {
      strings: [...strings],
      expressions,
    },
    output: {
      text: "",
      parameters: {},
      i: -1,
    },
  });

  return output;
}
export default cypher;

export const magiccypher: typeof cypher = (strings, ...expressions) => {
  const { output } = parseTemplate({
    input: {
      strings: [...strings],
      expressions,
    },
    output: {
      text: "",
      parameters: {},
      i: -1,
    },
    options: { convertValues: true },
  });

  return output;
}

type ParserOptions = {
  convertValues: boolean;
};
type ParserState = {
  input: Input;
  output: Output;
  options?: ParserOptions;
};

function parseTemplate({
  input: { strings, expressions },
  output: { text, parameters, i },
  options = { convertValues: false },
}: ParserState): ParserState {
  const [headString, ...tailStrings] = strings;
  const [headParam, ...tailParams] = expressions;

  if (headString === undefined) {
    return {
      input: { strings, expressions },
      output: { text, parameters, i: i - 1 },
      options,
    };
  }

  let nextText = (text += headString);
  let nextParams = { ...parameters };
  let nextI = Number(i) + 1;
  if (!isUndefinedOrNull(headParam)) {
    const toCombine: Output = isOutput(headParam)
      ? headParam
      : options.convertValues
      ? convertValue(headParam)
      : outputify(headParam);

    const { text, parameters, i: paramI } = shiftParameters(toCombine, nextI);
    nextText += text;
    nextParams = { ...nextParams, ...parameters };
    nextI = paramI;
  }
  return parseTemplate({
    input: { strings: tailStrings, expressions: tailParams },
    output: { text: nextText, parameters: nextParams, i: nextI },
    options,
  });
}

function isUndefinedOrNull(x: any): x is undefined | null {
  return typeof x === "undefined" || x === null;
}

function outputify<T>(value: T): Output {
  return {
    i: 0,
    text: "$p_0",
    parameters: { p_0: value },
  };
}

// Experimental
let conversionOn = true;
function convertValue<T>(value: T): Output {
  if (!conversionOn) return outputify(value);
  if (value instanceof Date) return convertDatetime(value);
  return outputify(value);
}

function convertDatetime(value: Date): Output {
  return {
    i: 0,
    text: "datetime($p_0)",
    parameters: { p_0: value.toISOString() },
  };
}
