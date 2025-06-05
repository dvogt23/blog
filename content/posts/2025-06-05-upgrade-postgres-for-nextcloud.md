---
title: "Upgrade postgres for nextcloud"
tags: ["nextcloud", "postgresql", "docker", "upgrade", "how-to"]
categories: ["self-hosted", "howto", "nextcloud"]
date: 2025-06-05T11:49:48+02:00
---

# Postgres upgrade for nextcloud

After realizing I'm using an old (v11) version of PostgreSQL for my nextcloud, I decide to upgrade this to a newer one, v15.
In the end, it wasn't that easy to do this, as many of the instructions sounded like: "just do a dump of your data and import them to the new version",
but it won't. So if you have a similar problem, I summarize my process here:

Just some of my errors I got:

```sh
[...]
FATAL:  password authentication failed for user "oc_admin"
User "nextcloud" does not have a valid SCRAM secret
[...]
```

## Prerequisites

- Docker and docker compose installed
- Access to your nextcloud and postgreSQL containers
- Backup storage for your database dumps and data directory

## Step-by-Step Upgrade Instructions

1. **Shut down all containers**

   Stop all running containers to prevent data changes during the upgrade:

   ```sh
   docker-compose down
   ```

1. **Start only the database container**

   Bring up just the PostgreSQL container so you can create backups:

   ```sh
   docker-compose up -d db
   ```

1. **Create a SQL dump backup**

   Dump your entire database to a file:

   ```sh
   docker exec --user postgres nextcloud-db pg_dump --dbname=postgresql://nextcloud:<password>@nextcloud-db/nextcloud -f /var/lib/postgres/nextcloud.sql
   ```

1. **Dump users and roles separately**

   It's a good practice to export users and roles:

   ```sh
   docker exec --user postgres nextcloud-db pg_dumpall -r --dbname=postgresql://nextcloud:<password>@nextcloud-db/nextcloud -f /var/lib/postgres/user_roles.sql
   ```

1. **Shut down the database container**

   ```sh
   docker-compose down
   ```

1. **Update postgreSQL version in docker compose**

   Edit your `docker-compose.yml` file and change the postgreSQL image tag to the desired new version, for example:

   ```yaml
   image: postgres:15
   ```

1. **Backup your old postgreSQL data directory**

   Before starting the new container, back up your existing data directory (usually mapped as a docker volume or local path):

   ```sh
   cp -r ./pg_data pg_data.old
   ```

1. **Start the new database container**

   ```sh
   docker-compose up -d db
   ```

1. **Drop and re-create a new nextcloud database**

   Connect to psql of your db

   ```sh
   docker exec -it --user postgres nextcloud-db psql --dbname=postgresql://nextcloud:<password>@nextcloud-db
   ```

   Inside the psql prompt, drop the existing database and create a new one:

   ```sql
   DROP DATABASE nextcloud;
   CREATE DATABASE nextcloud WITH OWNER nextcloud ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;
   ```

1. **Import users and roles**

   Restore the roles:

   ```sh
   docker exec --user postgres nextcloud-db psql --dbname=postgresql://nextcloud:<password>@nextcloud-db/nextcloud -f /var/lib/postgresql/data/user_roles.sql
   ```

1. **Import the data dump**

   Restore the database:

   ```sh
   docker exec --user postgres nextcloud-db psql --dbname=postgresql://nextcloud:<password>@nextcloud-db/nextcloud -f /var/lib/postgresql/data/nextcloud.sql
   ```

1. **Reset user passwords**

   Connect to PostgreSQL and reset passwords for your nextcloud users:

   ```sh
   docker exec -it --user postgres nextcloud-db psql --dbname=postgresql://nextcloud:<password>@nextcloud-db/nextcloud
   ```

   Inside psql run commands:

   ```sql
   nextcloud=# \password nextcloud
   nextcloud=# \password oc_admin
   ```

1. **Restart all docker containers**

   ```sh
   docker-compose restart
   ```

## Final Checks

- Verify nextcloud is running and can connect to the database.
- Check logs for any errors.
- Remove old backups if everything works as expected.

**Note:** The boilerplate instructions were generated with the assistance of a large language model (LLM).

Sources:

- [openenterprise.it](https://openterprise.it/2023/05/nextcloud-upgrading-postgresql-database-running-as-docker-container-between-major-versions/)
