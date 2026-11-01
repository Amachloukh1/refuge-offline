# Install REFUGE and prepare it for offline use

[Project overview](../README.md) · [English screenshot tour](screenshots.md) · [Detailed prepared-folder notes in French](installation-offline.md)

REFUGE has two installation paths: build the application from source, or transfer a complete prepared folder. A source checkout includes the interface, illustrations, catalogs and scripts. Large content files and the optional AI engine/model are separate.

## Requirements

- Node.js **22.12+ or 24** and npm for source installation; Git to clone the repository.
- A browser and enough storage for the resources you choose. Models, encyclopedias, maps and media can occupy many gigabytes.
- Electricity for the computer and screen. Test a battery with the actual equipment before relying on it.
- Internet during dependency installation and resource preparation.

Windows is the exercised preparation platform. Ubuntu 22.04 on the intended x86-64 mini-PC still needs hardware validation. The 8–16 GB RAM target for CPU AI depends on model, context and other applications.

## 1. Build the application while online

The repository is currently private; GitHub access is required until the owner publishes it.

```sh
git clone https://github.com/Amachloukh1/refuge-offline.git
cd refuge-offline
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:8099**. Leave the server running while using REFUGE. Stop it before changing its server configuration. The app is served locally; GitHub is not its running backend.

The initial interface is usable with its built-in guidance and images. Unprepared optional features show missing resources. Demonstration supplies must be replaced with a verified household inventory.

## 2. Prepare the resources you actually need

Run preparation commands from the project directory while online. These commands can download large files; select resources deliberately.

| Resource | Preparation | Offline behavior |
| --- | --- | --- |
| Interface and illustrations | `npm ci`, then `npm run build` | Included in the production build |
| Reference PDFs | `node scripts/fetch-content.mjs`, then `node scripts/index-documents.mjs` | Saved PDFs and assistant reference passages |
| Cataloged videos | `node scripts/fetch-offline-assets.mjs --videos` | Only installed files can play locally |
| Cataloged Wikipedia archives | `node scripts/fetch-offline-assets.mjs --wiki` | Requires the separately prepared Kiwix reader |
| Radio software packages | `node scripts/fetch-offline-assets.mjs --radio` | Needs a compatible physical receiver, antenna and drivers |
| Books, films and music | Use supported catalogs and batch download controls | Installed files only; check rights and actual language |
| Maps | Follow the regional extraction and local asset steps | Prepared coverage only; no automatic route calculation |
| Weather | Save or refresh while connected | A dated forecast, not a live offline warning service |
| Optional AI | Prepare a local engine and model, configure `.env` | CPU inference without cloud fallback when local mode is configured |

Use the [prepared-folder instructions](installation-offline.md) for the portable engine layout, Kiwix build/patch commands and regional PMTiles extraction. See [map/radio/GPS notes](radio-gps-meteo-cartes.md), [books](books.md) and [media](media.md) for their specific workflows. This table does not claim that a single downloader installs everything.

## Included illustrations and optional product photos

All tracked files under **`public/illustrations/`** come with a Git clone, including the seven page banners, six genre cover artworks, equipment artwork and pharmacy illustrations. They are ready-to-use WebP/SVG assets. No image generation service, API key, remote CDN or extra download is required to display them.

Vite copies `public/illustrations/` into **`dist/illustrations/`** during `npm run build`. Keep the complete `dist/` directory when transferring the built app. The prepared sharing selector also includes both `public/` and `dist/`; selecting files is separate from verifying content redistribution rights.

Retailer photographs are an optional cache under `public/equipment-photos/`, excluded from Git. To prepare supported product images while online:

```sh
node scripts/fetch-equipment-images.mjs
npm run build
```

Without that cache, the interface uses bundled artwork or icons. Retailer images retain their owners' rights. The generated editorial illustrations are not photographs of an exact product or medicine. Book covers are labeled illustrated covers. Generation records: [equipment/pharmacy](generated-illustrations.json), [pages and books](generated-page-illustrations.json).

After a source update, rebuild before transferring the folder. Restart the app, disconnect the network and open the illustrated pages to check the actual copied files.

## 3. Optional local AI

The documented configuration uses Ollama and `qwen3:4b-instruct-2507-q4_K_M`. Copy `.env.example` to `.env` and review it. The documented local service uses port `11479`, a project-local model directory and `OLLAMA_NO_CLOUD=1`. Once that engine is running with the correct model location:

```sh
node scripts/fetch-local-model.mjs
```

Use the [detailed engine setup](installation-offline.md) before running the portable launchers. They expect specific prepared files in `runtime/` and `models/`; they do not install missing engines on startup.

The assistant retrieves local reference passages; this is not training a medical model. Wikipedia is browsed separately. Validate replies against the actual references. Remote Studio is optional and requires a network; local mode does not automatically send failed local requests to it.

## 4. Transfer an already prepared folder

Keep the complete built app, selected `content/`, necessary `data/` indexes, `server/`, `src/`, platform-compatible `node_modules/`, `runtime/`, `models/` and launchers. Preserve `public/` for rebuilding and all applicable licenses. Windows native dependencies and executables are not automatically portable to Linux.

Windows, with Node.js 24 installed:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\DEMARRER-WINDOWS.ps1
```

Ubuntu x86-64, with the expected Linux runtimes already prepared:

```sh
bash DEMARRER-UBUNTU.sh
```

For a basic source-built app without the portable AI stack, use `npm start`. A copied folder is not proof that target hardware works: test the actual mini-PC, OS, screen, battery and optional devices.

## 5. Rehearse without internet

1. Open the resource check page and review missing resources and optional hash checks.
2. Disconnect networking, restart REFUGE and open a guide, PDF, book, video and the illustrated pages.
3. Test the prepared map and Wikipedia reader. Check that you can open content, not just its catalog entry.
4. If using AI, confirm the local engine responds without internet. Measure time and memory on the target PC.
5. Verify inventory changes persist, export data and restore a backup into a new location.
6. Measure battery runtime. GPS needs a satellite fix; radio needs real reception tests.

Backups can contain secrets and personal history. Keep them private. A shareable bundle is prepared separately and requires a content-rights review; see [backup/restore](backup-restore.md), [distribution](partage-refuge.md) and [public release checklist](public-release.md).

## Updating

Commit or back up your local work first, then fetch the source update through your normal Git workflow. Run `npm ci` when dependencies change and `npm run build` for every frontend update. Keep personal `.env`, browser exports, model files and content backups separate from Git. An older ZIP or NAS copy is not updated by pushing new source to GitHub.
