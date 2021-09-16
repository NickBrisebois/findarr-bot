import { injectable } from "inversify";
import { IncomingMessageParsed, ReturnedMessage } from "src/types";

@injectable()
export class MessagingService {
	constructor() {}

	getResponse(message: IncomingMessageParsed): ReturnedMessage | ReturnedMessage[] {
		return {

		} as ReturnedMessage;
	}
}