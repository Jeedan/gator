import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

// Array destructuring is used to get the first item from the returned array.
// This is because drizzle returns an array of results, even if there is only one result.
export async function createUser(name: string) {
	const [result] = await db.insert(users).values({ name: name }).returning();
	return result;
}

export async function getUserByName(name: string) {
	const [result] = await db.select().from(users).where(eq(users.name, name));
	return result;
}

export async function getUsers() {
	const result = await db.select().from(users);
	return result;
}

export async function truncateUsersTable() {
	await db.delete(users);
}
