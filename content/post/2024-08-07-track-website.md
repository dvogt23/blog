+++
title = "Track a website by diff and get notification"
date = 2024-08-07T10:52:58+02:00
description = "Get telegram bot notifications about changes on websites with diff included"
tags = [
    "web",
    "notification",
    "selfhost",
    "python",
    "telegram"
]
categories = [
    "Security",
]
+++

Some day, I needed to keep track of my daughter's schools wordPress page about news. As a software developer, I didn't want to check the website every day, so I decided to use a third-party service like Telegram to get notified whenever there were new updates.

My idea was to fetch the entire page's content and transform it into Markdown format, removing all HTML tags to leave only the readable content. Then, I would persist this cleaned-up content to a file, named after the URL (hashed), and diff this file every day when fetching new content.

After finish the Python script using the input parameter from an `.env` file as usual in an application environment. In order to gain access to our bot and determine the correct channel ID for sending notifications, we need to acquire some IDs from Telegram.

I finally containerized this service for easier deployment and notification of changes to sites I care about.

Here a preview how it looks like in telegram:

![preview diff](./images/preview_diff.png)

Source: [webdiffbot - Repository](https://github.com/dvogt23/webdiffbot)
