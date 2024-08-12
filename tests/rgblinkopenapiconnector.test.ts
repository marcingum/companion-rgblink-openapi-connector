import { PollingCommand } from "../rgblinkopenapiconnector";

test('PollingCommand constructor works fine for proper params', () => {
    //const storage:SentCommandStorage = new SentCommandStorage()

    try {
        const command1: PollingCommand = new PollingCommand('F1', 'B3', '00', '00', '00')
        const command2: PollingCommand = new PollingCommand('F1', 'B7', '00', '00', '00')
    } catch (ex) {
        fail("PollingCommand should work fine for proper params")
    }
    
});