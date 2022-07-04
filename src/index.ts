type Output = {
  text: string;
  parameters: Record<string, any>;
};

function shiftOutput(input: Output, by: number): Output {
  const { text, parameters } = input;
  const newQuery = text.replace(/p_(\d+)/g, (_, match) => `p_${Number(match) + by}`)
  const newParams = Object.fromEntries(Object
    .entries(parameters)
    .map(([k, v]) => ([`p_${Number(k.slice(2)) + by}`, v]))
  )
  return {
    text: newQuery,
    parameters: newParams,
  }
}

type ParserState = Output & {
  i: number;
  strings: TemplateStringsArray;
  expressions: unknown[];
};

function parseTemplate(state: ParserState): ParserState {
  const { strings, expressions } = state;
  let { text, parameters, i } = state;
  const totalParams = strings.length;
  const initialI = i.valueOf();
  for (i; i < initialI + totalParams; i++) {
    const index = i - initialI;
    const string = strings[index];
    const param = expressions[index];

    if (!!string || typeof param !== 'undefined' || param !== null) {
      text += string;
      if (typeof param !== 'undefined' && param !== null) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (!isCypherOutput(param)) {
          const paramName = `$p_${i}`;
          text += paramName;
          parameters[`p_${i}`] = param;
        } else {
          const { text: shiftedNestedQuery, parameters: shiftedNestedParams } =
            shiftOutput(param, i);
          text += shiftedNestedQuery
          parameters = { ...parameters, ...shiftedNestedParams };
        }
      }
    }
  }

  return { text, parameters, i, strings, expressions };
}

export default function cypher(
  strings: TemplateStringsArray,
  ...expressions: unknown[]
): Output {
  const { text, parameters } = parseTemplate({
    text: '',
    parameters: {},
    i: 0,
    strings,
    expressions,
  });

  return {
    text,
    parameters,
  };
}

function isCypherOutput(input: unknown): input is Output {
  if (typeof input === 'undefined') return false
  if (input === null) return false
  if (Array.isArray(input)) return false;
  if (typeof input !== 'object') return false;
  const paramKeys = Object.getOwnPropertyNames(input);
  return paramKeys[0] === 'text' && paramKeys[1] === 'parameters';
}
