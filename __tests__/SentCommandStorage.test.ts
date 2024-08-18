import { SentCommand, SentCommandStorage } from "../src/rgblinkopenapiconnector";

test('SentCommandStorage should help track sent command recognize responses for that commands', () => {
    const storage: SentCommandStorage = new SentCommandStorage()

    storage.registerSentCommand('<T0000750200000077>')
    expect(storage.getCountElementsWithoutRespond()).toEqual(1)

    storage.registerReceivedCommand('<F0000750200000077>')
    expect(storage.getCountElementsWithoutRespond()).toEqual(0)
})

test('SentCommandStorage remember more commands', () => {
    const storage: SentCommandStorage = new SentCommandStorage()

    storage.registerSentCommand('<T0000750200000077>')
    expect(storage.getCountElementsWithoutRespond()).toEqual(1)

    storage.registerSentCommand('<T0001750200000077>')
    expect(storage.getCountElementsWithoutRespond()).toEqual(2)

    storage.registerReceivedCommand('<F0000750200000077>')
    expect(storage.getCountElementsWithoutRespond()).toEqual(1)

    storage.registerReceivedCommand('<F0001750200000077>')
    expect(storage.getCountElementsWithoutRespond()).toEqual(0)
})

test('SentCommandStorage deleteAll works correctly', () => {
    const storage: SentCommandStorage = new SentCommandStorage()

    storage.registerSentCommand('<T0000750200000077>')
    expect(storage.getCountElementsWithoutRespond()).toEqual(1)

    storage.registerSentCommand('<T0001750200000077>')
    expect(storage.getCountElementsWithoutRespond()).toEqual(2)

    storage.deleteAll()
    expect(storage.getCountElementsWithoutRespond()).toEqual(0)
})

test('SentCommandStorage delete expired commands on request', async () => {
    const storage: SentCommandStorage = new SentCommandStorage()
    storage.setExpireTimeSecons(1)
    const cmd: string = '<T0000750200000077>'

    storage.registerSentCommand(cmd)
    expect(storage.getCountElementsWithoutRespond()).toEqual(1)

    await new Promise((r) => setTimeout(r, 500));
    expect(storage.getCountElementsWithoutRespond()).toEqual(1)
    expect(storage.deleteExpiredCommands()).toEqual([])

    await new Promise((r) => setTimeout(r, 600));
    const deleted: SentCommand[] = storage.deleteExpiredCommands()
    expect(storage.getCountElementsWithoutRespond()).toEqual(0)
    expect(deleted.length).toEqual(1);
    expect(deleted[0].command).toEqual(cmd)
})

