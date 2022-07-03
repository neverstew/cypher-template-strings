type Output = {
  query: string;
  params: Record<string, any>;
};

function shiftOutput(input: Output, by: number): Output {
  const { query, params } = input;
  const newQuery = query.replace(/p_(\d+)/g, (_, match) => `p_${Number(match) + by}`)
  const newParams = Object.fromEntries(Object
    .entries(params)
    .map(([k, v]) => ([`p_${Number(k.slice(2)) + by}`, v]))
  )
  return {
    query: newQuery,
    params: newParams,
  }
}

type ParserState = Output & {
  i: number;
  strings: TemplateStringsArray;
  expressions: unknown[];
};

function parseTemplate(state: ParserState): ParserState {
  const { strings, expressions } = state;
  let { query, params, i } = state;
  const totalParams = strings.length;
  const initialI = i.valueOf();
  for (i; i < initialI + totalParams; i++) {
    const index = i - initialI;
    const string = strings[index];
    const param = expressions[index];

    if (!!string || typeof param !== 'undefined' || param !== null) {
      query += string;
      if (typeof param !== 'undefined' && param !== null) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (!isCypherOutput(param)) {
          const paramName = `$p_${i}`;
          query += paramName;
          params[`p_${i}`] = param;
        } else {
          const { query: shiftedNestedQuery, params: shiftedNestedParams } =
            shiftOutput(param, i);
          query += shiftedNestedQuery
          params = { ...params, ...shiftedNestedParams };
        }
      }
    }
  }

  return { query, params, i, strings, expressions };
}

export default function cypher(
  strings: TemplateStringsArray,
  ...expressions: unknown[]
): Output {
  const { query, params } = parseTemplate({
    query: '',
    params: {},
    i: 0,
    strings,
    expressions,
  });

  return {
    query,
    params,
  };
}

function isCypherOutput(input: unknown): input is Output {
  if (typeof input === 'undefined') return false
  if (input === null) return false
  if (Array.isArray(input)) return false;
  if (typeof input !== 'object') return false;
  const paramKeys = Object.getOwnPropertyNames(input);
  return paramKeys[0] === 'query' && paramKeys[1] === 'params';
}
