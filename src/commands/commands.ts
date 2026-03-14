import { getCurrentUser, setUser } from "../config/config";
import {
	createUser,
	getUserByName,
	getUsers,
	truncateUsersTable,
	User,
} from "../lib/db/queries/users";
import {
	createFeed,
	Feed,
	getFeedByUrl,
	getFeedsWithUser,
} from "../lib/db/queries/feeds";
import {
	createFeedFollow,
	deleteFollowFeed,
	getFeedFollowsForUser,
} from "../lib/db/queries/feed-follows";
import { scrapeFeeds } from "../services/aggregateFeeds";
import { parseDuration } from "../utils/utils";
import { getPostsForUsers } from "src/lib/db/queries/posts";

export type CommandsRegistry = Record<string, CommandHandler>;

export type CommandHandler = (
	cmdName: string,
	...args: string[]
) => Promise<void>;

export type UserCommandHandler = (
	cmdName: string,
	user: User,
	...args: string[]
) => Promise<void>;

// if args is empty throw an error,
// login expects a single argument 'username'
// setUsername to the given argument
// Print a message to the terminal that user has been set;
export async function handlerLogin(
	cmdName: string,
	...args: string[]
): Promise<void> {
	if (args.length !== 1) {
		throw new Error(`usage: npm run start ${cmdName} <user_name>`);
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
	if (args.length !== 1) {
		throw new Error(`usage: npm run start ${cmdName} <user_name>`);
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
	if (args.length !== 1) {
		throw new Error(
			`usage: ${cmdName} <time_between_reqs("string like 1s, 1m, 1h")>`,
		);
	}
	const intervalArgs = args[0];
	//time_between_reqs is a duration string, like 1s, 1m, 1h,
	const timeBetweenRequests = parseDuration(intervalArgs);

	console.log(`Collecting feeds every: ${intervalArgs}`);
	scrapeFeeds().catch(handleError);

	const interval = setInterval(() => {
		console.log(`Collecting feeds every: ${intervalArgs}`);
		scrapeFeeds().catch(handleError);
	}, timeBetweenRequests);

	// clean up
	await new Promise<void>((resolve) => {
		process.on("SIGINT", () => {
			console.log("Shutting down feed aggregator...");
			clearInterval(interval);
			resolve();
		});
	});
}

async function handleError(err: unknown) {
	console.error(err);
}

export async function handlerBrowsePosts(
	cmdName: string,
	user: User,
	...args: string[]
) {
	if (args.length > 1) {
		throw new Error(`usage: ${cmdName} <browse> <optional_posts_limit>`);
	}

	const limit = args[0] ? parseInt(args[0]) : 2;
	const posts = await getPostsForUsers(user.id, limit);

	if (posts.length === 0)
		throw new Error(`No posts found by user: ${user.name}`);

	for (const post of posts) {
		console.log(`Feed: ${post.feedName}`);
		console.log(`Title: ${post.title}`);
		console.log(`Published At: ${post.publishedAt}`);
		console.log("\n");
	}
}

export async function handlerAddFeed(
	cmdName: string,
	user: User,
	...args: string[]
): Promise<void> {
	if (args.length !== 2) {
		throw new Error(`usage: ${cmdName} <feed_name> <feed_url>`);
	}

	const name = args[0];
	const url = args[1];
	//const user = await getLoggedInUser();
	const feed = await createFeed(name, url, user.id);
	const feedFollow = await createFeedFollow(user.id, feed.id);
	console.log(`Following feed: ${feedFollow.feedName}`);
	console.log(`User Name: ${feedFollow.userName}`);
	console.log(`Feed Name: ${feedFollow.feedName}`);
}

export async function handlerFeeds(
	cmdName: string,
	...args: string[]
): Promise<void> {
	if (args.length !== 0) {
		throw new Error(`usage: npm run start ${cmdName}`);
	}

	const feedsWithUserName = await getFeedsWithUser();
	if (feedsWithUserName.length === 0) throw new Error("No feeds found.");
	for (const { feeds: feed, users: user } of feedsWithUserName) {
		printFeed(feed, user);
	}
}

export async function handlerFollow(
	cmdName: string,
	user: User,
	...args: string[]
): Promise<void> {
	if (args.length !== 1) {
		throw new Error(`usage: ${cmdName} <feed_url>`);
	}

	const feedUrl = args[0];
	const feed = await getFeedByUrl(feedUrl);
	if (!feed) throw new Error(`No feed found with url: ${feedUrl}`);
	const feedFollow = await createFeedFollow(user.id, feed.id);

	console.log(`FeedFollow: ${feedFollow.feedName}`);
	console.log(`User Name: ${feedFollow.userName}`);
	console.log(`Feed Name: ${feedFollow.feedName}`);
}

export async function handlerFollowing(
	cmdName: string,
	user: User,
	...args: string[]
): Promise<void> {
	if (args.length > 0) {
		throw new Error("Too many arguments passed to feeds");
	}

	const feedFollows = await getFeedFollowsForUser(user.id);
	if (feedFollows.length === 0) {
		console.log(`No feed follows found for this user.`);
		return;
	}
	console.log(`${user.name} is following these feeds:`);
	for (const feed of feedFollows) {
		console.log(`Feed: ${feed.feedName}`);
	}
}

export async function handlerUnfollow(
	cmdName: string,
	user: User,
	...args: string[]
): Promise<void> {
	if (args.length !== 1) {
		throw new Error(`usage: ${cmdName} <feed_url>`);
	}

	const feedUrl = args[0];
	const deletedFeed = await deleteFollowFeed(user.id, feedUrl);
	if (!deletedFeed) throw new Error("There was no feed to unfollow.");
	console.log(`Successfully deleted feed: ${feedUrl}`);
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

function printUserInfo(user: User) {
	console.log(`User Id: ${user.id}`);
	console.log(`Name: ${user.name}`);
	console.log(`Created_at: ${user.createdAt}`);
	console.log(`Updated_at: ${user.updatedAt}`);
}

export function printFeed(feed: Feed, user: User) {
	//console.log(JSON.stringify(feed, null, 2));
	//console.log(JSON.stringify(user, null, 2));
	console.log(`Feed: ${feed.name} url: ${feed.url}`);
	console.log(`Feed created by: ${user.name}`);
}

export async function getLoggedInUser(): Promise<User> {
	const currentUser = await getCurrentUser();
	if (!currentUser) throw new Error("No current logged in user found");
	const user = await getUserByName(currentUser);
	if (!user) throw new Error("No user found");

	return user;
}
