# Database migrations

The talent-matching schema is introduced by reviewed, additive SQL in `drizzle/`. Apply recorded migrations from the workspace root with:

```sh
pnpm --filter @workspace/db migrate
```

Do not use `push-force` against a database containing user data. Keep schema changes in a new numbered SQL migration and update the Drizzle schema exports in the same change.

The initial talent migration adds the IT role and skill catalog, student evidence, reviewed/versioned assessments, attempts and scores, match snapshots, consent records, and access auditing. It intentionally adds no assessment questions; an assessment is unavailable until reviewed question content is provided and published.

Migration `0001_application_integrity` adds a unique student/internship application constraint and ensures company assessment consent references an application belonging to the same student. It checks for existing duplicate applications or mismatched consent rows and fails without modifying those rows; resolve any reported data conflicts before retrying the migration.

Migration `0002_conventional_assessments` adds a pending-review state for assessments with subjective answers, reviewer attribution, and configurable match weights and eligibility criteria. It is additive and does not remove assessment or user data. Objective questions use reviewed answer keys; subjective questions use reviewed rubrics and human scoring. Apply it only through the normal migration process after reviewing the target database.

The original assessment-attempt migration includes an explanation-model metadata column. New application code no longer maps or reads it; it is left in place to preserve any historical values.
