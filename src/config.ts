import fs from "fs";
import os from "os";
import path from "path";

type Config = {
	dbUrl: string;
	currentUserName: string;
};

export function setUser(name: string) {
	const cfg: Config = readConfig();
	cfg.currentUserName = name;
	writeConfig(cfg);
}
// read json file found at:
// ~/.gatorconfig.json
// read from HOME directory: os.homedir
// validate the raw config string into a new Config object
// return a Config object
export function readConfig(): Config {
	try {
		const cfgPath = getConfigFilePath();
		const rawConfig = fs.readFileSync(cfgPath, { encoding: "utf-8" });
		const cfg: Config = validateConfig(rawConfig);
		return cfg;
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error("Could not read from file: ", err.message);
			throw err;
		} else {
			console.error("Could not read from file: ", err);
			throw new Error("Unknown error while reading config");
		}
	}
}

// Helper functions
function getConfigFilePath(): string {
	const homeDir = os.homedir();
	const fullPath = path.join(homeDir, ".gatorconfig.json");
	if (!fs.existsSync(fullPath)) throw new Error("The File does not exist");
	return fullPath;
}

// used by readConfig to validate the result of JSON.parse
// JSON.parse is typed as any because it can return any type of object.
// We need to validate the object to ensure it has the correct structure.
function validateConfig(rawConfig: any): Config {
	const decoded = JSON.parse(rawConfig);
	console.log(`validateConfig decoded: ${JSON.stringify(decoded)}`);

	const invalidConfigObject =
		decoded === null ||
		typeof decoded !== "object" ||
		Array.isArray(decoded);

	if (invalidConfigObject)
		throw new Error(
			"The rawConfig was either null, an array or not an object.",
		);

	const db_Url = decoded.db_url;
	let current_User_Name = decoded.current_user_name;
	const invalidDBURL = typeof db_Url !== "string" || db_Url === "";
	const invalidCurrentUserName = typeof current_User_Name !== "string";

	if (invalidDBURL)
		throw new Error("db_url was either empty or not a valid string.");

	if (invalidCurrentUserName)
		throw new Error("User name was not a valid string.");

	if (current_User_Name === "") current_User_Name = "username_goes_here";

	const cfg: Config = { dbUrl: db_Url, currentUserName: current_User_Name };
	return cfg;
}

function writeConfig(cfg: Config): void {
	try {
		const cfgPath = getConfigFilePath();
		const cfgString = JSON.stringify(
			{
				db_url: cfg.dbUrl,
				current_user_name: cfg.currentUserName,
			},
			null,
			2,
		);
		fs.writeFileSync(cfgPath, cfgString, { encoding: "utf-8" });
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error("Could not write to file: ", err.message);
			throw err;
		} else {
			console.error("Could not write to file: ", err);
			throw new Error("Unknown error while writing config file");
		}
	}
}
