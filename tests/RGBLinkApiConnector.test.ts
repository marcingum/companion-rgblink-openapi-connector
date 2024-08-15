import { ApiConfig, PollingCommand, RGBLinkApiConnector } from "../rgblinkopenapiconnector";


const TEST_PORT: number = 25000

test('RGBLinkApiConnector calculate checksum correctly', () => {
    const api: RGBLinkApiConnector = new RGBLinkApiConnector(new ApiConfig('localhost', TEST_PORT, false, false), [])

    expect(api.calculateChecksum('00', '00', '75', '1E', '00', '00', '00')).toEqual('93')

    expect(api.calculateChecksum('00', '00', '00', '00', '00', '00', '00')).toEqual('00')

    api.onDestroy();

})

test('RGBLinkApiConnector polling works', async () => {
    // given connectore setted up with enabled polling
    const api: RGBLinkApiConnector = new RGBLinkApiConnector(
        new ApiConfig('localhost', TEST_PORT, true, false),
        [
            new PollingCommand('01', '01', '01', '01', '01'),
            new PollingCommand('02', '02', '02', '02', '02')
        ]
    )

    await new Promise((r) => setTimeout(r, 200));


    api.onDestroy();

})

// when polling enabled
// then polling works

// czy działa polling 1second i 100ms
// mock na udp? testowanie przyjmowania poleceń  zwrotnych trzeba zrobić

