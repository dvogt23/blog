#!/usr/bin/env bash

set -e

cursor_file="./mastodon-post-cursor"

mastodon-markdown-archive \
  --user=https://mas.to/@dima23 \
  --dist=./content/toots/ \
  --threaded=true \
  --exclude-replies=true \
  --exclude-reblogs=true \
  --persist-first=./mastodon-post-cursor \
  --since-id=$(test -f $cursor_file && cat $cursor_file || echo "") \
  --limit=40 \
  --download-media=bundle \
  --visibility=public
