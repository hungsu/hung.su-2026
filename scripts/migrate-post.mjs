#!/usr/bin/env node
// @ts-check
/**
 * Convert a Digital Garden (Obsidian) note into this site's blog content
 * collection format (src/content/blog/*.md).
 *
 * This is a best-effort helper for the bulk migration: it handles the
 * mechanical syntax/frontmatter conversion, and leaves TODO comments for
 * anything that needs a human decision (missing images, links to notes
 * that haven't been migrated yet, etc).
 *
 * Usage:
 *   node scripts/migrate-post.mjs <path-to-source.md> [output-slug]
 *
 * Example:
 *   node scripts/migrate-post.mjs \
 *     "/tmp/digital_garden/src/site/notes/blog/My experience with Ubuntu in 2020.md"
 *
 * What it does:
 *  - Parses Digital Garden's JSON frontmatter (the `{"dg-publish":true,...}`
 *    block) and maps it to this site's frontmatter schema
 *    (title, description, pubDate, updatedDate, heroImage).
 *  - Derives the output filename/slug from the `permalink` frontmatter field
 *    (e.g. "/blog/my-post/" -> "my-post.md"), falling back to a slugified
 *    version of the source filename.
 *  - Strips the leading `# Title` heading (becomes frontmatter `title`).
 *  - Converts Obsidian wikilinks `[[Page|Label]]` / `[[Page]]`:
 *      - If the link looks like it points at a post being migrated
 *        (i.e. lives in `notes/blog/`), rewrites it to a relative
 *        `/blog/<slug>/` link.
 *      - Otherwise, replaces it with plain text (the label, or page name)
 *        and leaves a `<!-- TODO: unresolved wikilink -->` comment so a
 *        human can decide whether to link, inline, or drop it.
 *  - Converts Obsidian image embeds `![[Embeds/foo.jpg]]` and plain
 *    `![alt](/img/user/...)` images to standard markdown image syntax
 *    pointing at `../../assets/blog/<slug>/<file>`, and copies the
 *    referenced image (if found) into that assets folder.
 *  - Leaves callouts (`> [!quote] ...`) and inline HTML as-is; both render
 *    fine in Astro markdown, but callouts will lose their Obsidian styling
 *    (worth a follow-up component if used often).
 *
 * What it intentionally does NOT do:
 *  - Rewrite prose/content - only syntax & frontmatter are converted.
 *  - Resolve dataview queries - these are flagged with a TODO comment.
 *  - Guess a `description` if Digital Garden didn't provide one - falls back
 *    to the post title, and leaves a TODO to write a better one.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const GARDEN_ROOT = '/tmp/digital_garden';
const IMG_ROOT = join(GARDEN_ROOT, 'src/site/img/user');
const NOTES_ROOT = join(GARDEN_ROOT, 'src/site/notes');

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = join(REPO_ROOT, 'src/content/blog');
const ASSETS_DIR = join(REPO_ROOT, 'src/assets/blog');

function slugify(str) {
	return str
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Parse Digital Garden's JSON-style frontmatter block. */
function parseFrontmatter(raw) {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { data: {}, body: raw };
	const body = raw.slice(match[0].length);
	let data = {};
	try {
		data = JSON.parse(match[1]);
	} catch {
		// Not JSON frontmatter - leave data empty, caller can fall back.
	}
	return { data, body };
}

/** Find an image anywhere under src/site/img/user, case/space-insensitive-ish. */
function findImage(filename) {
	const direct = join(IMG_ROOT, filename);
	if (existsSync(direct)) return direct;
	const embeds = join(IMG_ROOT, 'Embeds', basename(filename));
	if (existsSync(embeds)) return embeds;
	const directBase = join(IMG_ROOT, basename(filename));
	if (existsSync(directBase)) return directBase;
	return null;
}

/** Slug for a wikilink target, used to detect "is this a migrated blog post?". */
function wikilinkToBlogSlug(target) {
	// e.g. "blog/My post title" -> "my-post-title"
	const m = target.match(/^blog\/(.+)$/i);
	if (!m) return null;
	return slugify(m[1]);
}

function convertBody(body, { slug, todos }) {
	let out = body;

	// Strip a single leading "# Title" heading (becomes frontmatter title).
	out = out.replace(/^\s*#\s+.+\n+/, '');

	// Image embeds: ![[Embeds/Foo Bar.jpg]] or ![[Foo Bar.jpg]]
	out = out.replace(/!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_m, target, alias) => {
		target = target.replace(/\\$/, '');
		const src = findImage(target.trim());
		const filename = basename(target.trim());
		const destName = slugify(filename.replace(/\.[^.]+$/, '')) + (filename.match(/\.[^.]+$/)?.[0] ?? '');
		if (src) {
			const destDir = join(ASSETS_DIR, slug);
			mkdirSync(destDir, { recursive: true });
			copyFileSync(src, join(destDir, destName));
			const alt = alias ?? filename.replace(/\.[^.]+$/, '');
			return `![${alt}](../../assets/blog/${slug}/${destName})`;
		}
		todos.push(`image embed "${target}" could not be found under src/site/img/user - left as a TODO comment`);
		return `<!-- TODO: image embed "${target}" not found, please add manually -->`;
	});

	// Plain markdown images pointing at /img/user/... -> copy + relative path.
	out = out.replace(/!\[([^\]]*)\]\(\/img\/user\/([^)]+)\)/g, (_m, alt, encodedPath) => {
		const decoded = decodeURIComponent(encodedPath);
		const src = findImage(decoded);
		const filename = basename(decoded);
		const destName = slugify(filename.replace(/\.[^.]+$/, '')) + (filename.match(/\.[^.]+$/)?.[0] ?? '');
		if (src) {
			const destDir = join(ASSETS_DIR, slug);
			mkdirSync(destDir, { recursive: true });
			copyFileSync(src, join(destDir, destName));
			return `![${alt}](../../assets/blog/${slug}/${destName})`;
		}
		todos.push(`image "${decoded}" could not be found under src/site/img/user - left as a TODO comment`);
		return `<!-- TODO: image "${decoded}" not found, please add manually -->`;
	});

	// Wikilinks: [[Target|Label]] or [[Target]]
	out = out.replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_m, target, alias) => {
		// Obsidian escapes the pipe as "\|" before an alias, which leaves a
		// trailing backslash on the target capture - strip it.
		target = target.replace(/\\$/, '');
		const label = (alias ?? target).trim();
		const blogSlug = wikilinkToBlogSlug(target.trim());
		if (blogSlug) {
			return `[${label}](/blog/${blogSlug}/)`;
		}
		todos.push(`wikilink to "${target.trim()}" -> replaced with plain text "${label}" (target not migrated yet)`);
		return label;
	});

	// Dataview code blocks - can't be converted automatically.
	out = out.replace(/```dataview[\s\S]*?```/g, (m) => {
		todos.push('dataview query block found - needs manual conversion or removal');
		return `<!-- TODO: dataview query removed during migration, needs manual conversion:\n${m}\n-->`;
	});

	return out.trim() + '\n';
}

function main() {
	const [, , inputPath, outputSlugArg] = process.argv;
	if (!inputPath) {
		console.error('Usage: node scripts/migrate-post.mjs <path-to-source.md> [output-slug]');
		process.exit(1);
	}

	const raw = readFileSync(inputPath, 'utf8');
	const { data, body } = parseFrontmatter(raw);

	const titleMatch = body.match(/^\s*#\s+(.+)\n/);
	const title = data.title ?? titleMatch?.[1]?.trim() ?? basename(inputPath, '.md');

	let slug = outputSlugArg;
	if (!slug && typeof data.permalink === 'string') {
		const m = data.permalink.match(/\/blog\/([^/]+)\/?$/);
		if (m) slug = m[1];
	}
	if (!slug) slug = slugify(title);

	const todos = [];
	const convertedBody = convertBody(body, { slug, todos });

	const pubDate = data.updated ? data.updated.slice(0, 10) : undefined;

	const frontmatterLines = [
		'---',
		`title: '${title.replace(/'/g, "''")}'`,
		`description: 'TODO: write a description for "${title}"'`,
		`pubDate: '${pubDate ?? 'TODO: YYYY-MM-DD'}'`,
		'---',
		'',
	];

	const outPath = join(BLOG_DIR, `${slug}.md`);
	writeFileSync(outPath, frontmatterLines.join('\n') + convertedBody);

	console.log(`Wrote ${outPath}`);
	if (todos.length) {
		console.log('\nTODOs:');
		for (const todo of todos) console.log(`  - ${todo}`);
	}
	console.log(
		'\nNote: description and pubDate are placeholders - please review and edit before publishing.'
	);
}

main();
