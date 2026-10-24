# Client reviews

A finished project gets a private review link. It goes out on the final invoice. The client gives 1 to 5 stars and a few
words at `motion-visual.com/review/<link>`, a founder approves it in the admin, and approved reviews appear on the home page.

## How it works

1. **Project reaches Launch or Live.** In the admin, open the project and press **Create review link**, or open the project's
   invoice: it makes the link itself and prints it in a "How did we do?" box. (The link also appears in Reviews under
   "Review links with no review yet".)
2. **Client leaves a review.** Stars (required), words (optional), their name, and a tick to say we may show it. The link works
   once and expires after 90 days (pressing Create again gives an unused link fresh time).
3. **Team is emailed** to `admin.team@` with the stars and words.
4. **Founder approves or hides it** in the admin under Reviews. Only reviews the client agreed to show can be approved. We never
   edit the words. We only hold back anything abusive, spam or about the wrong business.
5. **Home page** shows approved reviews. The section does not exist on the page until there is at least one, so there are no
   placeholders.

## Google

Google does not let anyone post a review on a customer's behalf: it must come from the customer's own Google account. So after
sending their review, the client is offered a button that opens your Google review form, plus a "Copy my review" button.

- **Everyone gets the same Google link, whatever their star rating.** Sending only happy customers there ("review gating")
  breaks Google's rules and, in the UK, the rules on fake and misleading reviews. Do not change this.
- Set the link in the admin under **Reviews → Google review link**. In Google Business Profile, open **Get more reviews** and
  copy the short link (`https://g.page/r/.../review`). Until it is set, clients just see a thank-you screen.
- Do not give clients anything in return for a review (discounts, free work). The message the admin copies makes no offers.
- Bringing your Google reviews onto the website needs your Google Business Profile place ID and a Places API key; see
  "Not built yet" below.

## One-time setup

1. Run `supabase/migrations/20261024160000_reviews.sql` (same file as `sql/6-website-reviews.sql` in the setup folder) in the
   Supabase SQL editor. It reuses the agreements server key, so there is no new secret.
2. Merge the website and admin changes. In the admin, set the Google review link.
3. To undo: `supabase/rollbacks/20261024160000_reviews.down.sql` (deletes all reviews: export first).

## Not built yet

- **Importing Google reviews onto the website.** Google's Places API returns only a handful of "most relevant" reviews, and the
  fuller Business Profile API needs Google's approval. It needs: your Google Business Profile place ID (saved under
  `google_place_id` in `review_settings`, ready for it), and a Places API key stored as a Pages secret.
- **No star rating in Google search results.** Google does not show rich-result stars for reviews a business collects about
  itself on its own site, so no `aggregateRating` markup is added.
