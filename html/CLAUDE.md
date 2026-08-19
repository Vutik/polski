# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static HTML site for studying Polish grammar and vocabulary, written in Russian for Russian/Belarusian speakers. Hosted on GitHub Pages at `vutik.github.io/polski/html/`.

## Structure

- `index.html` — table of contents linking to all pages
- `01_`–`12_` — grammar pages (nouns, adjectives, verbs, questions, prepositions, numerals, etc.)
- `13_`–`18_` — thematic vocabulary pages
- `propolski_czasy.html` — additional tense reference
- `style.css` — shared stylesheet for all hand-written pages
- `table-filter.js` — column filter widget for large summary tables (uses `data-filterable-table` / `data-table-filter` attributes)
- `polski_od_wolskich/` — PDF-to-HTML conversion of "Polski od Wolskich" (A1 textbook, 184 pages, split via pdf2htmlEX)
- `polski_na_a2/` — PDF-to-HTML conversion of "Polski na A2" textbook (183 pages, split via pdf2htmlEX)

## Content Conventions

- All explanatory text is in Russian
- Polish examples use `<code>` tags with `<strong>` highlighting key morphemes/endings
- Tables compare Polish with Russian and Belarusian equivalents, noting false friends (ложные друзья)
- Grammar distinguishes męskoosobowe (masculine personal) vs niemęskoosobowe (non-masculine-personal) plural forms — this distinction doesn't exist in Russian/Belarusian and is always highlighted
- Pages are self-contained HTML documents, each linking `style.css`

## Development

No build system. Files are plain HTML served statically. To preview locally, open any `.html` file in a browser or use:
```
python3 -m http.server 8080 --directory .
```

The `polski_od_wolskich/` and `polski_na_a2/` directories require HTTP serving (not `file://`) due to XHR-based page loading from pdf2htmlEX's `--split-pages` output.

## PDF Conversion

Textbooks were converted with:
```
docker run --rm -w /pdf -v "<path>:/pdf" guoxuequan/pdf2htmlex pdf2htmlEX \
  --split-pages 1 --embed-image 0 --embed-font 0 --embed-css 0 \
  --dest-dir /pdf/html/<output-dir> --page-filename "page%d.page" \
  "<input>.pdf" "index.html"
```

## Language Notes for AI

- When adding grammar content, always include the мужсколичные/немужсколичные distinction for plural forms
- Mark false friends (ложные друзья) prominently with blockquotes and bold warnings
- Include Belarusian parallels where relevant (Polish is often closer to Belarusian than to Russian)
- Use HTML entities for Polish special characters in hand-written content: `ą ę ć ś ź ż ó ł ń`
