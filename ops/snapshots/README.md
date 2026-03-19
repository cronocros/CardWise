# Snapshot Artifacts

Snapshot ID: `phase1-start-20260319`

## Files

- `phase1-start-20260319.meta.json`
- `phase1-start-20260319.docs.sha256.json`

## What It Captures

- Git baseline (`snapshot/phase1-start-20260319`)
- Integration branch baseline (`codex/integration-phase1`)
- Full docs checksum list (`docs/**`)
- Supabase linked migration state and schema count checks (`41 tables`, `26 enums`)

## Restore Guidance

- Code and docs: checkout the snapshot tag.
- DB schema: sync to the migration state recorded in snapshot metadata.
