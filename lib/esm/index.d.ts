declare type ParamKey = `p_${number}`;
declare type Input = {
    strings: string[];
    expressions: unknown[];
};
declare type Output = {
    text: string;
    parameters: Record<ParamKey, any>;
    i: number;
};
export default function cypher(strings: TemplateStringsArray, ...expressions: Input["expressions"]): Output;
export declare function shiftParameters(output: Output, shift: number): Output;
export {};
