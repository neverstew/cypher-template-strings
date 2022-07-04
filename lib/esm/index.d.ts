declare type Output = {
    query: string;
    params: Record<string, any>;
};
export default function cypher(strings: TemplateStringsArray, ...expressions: unknown[]): Output;
export {};
