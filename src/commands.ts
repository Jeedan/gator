import { setUser } from "./config";

export type CommandsRegistry = Record<string, CommandHandler>;

type CommandHandler = (cmdName: string, ...args: string[]) => void;

// if args is empty throw an error,
// login expects a single argument 'username'
// setUsername to the given argument
// Print a message to the terminal that user has been set;
export function handlerLogin(cmdName: string, ...args: string[]): void {
	if (args.length < 1) {
		throw new Error("Unable to login, no arguments received.");
	}

	if (args.length > 1) {
		throw new Error("Too many arguments passed to handerlogin.");
	}

	const username = args[0];
	setUser(username);
	console.log("Username has been set to:", username);
}

// registers a new handler function with a command name
export function registerCommand(
	registry: CommandsRegistry,
	cmdName: string,
	handler: CommandHandler,
): void {
	registry[cmdName] = handler;
}

// run a given command if it exists
export function runCommand(
	registry: CommandsRegistry,
	cmdName: string,
	...args: string[]
): void {
	if (registry === null) {
		throw new Error("Registry not found.");
	}

	if (!registry[cmdName]) {
		throw new Error("Invalid command name.");
	}

	registry[cmdName](cmdName, ...args);
}
