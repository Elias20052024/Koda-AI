# Database migrations

The talent-matching schema is introduced by reviewed, additive SQL in `drizzle/`. Apply recorded migrations from the workspace root with:

```sh
pnpm --filter @workspace/db migrate
```

Do not use `push-force` against a database containing user data. Keep schema changes in a new numbered SQL migration and update the Drizzle schema exports in the same change.

The initial talent migration adds the IT role and skill catalog, student evidence, reviewed/versioned assessments, attempts and scores, match snapshots, consent records, and access auditing. It intentionally adds no assessment questions; an assessment is unavailable until reviewed question content is provided and published.
