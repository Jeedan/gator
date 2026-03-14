import { desc, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, posts, users } from "../schema";

// create a posts with these fields from the feed
// title
// url
// description
// published at
// possible format
// Pub Date: Sat, 14 Mar 2026 17:40:26 +0000
export async function createPost(
	title: string,
	description: string,
	url: string,
	feedId: string,
	publishedAt: Date | null,
) {
	const [result] = await db
		.insert(posts)
		.values({
			title: title,
			description: description,
			url: url,
			feedId: feedId,
			publishedAt: publishedAt,
		})
		.returning();

	return result;
}

export async function getPostsForUsers(userId: string, limit: number = 2) {
	const result = await db
		.select({
			id: posts.id,
			feedName: feeds.name,
			title: posts.title,
			publishedAt: posts.publishedAt,
		})
		.from(posts)
		.innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
		.innerJoin(feeds, eq(posts.feedId, feeds.id))
		.where(eq(feedFollows.userId, userId))
		.orderBy(desc(posts.publishedAt))
		.limit(limit);
	return result;
}
