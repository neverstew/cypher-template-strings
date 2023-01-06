import { shiftParameters } from "./shiftParameters";

type ParamKey = `p_${number}`;
type ParamText = `$${ParamKey}`;

type Input = {
  strings: string[];
  expressions: unknown[];
};

export type Output = {
  text: string;
  parameters: Record<ParamKey, any>;
  i: number;
};
export type ParameterEntries = [ParamKey, any][];

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

export default function cypher(
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

type ParserState = {
  input: Input;
  output: Output;
};

function parseTemplate({
  input: { strings, expressions },
  output: { text, parameters, i },
}: ParserState): ParserState {
  const [headString, ...tailStrings] = strings;
  const [headParam, ...tailParams] = expressions;

  if (headString === undefined) {
    return {
      input: { strings, expressions },
      output: { text, parameters, i: i - 1 },
    };
  }

  let nextText = (text += headString);
  let nextParams = { ...parameters };
  let nextI = Number(i) + 1;
  if (!isUndefinedOrNull(headParam)) {
    if (isOutput(headParam)) {
      const { text, parameters, i: paramI } = shiftParameters(headParam, nextI);
      nextText += text;
      nextParams = { ...nextParams, ...parameters };
      nextI = paramI;
    } else {
      const paramText: ParamText = `$p_${nextI}`;
      const paramKey: ParamKey = `p_${nextI}`;
      nextText += paramText;
      nextParams = { ...nextParams, [paramKey]: headParam };
    }
  }
  return parseTemplate({
    input: { strings: tailStrings, expressions: tailParams },
    output: { text: nextText, parameters: nextParams, i: nextI },
  });
}

function isUndefinedOrNull(x: any): x is undefined | null {
  return typeof x === "undefined" || x === null;
}
