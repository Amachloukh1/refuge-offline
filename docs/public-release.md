# REFUGE public release checklist

This is a review checklist, not a statement that a public release is ready. Publishing source and distributing a prepared offline bundle are different actions. Changing repository visibility remains a separate owner decision after review; this document does not authorize that change.

## Source, ownership and license

- [ ] Choose and add an explicit root software license after confirming the owner's rights. No root license is currently present; do not describe REFUGE as open source until this is resolved.
- [ ] Review permissions for the integrated Local Studio component against the source repository, branch and commit in `local-studio-integration.md`.
- [ ] Inventory third-party libraries, source, assets and modifications; retain licenses, copyrights and attribution notices.
- [ ] Review the modified Kiwix distribution separately, including GPL obligations, corresponding modified source and notices.
- [ ] Confirm the chosen project license does not imply ownership or relicensing of third-party content or models.

## Repository and history privacy

- [ ] Inspect tracked files and complete Git history for credentials, private URLs, machine paths and personal information. Ignore rules do not remove past commits.
- [ ] Check chat databases, attachments, browser exports, inventory, personal places, location data, logs and share configuration. Keep private backups out of releases.
- [ ] Inspect screenshots and recordings for names, coordinates, notifications, conversations and keys. Use a clean demonstration profile.
- [ ] Confirm public donation addresses are intended for publication. Exclude private keys and recovery phrases; avoid ambiguous payment networks.
- [ ] Rotate any exposed secret; removing it from the current file is insufficient.

## Content rights and prepared bundles

- [ ] Check rights for every bundled PDF, video, book, map, ZIM archive, media file, model and executable. A download link or checksum is not redistribution permission.
- [ ] Keep source URLs, language, edition/review dates, checksums where available, attribution and license evidence with each resource category.
- [ ] Preserve required OpenStreetMap/Protomaps and encyclopedia credits and applicable share-alike notices.
- [ ] Bundle only resources cleared for redistribution. Provide reviewed user-side preparation steps or omit other resources.
- [ ] Build a clean distribution with the dedicated sharing process; inspect its complete file list and test the archive. Do not upload a personal backup.
- [ ] Verify final artifact hashes and document exact contents, optional downloads and archive/extracted disk requirements.

## Accuracy and installation

- [ ] Recheck README commands in a fresh checkout and document unavailable optional features.
- [ ] Record current test/build results with date and platform; historical counts are not a current guarantee.
- [ ] Test the prepared Windows folder without networking, including a restart and restoration into a new folder.
- [ ] Validate Ubuntu 22.04 on the intended mini-PC before advertising it as tested. Record CPU, RAM, storage and runtime versions.
- [ ] Measure CPU inference latency/memory and computer-plus-screen power use. Keep the €50–€200 computer target separate from complete-kit costs and live offers.
- [ ] Verify eight interface languages, Arabic layout and English documentary fallback for RU/ZH/ES/PT; state actual media/archive languages.
- [ ] Confirm critical guidance works without AI, saved forecasts show their date and missing resources remain clearly marked.
- [ ] Recheck first-aid/hazard sources, translation status and outdated third-party documents; avoid implied official endorsement.

## Presentation and owner review

- [ ] Confirm README screenshots exist, show English demonstration data and represent the current app.
- [ ] If a demo video is included, review the entire recording, audio, privacy and size. Do not promise it before an artifact exists.
- [ ] Check documentation links and remove temporary sharing links or private credentials.
- [ ] Review the final diff, history findings, license decision and any distributable archive with the owner.
- [ ] Obtain the owner's final instruction before changing visibility or publishing a release. Preserve current visibility until then.
