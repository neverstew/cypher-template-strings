import { shiftParameters } from "./shiftParameters"

describe('shiftParametersBy', () => {
  it('should never return less than 0 for i', () => {
    let result = shiftParameters({ query: '', params: {}, i: -1 }, 3)
    expect(result).toEqual({ query: '', params: {}, i: 3 })
  })
  it('should move the params up by the specified number', () => {
    let result = shiftParameters({ query: '$p_1', params: {p_1: 1}, i: 1 }, 3)
    expect(result).toEqual({ query: '$p_4', params: {p_4: 1}, i: 4 })

    result = shiftParameters({ query: '$p_0 $p_3 $p_99', params: {p_0: 1, p_3: 2, p_99: 3 }, i: 99 }, 1)
    expect(result).toEqual({ query: '$p_1 $p_4 $p_100', params: {p_1: 1, p_4: 2, p_100: 3 }, i: 100 })
  })
})
