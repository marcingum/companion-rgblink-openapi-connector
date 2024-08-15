import { UDPHelper } from "@companion-module/base";

const MAX_COMMANDS_WAITING_FOR_RESPONSES_FOR_POLLING: number = 5
const COMMANDS_EXPIRE_TIME_SECONDS: number = 15

export type ByteCode = '00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '0A' | '0B' | '0C' | '0D' | '0E' | '0F' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '1A' | '1B' | '1C' | '1D' | '1E' | '1F' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '2A' | '2B' | '2C' | '2D' | '2E' | '2F' | '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39' | '3A' | '3B' | '3C' | '3D' | '3E' | '3F' | '40' | '41' | '42' | '43' | '44' | '45' | '46' | '47' | '48' | '49' | '4A' | '4B' | '4C' | '4D' | '4E' | '4F' | '50' | '51' | '52' | '53' | '54' | '55' | '56' | '57' | '58' | '59' | '5A' | '5B' | '5C' | '5D' | '5E' | '5F' | '60' | '61' | '62' | '63' | '64' | '65' | '66' | '67' | '68' | '69' | '6A' | '6B' | '6C' | '6D' | '6E' | '6F' | '70' | '71' | '72' | '73' | '74' | '75' | '76' | '77' | '78' | '79' | '7A' | '7B' | '7C' | '7D' | '7E' | '7F' | '80' | '81' | '82' | '83' | '84' | '85' | '86' | '87' | '88' | '89' | '8A' | '8B' | '8C' | '8D' | '8E' | '8F' | '90' | '91' | '92' | '93' | '94' | '95' | '96' | '97' | '98' | '99' | '9A' | '9B' | '9C' | '9D' | '9E' | '9F' | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8' | 'A9' | 'AA' | 'AB' | 'AC' | 'AD' | 'AE' | 'AF' | 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B8' | 'B9' | 'BA' | 'BB' | 'BC' | 'BD' | 'BE' | 'BF' | 'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'CA' | 'CB' | 'CC' | 'CD' | 'CE' | 'CF' | 'D0' | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' | 'D8' | 'D9' | 'DA' | 'DB' | 'DC' | 'DD' | 'DE' | 'DF' | 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7' | 'E8' | 'E9' | 'EA' | 'EB' | 'EC' | 'ED' | 'EE' | 'EF' | 'F0' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'FA' | 'FB' | 'FC' | 'FD' | 'FE' | 'FF';

export class PollingCommand {
	CMD: ByteCode
	DAT1: ByteCode
	DAT2: ByteCode
	DAT3: ByteCode
	DAT4: ByteCode

	constructor(CMD: ByteCode, DAT1: ByteCode, DAT2: ByteCode, DAT3: ByteCode, DAT4: ByteCode) {
		if (CMD.length != 2 || DAT1.length != 2 || DAT2.length != 2 || DAT3.length != 2 || DAT4.length != 2) {
			console.log(`Bad command params: CMD:'${CMD}' DAT1:'${DAT1}' DAT2:'${DAT2}' DAT3:'${DAT3}' DAT4:'${DAT4}'`)
		}

		this.CMD = CMD
		this.DAT1 = DAT1
		this.DAT2 = DAT2
		this.DAT3 = DAT3
		this.DAT4 = DAT4
	}
}

export class SentCommand {
	sentDate: number
	command: string
	constructor(command: string, sentDate: number) {
		this.command = command
		this.sentDate = sentDate
	}
}

export class SentCommandStorage {
	private commandsSentWithoutResponse: SentCommand[] = []
	private expireTimeSeconds: number = COMMANDS_EXPIRE_TIME_SECONDS

	public registerSentCommand(cmd: string) {
		//console.log('OUT ' + cmd)
		this.internalRememberCommand(cmd)
	}

	public registerReceivedCommand(cmd: string) {
		//console.log('IN  ' + cmd)
		this.internalCompareResponseWithSentCommands(cmd)
	}

	public getCountElementsWithoutRespond(): number {
		return this.commandsSentWithoutResponse.length
	}

	public deleteExpiredCommands(): SentCommand[] {
		const currentMs: number = new Date().getTime()
		let deleted: SentCommand[] = []
		//for (let i = 0; i < this.commandsSentWithoutResponse.length; i++) {
		let i = this.commandsSentWithoutResponse.length
		while (i--) {
			const sent: SentCommand = this.commandsSentWithoutResponse[i]
			if (sent.sentDate + this.expireTimeSeconds * 1000 < currentMs) {
				deleted = deleted.concat(this.commandsSentWithoutResponse.splice(i, 1))
			}
		}
		return deleted
	}

	public deleteAll(): void {
		this.commandsSentWithoutResponse = []
	}

	public setExpireTimeSecons(seconds: number) {
		this.expireTimeSeconds = seconds
	}

	private internalRememberCommand(cmd: string): void {
		//console.log('Storing ' + cmd + '...')
		this.commandsSentWithoutResponse.push(new SentCommand(cmd, new Date().getTime()))
	}

	private internalCompareResponseWithSentCommands(receivedCmd: string) {
		const receivedCmdId: string = this.internalGetCmdId(receivedCmd)
		let found = false
		for (let i = 0; i < this.commandsSentWithoutResponse.length; i++) {
			const sent: SentCommand = this.commandsSentWithoutResponse[i]
			const sentCmdId: string = this.internalGetCmdId(sent.command)
			if (receivedCmdId == sentCmdId) {
				//console.log('Found sent command for response ' + receivedCmd)
				found = true
				this.commandsSentWithoutResponse.splice(i, 1)
				break
			}
		}
		if (!found) {
			console.log('No sent command matching received response: ' + receivedCmd)
		}
	}

	private internalGetCmdId(cmd: string): string {
		return cmd.substr(2, 6)
	}
}

export class ApiConfig {
	host: string
	port: number
	polling: boolean
	logEveryCommand: boolean

	constructor(host: string, port: number, polling: boolean, logEveryCommand: boolean) {
		this.host = host
		this.port = port
		this.polling = polling
		this.logEveryCommand = logEveryCommand
	}
}

type StringToListMap<T> = Record<string, T[]>;

export class RGBLinkApiConnector {
	public static EVENT_NAME_ON_DATA_API = 'on_data'
	public static EVENT_NAME_ON_DATA_API_NOT_STANDARD_LENGTH: string = 'on_data_not_standard_length'
	public static EVENT_NAME_ON_CONNECTION_OK = 'on_connection_ok'
	public static EVENT_NAME_ON_CONNECTION_WARNING = 'on_connection_warning'
	public static EVENT_NAME_ON_CONNECTION_ERROR = 'on_connection_error'
	private PARSE_INT_HEX_MODE: number = 16

	private config: ApiConfig
	private logProvider: undefined
	private socket: UDPHelper | undefined
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private eventsListeners: StringToListMap<any> = {};
	private nextSn: number = 0
	private intervalHandler100ms: NodeJS.Timeout
	// 	createTime = new Date().getTime()
	private sentCommandStorage = new SentCommandStorage()
	private pollingQueue: PollingCommand[] = []
	private pollingCommands: PollingCommand[] = []


	constructor(config: ApiConfig, pollingCommands: PollingCommand[]) {
		this.config = config
		this.pollingCommands = pollingCommands
		if (this.config && this.config.host) {
			this.createSocket(this.config.host, this.config.port)
		}

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self: RGBLinkApiConnector = this;
		//this.intervalHandler100ms = setInterval(self.onEvery100Miliseconds, 100)
		this.intervalHandler100ms = setInterval(function () {
			self.onEvery100Miliseconds()
		}, 100)
	}

	public enableLog(logProvider: undefined) {
		this.logProvider = logProvider
	}

	public disableLog() {
		this.logProvider = undefined
	}

	private myDebug(msg: string) {
		this.internalMyLog('debug', msg)
	}

	private myWarn(msg: string) {
		this.internalMyLog('warn', msg)
	}

	private internalMyLog(level: string, msg: string) {
		try {
			if (typeof this.logProvider === 'object' && this.logProvider !== null && 'log' in this.logProvider) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const method = (this.logProvider as any)['log']
				if (typeof method === 'function') {
					method.call(this.logProvider, level, msg);
				} else {
					console.log(msg);
				}
			} else {
				console.log(msg)
			}
		} catch (ex) {
			console.log(ex) // is it log anything?
		}
	}

	private onEvery100Miliseconds() {
		this.doPolling()
	}

	private doPolling(force: boolean = false) {
		// send polling commands - which asks about device status
		// don't wait for more than 5 commands (rgblink requirements described near SN field in API specification)
		// remove commands with no response in 15 seconds

		const deleted: SentCommand[] = this.sentCommandStorage.deleteExpiredCommands()
		if (deleted.length > 0) {
			deleted.forEach((sendCom) => {
				this.myWarn('Expired command (without response):' + sendCom.command)
				this.emit(
					RGBLinkApiConnector.EVENT_NAME_ON_CONNECTION_WARNING,
					'The device did not respond to the command within ' + COMMANDS_EXPIRE_TIME_SECONDS + ' seconds'
				)
			})
		}

		try {
			let commandsRequested = false
			for (let i = 0; i < MAX_COMMANDS_WAITING_FOR_RESPONSES_FOR_POLLING; i++) {
				if (this.sentCommandStorage.getCountElementsWithoutRespond() >= 5) {
					// do not send more polling commands, if we wait for 5 or more responses
					// this.myDebug(
					// 	'Skip more polling commands, current queue:' +
					// 	this.sentCommandStorage.getCountElementsWithoutRespond() +
					// 	' added new ' +
					// 	i
					// )
					break
				}

				// if there is not polling commands, try to generate a new one, but only once
				if (this.pollingQueue.length == 0 && commandsRequested == false) {
					// Do NOT get new commands, if polling is disabled (hower, commands in queue will be send, this help to get device status after connect)
					if ((this.config && this.config.polling) || force) {
						this.pollingQueue = [...this.pollingCommands]
					}
					commandsRequested = true
				}
				if (this.pollingQueue.length == 0) {
					// if still no polling commands, stop doing anything
					break
				}

				const command: PollingCommand = this.pollingQueue.shift() as PollingCommand
				this.sendCommand(command.CMD, command.DAT1, command.DAT2, command.DAT3, command.DAT4)
				if (this.pollingQueue.length == 0 && commandsRequested == true) {
					// all sent, now more for sent, break
					break
				}
			}
		} catch (ex) {
			console.log(ex)
		}
	}

	// 	readStatusAfterConnect() {
	// 		this.sentCommandStorage.deleteAll()
	// 		this.doPolling(true)
	// 	}

	private createSocket(host: string, port: number) {
		this.myDebug('RGBLinkApiConnector: creating socket ' + host + ':' + port + '...')
		this.config.host = host
		this.config.port = port

		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		if (host && port) {
			this.socket = new UDPHelper(host, port)
			this.socket.on('status_change', (status, message) => {
				this.myDebug('RGBLinkApiConnector: udp status_change:' + status + ' ' + message)
			})

			this.socket.on('error', (err) => {
				this.myDebug('RGBLinkApiConnector: udp error:' + err)
			})

			this.socket.on('data', (message) => {
				if (this.config && this.config.logEveryCommand) {
					this.myDebug('FEEDBACK: ' + message)
				}
				this.onDataReceived(message)
			})
			// this.sendConnectMessage()
			// this.readStatusAfterConnect()
		}
	}

	public onDataReceived(message: Buffer) {
		try {
			if (message.length !== 19) {
				this.emit(RGBLinkApiConnector.EVENT_NAME_ON_DATA_API_NOT_STANDARD_LENGTH, [message])
			} else {
				this.validateReceivedDataAndEmitIfValid(message)
			}
		} catch (ex) {
			console.log(ex)
		}
	}

	// 	logFeedback(redeableMsg, info) {
	// 		if (this.config && this.config.logEveryCommand) {
	// 			this.myDebug('Feedback:' + redeableMsg + ' ' + info)
	// 		}
	// 	}

	public onDestroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}
		clearInterval(this.intervalHandler100ms)
	}

	private on(event: string, listener) {
		if (typeof this.eventsListeners[event] !== 'object') {
			this.eventsListeners[event] = []
		}
		this.eventsListeners[event].push(listener)
	}

	private emit(event: string, args) {
		if (typeof this.eventsListeners[event] === 'object') {
			const listeners = this.eventsListeners[event].slice()

			if (!Array.isArray(args)) {
				args = [args]
			}
			for (let i = 0; i < listeners.length; i++) {
				listeners[i].apply(this, args)
			}
		}
	}

	private sendCommandNative(cmd: string) {
		console.log('sendCommandNative ' + cmd)
		//let self = this
		try {
			if (cmd !== undefined && cmd != '') {
				if (this.socket !== undefined) {
					this.socket.send(cmd).then(function () {
						// self.myLog('sent?')
					})
					if (this.config && this.config.logEveryCommand) {
						this.myDebug('SENT    : ' + cmd)
					}
					this.sentCommandStorage.registerSentCommand(cmd)
				} else {
					this.myDebug("Can't send command, socket undefined!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
				}
			}
		} catch (ex) {
			console.log(ex)
		}
	}

	// 	setPolling(polling) {
	// 		this.config.polling = polling
	// 	}

	// 	setLogEveryCommand(logEveryCommand) {
	// 		this.config.logEveryCommand = logEveryCommand
	// 	}

	private sendCommand(CMD: ByteCode, DAT1: ByteCode, DAT2: ByteCode, DAT3: ByteCode, DAT4: ByteCode) {
		const ADDR: ByteCode = '00'
		this.sendCommandWithAddr(ADDR, CMD, DAT1, DAT2, DAT3, DAT4)
	}

	private sendCommandWithAddr(ADDR: ByteCode, CMD: ByteCode, DAT1: ByteCode, DAT2: ByteCode, DAT3: ByteCode, DAT4: ByteCode) {
		const SN: ByteCode = this.byteToTwoSignHex(this.nextSn)
		this.incrementNextSn()
		const checksum: ByteCode = this.calculateChecksum(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4)
		const cmd: string = '<T' + ADDR + SN + CMD + DAT1 + DAT2 + DAT3 + DAT4 + checksum + '>'
		this.sendCommandNative(cmd)
	}

	public byteToTwoSignHex(b): ByteCode {
		let out = parseInt(b).toString(this.PARSE_INT_HEX_MODE).toUpperCase()
		while (out.length < 2) {
			out = '0' + out
		}
		return out as ByteCode
	}

	private incrementNextSn() {
		this.nextSn++
		if (this.nextSn > 255) {
			this.nextSn = 0
		}
	}

	validateReceivedDataAndEmitIfValid(message: Buffer) {
		const redeableMsg: string = message.toString('utf8').toUpperCase()
		this.sentCommandStorage.registerReceivedCommand(redeableMsg)

		// Checksum checking
		const checksumInMessage: ByteCode = redeableMsg.substr(16, 2) as ByteCode
		const ADDR: ByteCode = redeableMsg.substr(2, 2) as ByteCode
		const SN: ByteCode = redeableMsg.substr(4, 2) as ByteCode
		const CMD: ByteCode = redeableMsg.substr(6, 2) as ByteCode
		const DAT1: ByteCode = redeableMsg.substr(8, 2) as ByteCode
		const DAT2: ByteCode = redeableMsg.substr(10, 2) as ByteCode
		const DAT3: ByteCode = redeableMsg.substr(12, 2) as ByteCode
		const DAT4: ByteCode = redeableMsg.substr(14, 2) as ByteCode
		const calculatedChecksum = this.calculateChecksum(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4)
		if (checksumInMessage != calculatedChecksum) {
			this.emit(RGBLinkApiConnector.EVENT_NAME_ON_CONNECTION_WARNING, 'Incorrect checksum ' + redeableMsg)
			this.myDebug('redeableMsg Incorrect checksum: ' + checksumInMessage + ' != ' + calculatedChecksum)
			return
		}

		if (redeableMsg[0] != '<' || redeableMsg[1] != 'F' || redeableMsg[18] != '>') {
			this.emit(RGBLinkApiConnector.EVENT_NAME_ON_CONNECTION_WARNING, 'Message is not a feedback:' + redeableMsg)
			return
		}

		if (redeableMsg.includes('FFFFFFFF')) {
			this.emit(RGBLinkApiConnector.EVENT_NAME_ON_CONNECTION_WARNING, 'Feedback with error:' + redeableMsg)
			return
		}
		// end of validate section

		this.emit(RGBLinkApiConnector.EVENT_NAME_ON_DATA_API, [ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4])
	}

	//TODO make me private
	public calculateChecksum(ADDR: ByteCode, SN: ByteCode, CMD: ByteCode, DAT1: ByteCode, DAT2: ByteCode, DAT3: ByteCode, DAT4: ByteCode): ByteCode {
		let sum = 0
		sum += parseInt(ADDR, this.PARSE_INT_HEX_MODE)
		sum += parseInt(SN, this.PARSE_INT_HEX_MODE)
		sum += parseInt(CMD, this.PARSE_INT_HEX_MODE)
		sum += parseInt(DAT1, this.PARSE_INT_HEX_MODE)
		sum += parseInt(DAT2, this.PARSE_INT_HEX_MODE)
		sum += parseInt(DAT3, this.PARSE_INT_HEX_MODE)
		sum += parseInt(DAT4, this.PARSE_INT_HEX_MODE)
		let checksum = (sum % 256).toString(this.PARSE_INT_HEX_MODE).toUpperCase()
		while (checksum.length < 2) {
			checksum = '0' + checksum
		}
		return checksum as ByteCode
	}

	public getNumberOfCommandsWithoutRespond() {
		return this.sentCommandStorage.getCountElementsWithoutRespond()
	}
}

