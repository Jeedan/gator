import {
	type UserCommandHandler,
	type CommandHandler,
	getLoggedInUser,
} from "../commands/commands";

export function middlewareLoggedIn(
	handler: UserCommandHandler,
): CommandHandler {
	return async (cmdName: string, ...args: string[]) => {
		const user = await getLoggedInUser();
		await handler(cmdName, user, ...args);
	};
}

// the function signature
//type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;
