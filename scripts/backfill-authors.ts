// scripts/backfill-authors.ts
// One-time script to populate the `author` column for existing library entries.
// Run with: npx tsx scripts/backfill-authors.ts
//
// Safe to re-run — only processes entries where author IS NULL.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Jikan allows ~3 req/s. 400ms between calls keeps us well under that.
const DELAY_MS = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAuthor(malId: number): Promise<string | null> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga/${malId}`);

    if (res.status === 429) {
      // Rate limited — wait longer and signal the caller to retry
      console.warn(`  [${malId}] Rate limited, waiting 2s...`);
      await sleep(2000);
      return fetchAuthor(malId); // one retry
    }

    if (!res.ok) {
      console.warn(`  [${malId}] Jikan returned ${res.status}, skipping`);
      return null;
    }

    const data = await res.json();

    // Temporary: dump the raw shape so we can see what Jikan is actually returning
    console.log("  [DEBUG] raw response:", JSON.stringify(data).slice(0, 300));

    // authors is an array like [{ name: "Oda, Eiichiro", ... }]
    return data.data?.authors?.[0]?.name ?? null;
  } catch (err) {
    console.warn(`  [${malId}] Network error:`, err);
    return null;
  }
}

async function main() {
  // Only fetch entries that are missing an author — safe to re-run
  const entries = await prisma.mangaLibrary.findMany({
    where: { author: null },
    select: { id: true, malId: true, title: true },
  });

  console.log(`Found ${entries.length} entries without an author.\n`);

  if (entries.length === 0) {
    console.log("Nothing to backfill.");
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const entry of entries) {
    process.stdout.write(`Fetching [${entry.malId}] ${entry.title}... `);

    const author = await fetchAuthor(entry.malId);

    if (author) {
      await prisma.mangaLibrary.update({
        where: { id: entry.id },
        data: { author },
      });
      console.log(`→ "${author}"`);
      updated++;
    } else {
      console.log("→ no author found, skipped");
      skipped++;
    }

    // Respect Jikan's rate limit between every request
    await sleep(DELAY_MS);
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
