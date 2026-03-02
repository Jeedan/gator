import { readConfig, setUser } from "./config";

function main() {
	console.log("Hello, world!");
	setUser("Jeedan");
	const config = readConfig();
	console.log("The config:", JSON.stringify(config, null, 2));
}

main();
