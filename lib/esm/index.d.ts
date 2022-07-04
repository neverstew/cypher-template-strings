declare type Output = {
    text: string;
    parameters: Record<string, any>;
};
export default function cypher(strings: TemplateStringsArray, ...expressions: unknown[]): Output;
export {};
