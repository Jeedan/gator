# gator

In this project we build an RSS feed aggregator in Typescript. We called it "Gator" because aggreGATOR. 

It is a CLI tool that allows users to:
- Add RSS feeds from across the internet to be collected 
- Store the collected posts in a PostgreSQL database
- Follow and unfollow RSS feeds that other users have added
- View summaries of the aggregated posts in the terminal, with a link to the full post

## Cloning the repo 

You can clone the repo with the following command
```bash
git clone https://github.com/github-username/gator
cd gator
```


## Set up

This project uses `22.15.0` version of node! For this we used NVM to manage the version but others work as well.
To get things running we'll need to also install npm and the dev dependencies. Run `npm install` in the root of your project.

You will also need to have Postgres installed:
WSL/Linux:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```
MacOS:
```
brew install postgresql@16
```

Make sure it works: with `psql --version`
On linux you will need to set a password: `sudo passwd postgres`

You will need to create a Database using psql:
- Start a Postgres server:
	- Mac: `brew services start postgresql@16`
	- Linux: `sudo service postgresql start`
- Enter the Shell:
	- Mac: `psql postgres`
	- Linux: `sudo -u postgres psql`
- Create a DB:
	- `CREATE DATABASE gator`
	- `\c gator`  connect to the database
	- for linux set a password: 
		- `ALTER USER postgres PASSWORD 'postgres';`
- Query the DB:
	- `SELECT version();`
- you can exit via typing `exit` or `\q` to leave the psql shell


## Database connection config file 
To use Drizzle for our postgres database we stored some database connection config in a file in our HOME directory in this project we named it thus: `~/.gatorconfig.json`.

In our project root folder we create a drizzle.config.ts file and pass the path of the config file to the `dbCredentials: {url: "config_path_here"}`

The config looks like this, the username will be set when the register command is used.  `~/.gatorconfig.json`.
Here is an example db connection url.
it follows this format: `postgres://username:password@host:5432/dbname`
```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator",
  "current_user_name": "username_goes_here"
}
```

## Drizzle generation and migration

Use `npx drizzle-kit generate` to generate our migration files, if we don't then our tables won't exist. 

Use `npx drizzle-kit migrate` to migrate the files.

Once migrations are done, start by registering a user with `npm run start register <username>`

## Commands

There are several commands you can use in the CLI here is an example of each one use `npm run start` then follow it with the command name and args:
- Login: `npm run start login <username>` ex: `npm run start login Jeedan`
	- sets the Username to be used when querying the Database
- Register: `npm run start register <username>`
	- registers a new user
- Reset: :`npm run start reset` 
	- resets the entire DB to start fresh 
- users: `npm run start users`
	- lists all users and also marks the current logged in user
- addfeed: `npm run start addfeed "Hacker News RSS" "https://hnrss.org/newest"`
	- adds a feed with a name and url to the DB and also sets the userId, creating a relation between user and feed
- feeds: `npm run start feeds`
	- lists all feeds in the db
- follow: `npm run start follow <feed_url>`
	- creates a feed follow, linking a user to a feed
- following: `npm run start following`
	- lists all feeds the current logged in user follows
- unfollow: `npm run start unfollow <feed_url>`
	- unfollows a feed
- agg: `npm run start agg <time>` example: like 1s, 1m, 1h
	- fetches feeds continuously after specified duration
	- use `ctrl+c` to exit
- browse: `npm run start browse <limit>`
	- lists posts of a feed 
	- posts are sorted by latest publish date
	- if no limit was passed it will only show 2 posts