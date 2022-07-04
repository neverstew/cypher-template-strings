/* eslint-disable @typescript-eslint/camelcase */
import cypher from './index';

describe('cypher', () => {
  const template = cypher`a ${1} b ${'str'} c ${[1, 2]} d ${{
    foo: 'bar',
  }} e ${false} f ${6.66} g`;

  it('should provide the query with the replaced parameters', () => {
    expect(template).toEqual(
      expect.objectContaining({
        query: 'a $p_0 b $p_1 c $p_2 d $p_3 e $p_4 f $p_5 g',
      }),
    );
  });

  it('should provide parameters to match the query', () => {
    expect(template).toEqual(
      expect.objectContaining({
        params: {
          p_0: 1,
          p_1: 'str',
          p_2: [1, 2],
          p_3: { foo: 'bar' },
          p_4: false,
          p_5: 6.66,
        },
      }),
    );
  });

  it('should return empty params when no expressions', () => {
    expect(cypher`no params`).toEqual({ query: 'no params', params: {} });
  });

  it('should handle nested cypher templates', () => {
    expect(cypher`a = ${1}, ${cypher`then ${2} ${cypher`and finally ${3}`} with sibling ${4}`}`).toEqual({
      query: 'a = $p_0, then $p_1 and finally $p_2 with sibling $p_3',
      params: { p_0: 1, p_1: 2, p_2: 3, p_3: 4 },
    })
  })

  it('should not include undefined or null expressions', () => {
    expect(cypher`test ${undefined}${null}`).toEqual({ query: 'test ', params: {} })
  })
});
