import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { getFeedByUrl } from "./feeds";

export async function createFeedFollow(userId: string, feedId: string) {
	const [newFeedFollow] = await db
		.insert(feedFollows)
		.values({ userId: userId, feedId: feedId })
		.returning();

	const [result] = await db
		.select({
			id: feedFollows.id,
			createdAt: feedFollows.createdAt,
			updatedAt: feedFollows.updatedAt,
			feedName: feeds.name,
			userName: users.name,
		})
		.from(feedFollows)
		.where(eq(feedFollows.id, newFeedFollow.id))
		.innerJoin(users, eq(feedFollows.userId, users.id))
		.innerJoin(feeds, eq(feedFollows.feedId, feeds.id));

	return result;
}

export async function getFeedFollowsForUser(userId: string) {
	const result = await db
		.select({
			id: feedFollows.id,
			feedName: feeds.name,
			userName: users.name,
		})
		.from(feedFollows)
		.where(eq(feedFollows.userId, userId))
		.innerJoin(users, eq(feedFollows.userId, users.id))
		.innerJoin(feeds, eq(feedFollows.feedId, feeds.id));

	return result;
}

export async function deleteFollowFeed(userId: string, url: string) {
	const feed = await getFeedByUrl(url);
	if (!feed) throw new Error(`No feed found with url: ${url}`);
	// delete by user and url
	const [result] = await db
		.delete(feedFollows)

		.where(
			and(
				eq(feedFollows.userId, userId),
				eq(feedFollows.feedId, feed.id),
			),
		)
		.returning();

	return result;
}
