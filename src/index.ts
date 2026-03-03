import { exit } from "node:process";
import {
	CommandsRegistry,
	handlerLogin,
	registerCommand,
	runCommand,
} from "./commands";
import { readConfig, setUser } from "./config";

function main() {
	const cmdRegistry: CommandsRegistry = {};
	registerCommand(cmdRegistry, "login", handlerLogin);

	// use process.argv to get command-line args passed in by the user
	// remove any you don't need
	// slice the arguments
	// if there is less than 1 arguments PRINT an error
	// exit with code 1.
	// command name will be the third argument
	// index 3 and beyond will be arguments for the CommandHandler ...args
	const cmdNameIdx: number = 2;
	const commandAndArgs = process.argv.slice(cmdNameIdx);
	if (commandAndArgs.length < 1) {
		console.error("No command and arguments given");
		exit(1);
	}
	const cmdName = commandAndArgs[0];
	const cmdArgs = commandAndArgs.slice(1);

	try {
		runCommand(cmdRegistry, cmdName, ...cmdArgs);
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error(err.message);
			exit(1);
		}
		console.error("Something went wrong in runCommand: ", err);
		exit(1);
	}
}

function manualLogin() {
	console.log("Hello, world!");
	setUser("Jeedan");

	const config = readConfig();
	console.log("The config:", JSON.stringify(config, null, 2));
}

// ENTRY POINT
main();
