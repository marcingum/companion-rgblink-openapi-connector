import { PollingCommand } from "../rgblinkopenapiconnector";

test('PollingCommand constructor works fine for proper params', () => {
    try {
        const command1: PollingCommand = new PollingCommand('F1', 'B3', '00', '00', '00')
        console.log(command1)
    } catch (ex) {
        console.log(ex);
        fail("PollingCommand should work fine for proper params")
    }

})
