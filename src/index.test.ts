/* eslint-disable @typescript-eslint/camelcase */
import cypher, { shiftParameters } from './index';

describe('shiftParametersBy', () => {
  it('should never return less than 0 for i', () => {
    let result = shiftParameters({ text: '', parameters: {}, i: -1 }, 3)
    expect(result).toEqual({ text: '', parameters: {}, i: 3 })
  })
  it('should move the params up by the specified number', () => {
    let result = shiftParameters({ text: '$p_1', parameters: {p_1: 1}, i: 1 }, 3)
    expect(result).toEqual({ text: '$p_4', parameters: {p_4: 1}, i: 4 })

    result = shiftParameters({ text: '$p_0 $p_3 $p_99', parameters: {p_0: 1, p_3: 2, p_99: 3 }, i: 99 }, 1)
    expect(result).toEqual({ text: '$p_1 $p_4 $p_100', parameters: {p_1: 1, p_4: 2, p_100: 3 }, i: 100 })
  })
})

describe('cypher', () => {
  const template = cypher`a ${1} b ${'str'} c ${[1, 2]} d ${{
    foo: 'bar',
  }} e ${false} f ${6.66} g`;

  it('should provide the query with the replaced parameters', () => {
    expect(template).toEqual(
      expect.objectContaining({
        text: 'a $p_0 b $p_1 c $p_2 d $p_3 e $p_4 f $p_5 g',
      }),
    );
  });

  it('should provide parameters to match the query', () => {
    expect(template).toEqual(
      expect.objectContaining({
        parameters: {
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
    expect(cypher`no params`).toEqual({ text: 'no params', parameters: {}, i: -1 });
  });

  it('should handle nested cypher templates', () => {
    expect(cypher`a = ${1}, ${cypher`then ${2} ${cypher`and finally ${3}`} with sibling ${4}`}`).toEqual({
      text: 'a = $p_0, then $p_1 and finally $p_2 with sibling $p_3',
      parameters: { p_0: 1, p_1: 2, p_2: 3, p_3: 4 },
      i: 3,
    })
  })

  it('should not include undefined or null expressions', () => {
    expect(cypher`test ${undefined}${null}`).toEqual({ text: 'test ', parameters: {}, i: 1 })
  })

  it('should maintain ordering across multiple contexts', () => {
    const otherGenerator = (b: number, c: number) => cypher`b = ${b}, c = ${c}`
    expect(cypher`a = ${1}, ${otherGenerator(2, 3)}, d = ${4}`).toEqual({
      text: 'a = $p_0, b = $p_1, c = $p_2, d = $p_3',
      parameters: { p_0: 1, p_1: 2, p_2: 3, p_3: 4 },
      i: 3,
    })
  })
});
