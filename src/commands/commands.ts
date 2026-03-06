import { setUser } from "../config/config";
import { createUser, getUserByName } from "../lib/db/queries/users";

export type CommandsRegistry = Record<string, CommandHandler>;

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

// if args is empty throw an error,
// login expects a single argument 'username'
// setUsername to the given argument
// Print a message to the terminal that user has been set;
export async function handlerLogin(
	cmdName: string,
	...args: string[]
): Promise<void> {
	if (args.length < 1) {
		throw new Error("Unable to login, no arguments received.");
	}

	if (args.length > 1) {
		throw new Error("Too many arguments passed to handerlogin.");
	}

	const username = args[0];
	//throw an error if the username doesn't exist in the database.

	const user = await getUserByName(username);
	if (!user) {
		throw new Error("User does not exist.");
	}

	setUser(username);
	console.log("Username has been set to:", username);
}

export async function handlerRegister(
	cmdName: string,
	...args: string[]
): Promise<void> {
	if (args.length < 1) {
		throw new Error("Unable to login, no arguments received.");
	}

	const usersName = args[0];

	const userByName = await getUserByName(usersName);
	if (userByName) {
		throw new Error("User with this name already exists.");
	}

	const user = await createUser(usersName);
	if (!user) {
		throw new Error("There was an error creating the user.");
	}

	setUser(user.name);
	console.log("User was created.");
	printUserInfo(user);
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
export async function runCommand(
	registry: CommandsRegistry,
	cmdName: string,
	...args: string[]
): Promise<void> {
	if (registry === null) {
		throw new Error("Registry not found.");
	}

	if (!registry[cmdName]) {
		throw new Error("Invalid command name.");
	}

	await registry[cmdName](cmdName, ...args);
}

function printUserInfo(user: {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}) {
	console.log(
		`User Id: ${user.id}\nName: ${user.name}\nCreated_at: ${user.createdAt}\nUpdated_at: ${user.updatedAt}`,
	);
}
