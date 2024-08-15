import { ApiConfig, PollingCommand, RGBLinkApiConnector } from "../rgblinkopenapiconnector";


const TEST_PORT: number = 25000

let api: RGBLinkApiConnector | undefined = undefined

afterEach(() => {
    if (api) {
        api.onDestroy()
    }
});

test('RGBLinkApiConnector calculate checksum correctly', async () => {
    api = new RGBLinkApiConnector(new ApiConfig('localhost', TEST_PORT, false, false), [])

    expect(api.calculateChecksum('00', '00', '75', '1E', '00', '00', '00')).toEqual('93')

    expect(api.calculateChecksum('00', '00', '00', '00', '00', '00', '00')).toEqual('00')

})

test('RGBLinkApiConnector polling commands and join with answers ', async () => {
    // given connectore setted up with enabled polling
    api = new RGBLinkApiConnector(
        new ApiConfig('localhost', TEST_PORT, true, false),
        [
            new PollingCommand('01', '01', '01', '01', '01'),
            new PollingCommand('02', '02', '02', '02', '02')
        ]
    )
    await new Promise((r) => setTimeout(r, 150));
    expect(api.getNumberOfCommandsWithoutRespond()).toEqual(2)

    api.onDataReceived(Buffer.from("<F0000010101010105>"))
    await new Promise((r) => setTimeout(r, 1));
    expect(api.getNumberOfCommandsWithoutRespond()).toEqual(1)

    api.onDataReceived(Buffer.from("<F000102020202020A>"))
    await new Promise((r) => setTimeout(r, 1));
    expect(api.getNumberOfCommandsWithoutRespond()).toEqual(0)

})


// byteToTwoSignHex
