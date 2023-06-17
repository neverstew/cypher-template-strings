const { cypher } = require("cypher-template-strings");
console.info(cypher`return ${1} as one`);
