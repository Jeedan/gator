import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
	channel: {
		title: string;
		link: string;
		description: string;
		items: RSSItem[];
	};
};

type RSSItem = {
	title: string;
	link: string;
	description: string;
	pubDate: string;
};

//  fast-xml-parser will be used to parse the XML data
// install it and its typescript types via:
//  npm i fast-xml-parser
export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
	// fetch the xml
	const response = await fetch(feedURL, {
		method: "GET",
		//mode: "same-origin",
		headers: {
			"User-Agent": "gator",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch feed: ${response.statusText}`);
	}

	const xmlData = await response.text();
	// parse the xml
	const parser = new XMLParser();
	const jsObjFeed = parser.parse(xmlData);

	// check if each field exists and is valid
	const channel = jsObjFeed?.rss?.channel;
	if (!channel) {
		throw new Error("Invalid RSS Feed: missing channel.");
	}

	const rssResult: RSSFeed = {
		channel: {
			title: channel?.title ?? "",
			link: channel?.link ?? "",
			description: channel?.description ?? "",
			items: parseRSSItems(channel.item),
		},
	};
	return rssResult;
}

function parseRSSItems(rawItems: any): RSSItem[] {
	const items: RSSItem[] = [];
	if (!rawItems) return items;

	// ensure we create an Array if channel.item wasn't
	const normalized = Array.isArray(rawItems) ? rawItems : [rawItems];
	for (const item of normalized) {
		if (item.title && item.link) {
			items.push({
				title: item.title,
				link: item.link,
				description: item.description || "",
				pubDate: item.pubDate || "",
			});
		}
	}

	return items;
}
