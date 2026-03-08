type RSSFeed = {
	channel: {
		title: string;
		link: string;
		description: string;
		item: RSSItem[];
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
	// TODO

	const rssResult = {
		channel: { title: "", link: "", description: "", item: [] },
	};
	return rssResult;
}
