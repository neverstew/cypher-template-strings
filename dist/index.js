"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => cypher
});
module.exports = __toCommonJS(src_exports);
function shiftOutput(input, by) {
  const { query, params } = input;
  const newQuery = query.replace(/p_(\d+)/g, (_, match) => `p_${Number(match) + by}`);
  const newParams = Object.fromEntries(Object.entries(params).map(([k, v]) => [`p_${Number(k.slice(2)) + by}`, v]));
  return {
    query: newQuery,
    params: newParams
  };
}
function parseTemplate(state) {
  const { strings, expressions } = state;
  let { query, params, i } = state;
  const totalParams = strings.length;
  const initialI = i.valueOf();
  for (i; i < initialI + totalParams; i++) {
    const index = i - initialI;
    const string = strings[index];
    const param = expressions[index];
    if (!!string || typeof param !== "undefined" || param !== null) {
      query += string;
      if (typeof param !== "undefined" && param !== null) {
        if (!isCypherOutput(param)) {
          const paramName = `$p_${i}`;
          query += paramName;
          params[`p_${i}`] = param;
        } else {
          const { query: shiftedNestedQuery, params: shiftedNestedParams } = shiftOutput(param, i);
          query += shiftedNestedQuery;
          params = { ...params, ...shiftedNestedParams };
        }
      }
    }
  }
  return { query, params, i, strings, expressions };
}
function cypher(strings, ...expressions) {
  const { query, params } = parseTemplate({
    query: "",
    params: {},
    i: 0,
    strings,
    expressions
  });
  return {
    query,
    params
  };
}
function isCypherOutput(input) {
  if (typeof input === "undefined")
    return false;
  if (input === null)
    return false;
  if (Array.isArray(input))
    return false;
  if (typeof input !== "object")
    return false;
  const paramKeys = Object.getOwnPropertyNames(input);
  return paramKeys[0] === "query" && paramKeys[1] === "params";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=index.js.map