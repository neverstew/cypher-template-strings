import { Output, ParameterEntries } from "./index";


export function shiftParameters(output: Output, shift: number): Output {
  const newText = output.query.replace(
    /p_(\d+)/g,
    (_, match) => `p_${Number(match) + shift}`
  );
  const floor = Math.max(output.i, 0);
  const newParams: ParameterEntries = [];
  for (const [k, v] of Object.entries(output.params)) {
    const i = Number(k.slice(2));
    newParams.push([`p_${i + shift}`, v]);
  }
  return {
    query: newText,
    params: Object.fromEntries(newParams),
    i: floor + shift,
  };
}
