declare type Output = {
    query: string;
    params: Record<string, any>;
};
declare function cypher(strings: TemplateStringsArray, ...expressions: unknown[]): Output;

export { cypher as default };
