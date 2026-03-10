import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds, users } from "../schema";

export type Feed = typeof feeds.$inferSelect; // feeds is the table object in schema.ts

export async function createFeed(name: string, url: string, userId: string) {
	const [result] = await db
		.insert(feeds)
		.values({ name: name, url: url, userId: userId })
		.returning();
	return result;
}

export async function getFeeds() {
	const result = await db.select().from(feeds);
	return result;
}
// inner join to also retrieve the User who created the feed
export async function getFeedsWithUser() {
	const result = await db
		.select()
		.from(feeds)
		.innerJoin(users, eq(users.id, feeds.userId));
	return result;
}
