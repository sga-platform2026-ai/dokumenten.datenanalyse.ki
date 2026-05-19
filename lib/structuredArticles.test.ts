import assert from "node:assert/strict";
import test from "node:test";
import {
  applyNormalizedArticlesToAnalysis,
  buildArticlesJsonBlock,
  normalizeViolatedArticles,
} from "@/lib/structuredArticles";

test("normalizeViolatedArticles deduplicates by id and sorts canonically", () => {
  const result = normalizeViolatedArticles([
    { id: "101", reason: "B" },
    { id: "7-2", reason: "A" },
    { id: "7-2", reason: "A länger" },
    { id: "Artikel 27 GA IV", reason: "C" },
  ]);

  assert.equal(result.length, 3);
  assert.equal(result[0].id, "7-2");
  assert.equal(result[1].id, "27");
  assert.equal(result[2].id, "101");
  assert.equal(result[0].reason, "A länger");
});

test("applyNormalizedArticlesToAnalysis merges JSON and prose", () => {
  const json = buildArticlesJsonBlock(
    normalizeViolatedArticles([{ id: "7-2", reason: "Anrede" }]),
  );

  const raw = `5.2. Verletzte Artikel des IV. Genfer Abkommens
Artikel 27 GA IV – Ehre verletzt
${json}`;

  const { displayAnalysis, articles } = applyNormalizedArticlesToAnalysis(raw);
  assert.equal(articles.length, 2);
  assert.equal(articles[0].id, "7-2");
  assert.equal(articles[1].id, "27");
  assert.ok(!displayAnalysis.includes("GA_IV_ARTICLES"));
});
