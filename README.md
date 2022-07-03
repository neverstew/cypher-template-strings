# Cypher Template Strings

An easy way to use tagged template strings to construct cypher queries for the official [neo4j-javascript-driver](https://github.com/neo4j/neo4j-javascript-driver).

## Examples

```js
// simple substitution
let id = 1234;
driver.run(cypher`MATCH (person:Person { id: ${id} }) RETURN person`)

// skips undefined or null expressions
// the following expression is equivalent to the first
let u = undefined;
let n = null;
driver.run(cypher`
  MATCH (person:Person { id: ${id} })
  ${u && 'WHERE person.firstname = "Barney"'}
  ${n && 'ORDER BY person.id'}
  RETURN person
`)

// supports infinitely nestable templates
let brother = 2345
driver.run(cypher`
  MATCH (person:Person)
  WHERE person.id = ${id}
  ${brother && cypher`
    AND EXISTS {
      MATCH (person)-[:BROTHER]->(:Person { id: ${brother} })
    }
  `}
  RETURN person
`)
```

## How it works

The `query` and `params` objects passed to the driver are constructed by converting values in the tagged template into parameter keys e.g. `p_1`, `p_2` and adding those to the `params` object.

Using the example from earlier, we can see the corresponding output:

```js
let id = 1234
let brother = 2345
cypher`
  MATCH (person:Person)
  WHERE person.id = ${id}
  ${brother && cypher`
    AND EXISTS {
      MATCH (person)-[:BROTHER]->(:Person { id: ${brother} })
    }
  `}
  RETURN person
`

{
  query: `
    MATCH (person:Person)
    WHERE person.id = $p_0
    AND EXISTS {
      MATCH (person)-[:BROTHER]->(:Person { id: $p_1 })
    }
    RETURN person
  `,
  params: { p_0: 1234, p_1: 2345 }
}
```

## Contributing

Feel free! This is just getting started.

## Improvements

[ ] Convert some js types into standard serializable types e.g. Date
[ ] Strongly type params for better inspection
