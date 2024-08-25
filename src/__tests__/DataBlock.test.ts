import { ApiMessage, DataBlockHelper, Hex } from "../rgblinkopenapiconnector"


test('datablock is corectly parsed', async () => {
    const helper: DataBlockHelper = new DataBlockHelper()
    const feedback: string = '<F004B' + 'F1' + 'B3' + '01' + '0700' + 'F7>01 80 07 38 04 3c 00'
    const parsedDatablock: Hex[] | undefined = helper.parseDataBlock(feedback.substring(19))
    expect(parsedDatablock).toEqual(['01', '80', '07', '38', '04', '3C', '00'])
    expect(helper.isDataBlockValid(new ApiMessage('00', '4B', 'F1', 'B3', '01', '07', '00', 'F7', parsedDatablock))).toEqual(true)
})