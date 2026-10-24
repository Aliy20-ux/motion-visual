# Client project tracker

A private page at `motion-visual.com/project/<link>` that shows a client where their project is: "Day 6 of 14", the stage
(Discovery, Design, Build, Client Review, Launch, Live), what has been signed and received, what is waiting on them, and a short
note from the team. No login. Nothing internal is shown: no emails, prices or task names.

## How the 14 days are counted

Day 0 is the later of the date the Project Agreement was signed and the date the client's content arrived, the same rule as the
agreement itself. The page shows "Your 14 days haven't started yet" and says what's missing until both are in. A project with no
agreement on file starts from the content date alone. The first-design date counts Monday to Friday (bank holidays aren't known), so
it is shown as a target.

## Using it (admin)

Open a project in the admin: the **Client tracker** card creates the link, lets you copy it or a ready-written message, set the date
the content arrived, and write a short note the client sees.

## One-time setup

Run `supabase/migrations/20261025100000_project_tracker.sql` (also `sql/9-website-project-tracker.sql` in the setup folder). It needs
the deal-automation script (it adds `projects.agreement_id`). Run `sql/6` (reviews) first if you want the "Tell us how we did" link to
appear once a project is live. No new secret: it uses the agreements server key.
