# CardWise Supabase Seeds

This folder contains idempotent MVP seed artifacts for the current Supabase schema.

## Files

- `cardwise_mvp_seed.sql`: realistic seed data for cards, benefits, vouchers, accounts, ledger, and inbox flows.
- `seed-metadata.json`: mapping metadata that links seed bundles to `feature_refs`, `requirement_refs`, and `api_refs`.

## Run

From the repository root:

```bash
npx supabase db query --linked -f supabase/seeds/cardwise_mvp_seed.sql
```

Notes:

- The command targets the linked Supabase project.
- The SQL is idempotent and can be re-run safely.
- No schema changes are included here.

## Purpose

The seed set is designed to validate the current MVP flows:

- card catalog and performance rules
- voucher unlock conditions
- manual ledger entry and inbox actions
- payment adjustment and exclusion handling
- user performance and voucher state

