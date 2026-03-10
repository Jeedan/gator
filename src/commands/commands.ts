import { fetchFeed } from "src/services/fetchFeed";
import { getCurrentUser, setUser } from "../config/config";
import {
	createUser,
	getUserById,
	getUserByName,
	getUsers,
	truncateUsersTable,
	User,
} from "../lib/db/queries/users";
import {
	createFeed,
	Feed,
	getFeeds,
	getFeedsWithUser,
} from "src/lib/db/queries/feeds";

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
		// console.log("User with this name already exists.");
		// return;
	}

	const user = await createUser(usersName);
	if (!user) {
		throw new Error("There was an error creating the user.");
	}

	setUser(user.name);
	console.log("User was created.");
	printUserInfo(user);
}

// print format
// * lane
// * allan (current)
// * hunter
export async function handlerUsers(
	cmdName: string,
	...args: string[]
): Promise<void> {
	const users = await getUsers();
	if (!users) {
		throw new Error("Users could not be found.");
	}
	const loggedInUser = await getCurrentUser();
	for (const user of users) {
		const suffix = user.name === loggedInUser ? " (current)" : "";
		console.log(`* ${user.name}${suffix}`);
	}
}

export async function handlerAgg(
	cmdName: string,
	...args: string[]
): Promise<void> {
	const response = await fetchFeed("https://www.wagslane.dev/index.xml");

	console.log(JSON.stringify(response, null, 2));
}

export async function handlerAddFeed(
	cmdName: string,
	...args: string[]
): Promise<void> {
	if (args.length < 2) {
		throw new Error("Unable to add feed, no arguments received.");
	}

	if (args.length > 2) {
		throw new Error("Too many arguments passed to addFeed.");
	}

	const name = args[0];
	const url = args[1];
	const user = await getLoggedInUser();
	const feed = await createFeed(name, url, user.id);
	printFeed(feed, user);
}

export async function handlerFeeds(
	cmdName: string,
	...args: string[]
): Promise<void> {
	if (args.length > 0) {
		throw new Error("Too many arguments passed to feeds");
	}

	const feedsWithUserName = await getFeedsWithUser();
	if (feedsWithUserName.length === 0) throw new Error("No feeds found.");
	for (const { feeds: feed, users: user } of feedsWithUserName) {
		printFeed(feed, user);
	}
}

export async function handlerReset(
	cmdName: string,
	...args: string[]
): Promise<void> {
	await truncateUsersTable();
	console.log("Successfully reset users database");
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

export function printFeed(feed: Feed, user: User) {
	//console.log(JSON.stringify(feed, null, 2));
	//console.log(JSON.stringify(user, null, 2));
	console.log(`Feed: ${feed.name} url: ${feed.url}`);
	console.log(`Feed created by: ${user.name}`);
}

async function getLoggedInUser(): Promise<User> {
	const currentUser = await getCurrentUser();
	if (!currentUser) throw new Error("No current logged in user found");
	const user = await getUserByName(currentUser);
	if (!user) throw new Error("No user found");

	return user;
}
