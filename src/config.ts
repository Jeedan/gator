import fs from "fs";
import os from "os";
import path from "path";

type Config = {
	dbURL: string;
	currentUserName: string;
};

export function setUser(name: string) {
	// TODO
	// set the current_user_name field
	// write a Config object to JSON file
}

export function readConfig() {
	// read json file found at:
	// ~/.gatorconfig.json
	// read from HOME directory: os.homedir
	// decode to JSON string into a new Config object
	// return a Config object
}

// Helper functions
function getConfigFilePath(): string {
	// TODO
	return "test";
}

function writeConfig(cfg: Config): void {
	// TODO
}

// used by readConfig to validate the result of JSON.parse
// JSON.parse is typed as any because it can return any type of object.
// We need to validate the object to ensure it has the correct structure.
function validateConfig(rawConfig: any): Config {
	const cfg: Config = { dbURL: "", currentUserName: "" };
	return cfg;
}
