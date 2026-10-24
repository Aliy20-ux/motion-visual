# Client agreements

Send a Project Agreement, Change Request or Completion Sign-off from the
website, and the client reads and signs it in the browser. Both sides get the
signed copy by email.

- **Team studio:** `motion-visual.com/studio` — sign in with your CRM login.
- **Client page:** `motion-visual.com/agreement/<private link>` — sent by email.
- **Public policy:** `motion-visual.com/cancellation`.

## How it works

1. **Studio → New agreement.** Pick the type, the client (or a CRM client),
   list what's included and not included, set the price and payments. The
   right-hand pane is exactly what the client will see.
2. **Save draft → Send to client.** The client gets an email with a private
   link. Sending locks the wording.
3. **Client reads and signs.** Each clause has a plain-English note. They tick
   the confirmations, type their name and sign. Consumers also choose whether
   you start now or after their 14-day cancellation period.
4. **Signed.** The client and `admin.team@` both get the full signed copy
   (terms, policy, signature record) by email. The studio shows the audit
   trail: sent, opened (with IP/device), questions, signed.

For a site you've **already built** and shown the client on a preview link,
choose **Ready-made site** on the Project Agreement and paste the preview link:
the agreement switches to one round of changes, changes within 5 working days,
balance within 7 days of sharing the finished site, live within 3 working days
of payment, and a deposit that's only refundable before you start their changes.

**Standard payments:** the studio's "25% deposit + balance" button sets the
deposit to exactly 25% of the total
(`depositPence` in `src/legal/format.ts`), with the balance due within 7 days of
sharing the finished site. The 14-day delivery clock starts once you have the
client's signed agreement and their content.

Use a **Change Request** for anything extra on an existing project — like a
booking system added after launch — and a **Completion Sign-off** at handover.

### What makes it hold up

- **Exact document, fingerprinted.** The agreement is stored as a snapshot and
  hashed (SHA-256) by the database. The client signs that hash; if the
  document changed after they opened it, signing is refused.
- **Signed means permanent.** A database trigger blocks any edit, void or
  delete of a signed agreement — even by the team.
- **Evidence.** Time, IP address, device, typed name and every confirmation
  ticked are recorded, plus every time the link was opened.
- **Consumer law built in.** Choosing "Consumer" adds the 14-day cancellation
  right (from signing), the model cancellation form and the "when should we
  start?" choice required by the Consumer Contracts Regulations 2013. If they
  ask us to start and then cancel inside the 14 days they pay only a
  proportionate amount, never more than the price; the right is lost only if the
  work is fully delivered in that period after their express request. The staged
  percentages apply only after the 14 days, capped at the value of work done.
  Consumers also get consumer-safe liability wording instead of the business cap.
- **Business clients** (including sole traders buying for their business) get the
  cancellation stages: deposit refunded before we begin, deposit kept once work
  has started, 40% once the design direction is shared, 70% once the build is
  underway, 100% once the finished site is shared, and a full refund if we cancel
  or can't deliver.
- **No interest, ever.** Late payment has no interest or late fees — the remedies
  are pausing work (and a hosted live site after 7 days' notice) and keeping
  ownership until paid in full. Have a solicitor confirm this holds for business
  clients under the Late Payment of Commercial Debts (Interest) Act 1998.
- **Scope lock.** Clients must confirm that only the "Included" list is
  covered, and that anything else needs a signed Change Request.

## One-time setup (before first use)

1. **Apply the migration** `supabase/migrations/20261015120000_add_client_agreements.sql`
   to the `motionvisual-admin` Supabase project.
2. **Create the server key** and store its hash in Supabase Vault:
   ```bash
   KEY=$(openssl rand -hex 32)
   HASH=$(printf %s "$KEY" | shasum -a 256 | cut -d' ' -f1)
   ```
   ```sql
   select vault.create_secret('<HASH>', 'agreements_server_key_sha256',
     'SHA-256 of the motion-visual Pages secret AGREEMENTS_SERVER_KEY');
   ```
3. **Give the website the key:**
   `printf %s "$KEY" | npx wrangler pages secret put AGREEMENTS_SERVER_KEY --project-name motion-visual`
4. **Build and deploy** as usual (see CLAUDE.md).

Until steps 1–3 are done, the client page shows "Online signing isn't
available right now".

To rotate the key: repeat steps 2–3 (update the vault secret with
`vault.update_secret`).

## Where the words live

| What | File |
|---|---|
| Company name, number, office, VAT | `src/legal/company.ts` |
| Cancellation & Refund Policy | `src/legal/policy.ts` |
| Agreement terms | `src/legal/terms.ts` |
| Consents and consumer start choice | `src/legal/buildDocument.ts` |

Changing these affects **new** agreements only — anything already sent or
signed keeps the exact wording it was sent with. Bump `POLICY_VERSION` in
`policy.ts` when the wording changes.

> These documents were drafted for a Scottish company working with UK
> clients. Have a Scottish solicitor review them once before relying on them.
