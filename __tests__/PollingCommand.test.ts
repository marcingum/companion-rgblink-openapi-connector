import { PollingCommand } from "../src/rgblinkopenapiconnector";

test('PollingCommand constructor works fine for proper params', () => {
    try {
        const command1: PollingCommand = new PollingCommand('F1', 'B3', '00', '00', '00')
        expect(command1).not.toBeUndefined()
    } catch (ex) {
        console.log(ex);
        fail("PollingCommand should work fine for proper params")
    }

})
