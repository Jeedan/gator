import { exit } from "node:process";
import {
	CommandsRegistry,
	handlerLogin,
	handlerRegister,
	registerCommand,
	runCommand,
} from "./commands/commands";

async function main(): Promise<void> {
	const cmdRegistry: CommandsRegistry = {};
	registerCommand(cmdRegistry, "register", handlerRegister);
	registerCommand(cmdRegistry, "login", handlerLogin);

	const cmdName = sliceCmdArgs()[0];
	const cmdArgs = sliceCmdArgs().slice(1);
	try {
		await runCommand(cmdRegistry, cmdName, ...cmdArgs);
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error(err.message);
		} else {
			console.error("Something went wrong in runCommand: ", err);
		}
		exit(1);
	}
	exit(0);
}
// use process.argv to get command-line args passed in by the user
// remove any you don't need
// slice the arguments
// if there is less than 1 arguments PRINT an error
// exit with code 1.
// command name will be the third argument
// index 3 and beyond will be arguments for the CommandHandler ...args
function sliceCmdArgs(): string[] {
	const cmdNameIdx = 2;
	const commandAndArgs = process.argv.slice(cmdNameIdx);
	if (commandAndArgs.length < 1) {
		console.error("No command and arguments given");
		exit(1);
	}

	return commandAndArgs;
}

// ENTRY POINT
main();
