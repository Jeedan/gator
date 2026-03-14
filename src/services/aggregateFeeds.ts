import { createPost } from "../lib/db/queries/posts";
import { getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds";
import { fetchFeed } from "./fetchFeed";
import { parseDate } from "../utils/utils";

export async function scrapeFeeds() {
	// get next feed to fetch
	const nextFeed = await getNextFeedToFetch();
	if (!nextFeed) throw new Error(`There is no next feed to fetch`);
	console.log(`Fetching feed: ${nextFeed.url}`);
	await markFeedFetched(nextFeed.id);

	const rssFeed = await fetchFeed(nextFeed.url);
	if (!rssFeed.channel) {
		console.log("Invalid RSS feed format");
		return;
	}

	const rssFeedItems = rssFeed.channel.items;
	if (rssFeedItems.length === 0) {
		console.log("No feed items found");
		return;
	}

	for (const item of rssFeedItems) {
		printRSSItem(item);
		try {
			const post = await createPost(
				item.title,
				item.description,
				item.link,
				nextFeed.id,
				parseDate(item.pubDate),
			);

			console.log(`Successfully created post.`);
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.error(`Could not create post`, err.message);
				continue;
			}
			console.error(err);
			return;
		}
	}
}

// TODO
// should be RSSItem instead of any.
function printRSSItem(item: any) {
	console.log(`Title: ${item.title}`);
	console.log(`Link: ${item.link}`);
	console.log(`Description: ${item.description ?? ""}`);
	console.log(`Pub Date: ${item.pubDate ?? ""}`);
	console.log("\n");
}
