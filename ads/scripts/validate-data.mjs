import { readFile } from 'node:fs/promises';

const articles = JSON.parse(await readFile(new URL('../src/data/articles.json', import.meta.url), 'utf8'));
const ads = JSON.parse(await readFile(new URL('../src/data/ads.json', import.meta.url), 'utf8'));

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(articles.length === 15, `Expected exactly 15 articles, received ${articles.length}.`);
assert(ads.length === 30, `Expected exactly 30 ads, received ${ads.length}.`);
assert(new Set(articles.map((article) => article.id)).size === articles.length, 'Article IDs must be unique.');
assert(new Set(articles.map((article) => article.slug)).size === articles.length, 'Article slugs must be unique.');
assert(new Set(ads.map((ad) => ad.id)).size === ads.length, 'Ad IDs must be unique.');

for (const article of articles) {
  const wordCount = article.body.split(/\s+/u).filter(Boolean).length;
  assert(wordCount >= 900 && wordCount <= 1800, `${article.id} must contain 900–1800 body words; received ${wordCount}.`);
  assert(article.tags.length >= 2 && article.tags.length <= 4, `${article.id} must contain 2–4 tags.`);
  assert(article.questions.length === 3, `${article.id} must contain exactly 3 questions.`);
  assert(new Set(article.questions.map((question) => question.id)).size === 3, `${article.id} question IDs must be unique.`);
  for (const question of article.questions) {
    assert(question.options.length >= 3 && question.options.length <= 4, `${question.id} must contain 3–4 options.`);
    assert(Number.isInteger(question.correct_index) && question.correct_index >= 0 && question.correct_index < question.options.length, `${question.id} has an invalid correct_index.`);
    assert(Boolean(question.explanation?.trim()), `${question.id} needs an explanation.`);
  }
}

for (const ad of ads) {
  for (const key of ['title', 'brand', 'category', 'thumbnail_url', 'mock_target_age_range', 'mock_target_gender']) {
    assert(Boolean(ad[key]), `${ad.id} is missing ${key}.`);
  }
  assert(Array.isArray(ad.mock_target_locations) && ad.mock_target_locations.length > 0, `${ad.id} needs target locations.`);
}

console.log(`Validated ${articles.length} articles, ${articles.length * 3} quiz questions and ${ads.length} ads.`);
