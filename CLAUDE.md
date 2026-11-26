# Notes for further development

## Versioning

Every change a user notices while running the adapter (feature, bug fix, changed or removed data points,
settings) raises the adapter version **once per pull request** (Semantic Versioning, while < 1.0):

| Change | Version |
|---|---|
| New feature | Minor: 0.6.0 → 0.7.0 |
| Bug fix, small improvement | Patch: 0.6.0 → 0.6.1 |
| Incompatible change (data points, texts, settings, requirements) | Minor, marked as **Breaking** in the changelog |

With several changes in one pull request, the highest level applies. If a pull request is extended before it is
merged, it keeps this one increase (raise it from patch to minor if needed).

Exception: pure changes to development tools without effect on users (CI workflows, tests, lint configuration,
documentation, `CLAUDE.md`) need no new version.

Update by hand:

- `package.json` and `package-lock.json` (`version` at the top and under `packages[""]`),
- `io-package.json`: `common.version` and a new entry at the top of `common.news` in all 11 languages
  (en, de, ru, pt, nl, fr, it, es, pl, uk, zh-cn); keep **at most 7 entries** and only versions that exist on npm,
- `README.md`: section `### X.Y.Z (YYYY-MM-DD)` at the top of the changelog with English entries
  `- (Exc3pt10n) …`, breaking changes marked with `**Breaking:**`. The release notes are generated from it, so do
  not use a placeholder such as `**WORK IN PROGRESS**` for a version. Move old entries to `CHANGELOG_OLD.md`.
- The German description in `docs/de/README.md` is kept up to date with new features.

## Language

- `README.md` is completely English (ioBroker repochecker). `docs/de/README.md` is the German user documentation;
  neither contains installation from GitHub or developer commands; those belong in `DEVELOPMENT.md`.
- Texts in the code are English: log messages, object names, state texts, error messages, `tools/` output.
- Texts in `admin/jsonConfig.json` and translated fields in `io-package.json` (`titleLang`, `desc`, news) always
  contain all 11 languages.
- Answers to the maintainer in chat are German.

## Release

Releases are created automatically by the central workflow from
[Exc3pt10n/ioBroker-workflows](https://github.com/Exc3pt10n/ioBroker-workflows), included in
`.github/workflows/test-and-release.yml` via `@v1` (keep the file name: the repochecker and npm Trusted Publishing
depend on it). After a merge to `main` all checks run; only if they are green and the version from `package.json`
has no tag yet, the release job creates:

- the annotated tag `vX.Y.Z`,
- a GitHub release with the notes from the README changelog section and the packed
  `iobroker.sungrow-wifi-v31-local-X.Y.Z.tgz` as asset,
- then the `deploy` job (`npm-publish.yml`) publishes exactly this `.tgz` to npm (Trusted Publishing, no token).

**Never** create or push tags, GitHub releases or npm versions yourself, especially not for a version bump on a
feature branch. Delete a tag created locally by accident with `git tag -d vX.Y.Z`. A merge without a version bump
(e.g. tools only) creates no release.

The `release-guard` in the workflow checks these rules: if a pull request changes shipped files (`admin/`, `lib/`,
`main.js`, `io-package.json`, `tools/`), runtime fields in `package.json` or runtime packages in the lockfile
(e.g. through `npm audit fix`), the version must be raised and entered completely.

Errors in the central workflow itself belong in `Exc3pt10n/ioBroker-workflows`.

## Distribution via npm

The adapter is distributed via npm (`npm-package: true` in the central workflow), not (yet) via the ioBroker
repository:

- No `prepare` script; everything needed only for development is in `devDependencies`.
- `common.nogit` is set in `io-package.json`; installation from GitHub (`tarball/main`, `tarball/release`) is no
  longer documented, the `release` branch is not updated any more (`release-branch: ''`).
- `@iobroker/testing` stays current (6.x), `admin` as global dependency at least 7.6.20.
- Testers without npm can install the `.tgz` from a GitHub release:
  `iobroker url https://github.com/Exc3pt10n/ioBroker.sungrow-wifi-v31-local/releases/download/vX.Y.Z/iobroker.sungrow-wifi-v31-local-X.Y.Z.tgz`

Before a pull request, check the ioBroker repochecker:

```bash
npx @iobroker/repochecker https://github.com/Exc3pt10n/ioBroker.sungrow-wifi-v31-local <branch>
```

## Automated tests (GitHub Actions)

`.github/workflows/test-and-release.yml` follows the ioBroker standard structure:

- `check-and-lint`: `ioBroker/testing-action-check@v2` (lint, package tests)
- `adapter`: central workflow (tests on Node 22/24, integration and install test, `npm audit --omit=dev`,
  `release-guard`, release after a merge to `main`)
- `adapter-tests`: unit and integration tests with `ioBroker/testing-action-adapter@v1` on Node 22/24/26 with
  Linux, Windows and macOS
- `deploy`: publishes to npm after a release
- weekly and via `workflow_dispatch`: full matrix; `workflow_dispatch` on `main` also completes an interrupted release

Required checks for the branch protection of `main`: `adapter / ci-result` and `check-and-lint`.

When the minimum Node.js version changes: update `engines` in `package.json`/`package-lock.json` and the
requirements in `README.md` and `docs/de/README.md` together.

## Checks before pushing

```bash
npm run lint
npm test
npm run test:integration
```

Run the release-guard locally (with a clone of ioBroker-workflows next to this repository):

```bash
node ../ioBroker-workflows/scripts/check-release.mjs pr --base origin/main --npm-package true
```
