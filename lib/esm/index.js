function isOutput(input) {
    if (typeof input === "undefined")
        return false;
    if (input === null)
        return false;
    if (Array.isArray(input))
        return false;
    if (typeof input !== "object")
        return false;
    const paramKeys = Object.getOwnPropertyNames(input);
    return (paramKeys[0] === "text" &&
        paramKeys[1] === "parameters" &&
        paramKeys[2] === "i");
}
export default function cypher(strings, ...expressions) {
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
function parseTemplate({ input: { strings, expressions }, output: { text, parameters, i }, }) {
    const [headString, ...tailStrings] = strings;
    const [headParam, ...tailParams] = expressions;
    if (headString === undefined) {
        return {
            input: { strings, expressions },
            output: { text, parameters, i: i - 1 },
        };
    }
    let nextText = (text += headString);
    let nextParams = Object.assign({}, parameters);
    let nextI = Number(i) + 1;
    if (!isUndefinedOrNull(headParam)) {
        if (isOutput(headParam)) {
            const { text, parameters, i: paramI } = shiftParameters(headParam, nextI);
            nextText += text;
            nextParams = Object.assign(Object.assign({}, nextParams), parameters);
            nextI = paramI;
        }
        else {
            const paramText = `$p_${nextI}`;
            const paramKey = `p_${nextI}`;
            nextText += paramText;
            nextParams = Object.assign(Object.assign({}, nextParams), { [paramKey]: headParam });
        }
    }
    return parseTemplate({
        input: { strings: tailStrings, expressions: tailParams },
        output: { text: nextText, parameters: nextParams, i: nextI },
    });
}
export function shiftParameters(output, shift) {
    const newText = output.text.replace(/p_(\d+)/g, (_, match) => `p_${Number(match) + shift}`);
    const floor = Math.max(output.i, 0);
    const newParams = [];
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
function isUndefinedOrNull(x) {
    return typeof x === "undefined" || x === null;
}
//# sourceMappingURL=index.js.map