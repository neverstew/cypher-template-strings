import { shiftParameters } from "./shiftParameters"

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
