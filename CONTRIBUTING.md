# Contributing to REFUGE

Thank you for helping make preparedness information easier to keep offline. Useful contributions include reproducible bug reports, translation reviews, accessibility improvements, source verification and tests on actual mini-PC hardware.

The repository is currently private and its root software license has not yet been selected. Coordinate code contributions with the owner while the licensing and integrated-code provenance review remains open. Third-party resources retain their own terms.

## Run a local checkout

Follow the [English installation guide](docs/installation.md). The app runs at `http://127.0.0.1:8099`; optional models, archives and media are prepared separately. For frontend work, run the local server and `npm run dev` as needed. Use marked demonstration data for screenshots.

Before submitting source changes, run:

```sh
npm test
npm run build
```

If parallel tests encounter a Windows temporary-file race, diagnose the failed test and also verify the suite sequentially with `node --test --test-concurrency=1 tests/*.test.js`. Do not remove failing assertions just to obtain a green run. Describe the actual commands and outcomes in the change summary.

## Report a useful bug

Include OS/version, browser, REFUGE commit, interface language, the exact steps, expected result and actual result. Identify which resources are installed and whether the network was disconnected. Share a screenshot only after removing personal household information, GPS positions, chat history, credentials and private URLs.

A missing download, an unavailable radio receiver and a failed local AI engine are different problems. Report the relevant status message rather than assuming every catalog item is installed.

## Review a translation or reference

Name the interface/document language, page and wording. Give the current text, proposed text and reason. Arabic layout should be checked right to left. Interface translations do not translate PDFs, books, media or Wikipedia archives.

For preparedness and medical guidance, cite primary sources and record language, date, region and limitations. Do not add AI-generated diagnoses, personalized medication doses or claims that photos identify safe wild food. Escalate uncertain technical content for a qualified human review.

## Add content or illustrations

Record origin, author, actual language, format, edition, rights and attribution. Add hashes and expected sizes where supported by the existing catalog. Free streaming or downloading does not automatically allow redistribution.

Keep large downloaded resources out of Git. Do not commit `.env`, `data/`, `models/`, `runtime/`, `private/`, personal exports or backups. Bundled editorial illustrations belong under `public/illustrations/`; log generation prompts and label them appropriately. Rebuild and check their presence in `dist/` before testing offline.

## Keep changes reviewable

Describe the user-visible problem, final behavior and validation. Keep unrelated changes separate. For visual changes, include English demonstration screenshots plus relevant small-screen/Arabic checks. Report remaining hardware limitations honestly. Repository visibility and release publication are owner decisions.
