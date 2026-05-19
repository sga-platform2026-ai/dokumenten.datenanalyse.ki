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

test("applyNormalizedArticlesToAnalysis parses articleReviews JSON", () => {
  const raw = `5.2. Verletzte Artikel
<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"7-2","violated":true,"reason":"Anrede"},{"id":"27","violated":true,"reason":"Ehre"},{"id":"1","violated":false}]}<!--/GA_IV_ARTICLES-->`;

  const result = applyNormalizedArticlesToAnalysis(raw);
  assert.equal(result.articles.length, 2);
  assert.equal(result.articles[0].id, "7-2");
  assert.equal(result.articles[1].id, "27");
  assert.equal(result.jsonValid, true);
  assert.equal(result.hasJsonEnd, true);
});

test("articleReviews mit violated:true ohne reason bleibt erhalten (Fallback)", () => {
  const raw = `<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"7-2","violated":true},{"id":"27","violated":true,"reason":"konkret"}]}<!--/GA_IV_ARTICLES-->`;

  const { articles } = applyNormalizedArticlesToAnalysis(raw);
  assert.equal(articles.length, 2);
  assert.equal(articles[0].id, "7-2");
  assert.ok(articles[0].reason.length > 0);
});

test("abgeschnittenes JSON ohne End-Marker wird rekonstruiert", () => {
  const raw = `5.2. Verletzte Artikel
<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"7-2","violated":true,"reason":"Anrede"},{"id":"27","violated":true,"reason":"Ehre"}]}`;

  const result = applyNormalizedArticlesToAnalysis(raw);
  assert.equal(result.jsonRecovered, true);
  assert.equal(result.articles.length, 2);
});

test("applyNormalizedArticlesToAnalysis parses multiline prose reasons", () => {
  const raw = `5.2. Verletzte Artikel des IV. Genfer Abkommens
Artikel 7 Abs. 2 GA IV
Begründung mit Bezug zum Schreiben: Anrede Herr Günzel
Artikel 27 GA IV – Eingriff in die Ehre`;

  const { articles } = applyNormalizedArticlesToAnalysis(raw);
  assert.equal(articles.length, 2);
  assert.ok(articles[0].reason.includes("Anrede"));
  assert.equal(articles[1].id, "27");
});

test("prose pending behält Artikel mit Fallback-Begründung", () => {
  const raw = `5.2. Verletzte Artikel des IV. Genfer Abkommens
Artikel 7 Abs. 2 GA IV
Artikel 27 GA IV – konkret`;

  const { articles } = applyNormalizedArticlesToAnalysis(raw);
  assert.equal(articles.length, 2);
});

test("articleReviews mit affected:true ergeben separate affected-Liste", () => {
  const raw = `5.2. Verletzte Artikel
<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"7-2","violated":true,"reason":"Anrede"},{"id":"1","violated":false,"affected":true,"reason":"Allgemeine Schutzpflicht"},{"id":"4","violated":false,"affected":true,"reason":"Zivilpersonenstatus"},{"id":"27","violated":false,"affected":false}]}<!--/GA_IV_ARTICLES-->`;

  const result = applyNormalizedArticlesToAnalysis(raw);
  assert.equal(result.articles.length, 1, "nur violated=true zählt als Verstoß");
  assert.equal(result.articles[0].id, "7-2");
  assert.equal(result.affected.length, 2, "affected enthält Art. 1 und 4");
  assert.equal(result.affected[0].id, "1");
  assert.equal(result.affected[1].id, "4");
  assert.equal(result.affectedCount, 2);
});

test("affected schließt bereits violated Artikel aus", () => {
  const raw = `<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"27","violated":true,"reason":"konkret"}],"potentiallyAffected":[{"id":"27","note":"doppelt"},{"id":"1","note":"allg."}]}<!--/GA_IV_ARTICLES-->`;

  const result = applyNormalizedArticlesToAnalysis(raw);
  assert.equal(result.articles.length, 1);
  assert.equal(result.affected.length, 1);
  assert.equal(result.affected[0].id, "1");
});
