import { Output, ParameterEntries } from "./index";


export function shiftParameters(output: Output, shift: number): Output {
  const newText = output.text.replace(
    /p_(\d+)/g,
    (_, match) => `p_${Number(match) + shift}`
  );
  const floor = Math.max(output.i, 0);
  const newParams: ParameterEntries = [];
  for (const [k, v] of Object.entries(output.parameters)) {
    const i = Number(k.slice(2));
    newParams.push([`p_${i + shift}`, v]);
  }
  return {
    text: newText,
    parameters: Object.fromEntries(newParams),
    i: floor + shift,
  };
}
