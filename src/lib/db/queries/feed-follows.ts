import { eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";

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

// TODO
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
