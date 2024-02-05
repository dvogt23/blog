+++
title = "Rails - drop database data"
description = "Drop database data, except some tables"
tags = [
    "ruby",
    "rails",
    "development",
    "programming",
]
date = 2024-01-30
categories = [
    "Development",
]
+++

If you want to drop your data in `rails` you do it usually with `bin/rails
db:drop` or `bin/rails db:schema:load`. But if you have a case, you need to keep
some data in different tables, you need to do it with a specific `Rake task`.

I had a case for a demo environment, where we are reseting all data every sunday
for presentations. But we have some tables with "static" calculation data for
different use-cases, that we need to skip in _**resetting**_ task and skip at
_**re-seeding**_ job.

For scheduling repeating jobs, I have [rufu-scheduler](https://github.com/jmettraux/rufus-scheduler) in the project, to run jobs on a specific timebase.

i.e. `rufus_scheduler.rb`

```ruby
scheduler.cron "0 0 * * 7" do # every 1.week, on: :sunday, at: "00:00"
    runner(ResetDemoData)
end
```

and within the job, just resetting data and skipping your tables where to keep
data.

```ruby
class ResetDemoData < ApplicationJob
  KEEP_MODELS = [
    MyInterestRate,
    YourInterestRate,
    TheirInterestRate,
    OurInterestRate,
  ].freeze

  def perform
    load_rake_tasks
    delete_all_data
    reseed_database
  end

  def load_rake_tasks
    Rails.application.load_tasks if Rake::Task.tasks.empty?
  end

  def delete_all_data
    conn = ActiveRecord::Base.connection

    conn.tables.excluding("schema_migrations").each do |t|
      next if KEEP_MODELS.map { |model| model.name.pluralize.underscore }.include? t

      conn.execute("TRUNCATE TABLE #{t} CASCADE")
      conn.reset_pk_sequence!(t) # reset pk counter (optional)
    end
  end

  def reseed_database
    Rake::Task["db:seed"].execute
  end
end
```

Now you are able to drop all your data except some tables you wanna keep.
