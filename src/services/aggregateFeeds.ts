import { getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds";
import { fetchFeed } from "./fetchFeed";

export async function scrapeFeeds() {
	// get next feed to fetch
	const nextFeed = await getNextFeedToFetch();
	if (!nextFeed) throw new Error(`There is no next feed to fetch`);
	console.log(`Fetching feed: ${nextFeed.url}`);
	await markFeedFetched(nextFeed.id);

	const feed = await fetchFeed(nextFeed.url);
	if (!feed.channel) {
		console.log("Invalid RSS feed format");
		return;
	}

	const feedItems = feed.channel.items;
	if (feedItems.length === 0) {
		console.log("No feed items found");
		return;
	}

	for (const item of feedItems) {
		console.log(`Title: ${item.title}`);
		console.log(`Link: ${item.link}`);
		console.log(`Description: ${item.description ?? ""}`);
		console.log(`Pub Date: ${item.pubDate ?? ""}`);
		console.log("\n");
	}
}
