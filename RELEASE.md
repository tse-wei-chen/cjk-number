# Release Guide

This document is a practical release checklist for cjk-number v0.1.0.

## 1. Pre-release checks

Run all quality gates locally:

```sh
npm ci
npm run release:check
```

Expected result:

- typecheck passes
- tests pass
- build passes
- npm pack --dry-run lists the expected files

## 2. Verify package metadata

Confirm the following in package.json:

- name
- version
- repository
- bugs
- homepage
- license
- files
- exports
- engines

Current target version:

- 0.1.0

## 3. Verify changelog

Ensure CHANGELOG.md contains a section for the version being released.

Current section present:

- [0.1.0] - 2026-03-27

## 4. Commit and tag

Use non-interactive commands:

```sh
git add .
git commit -m "release: v0.1.0"
git tag v0.1.0
git push origin HEAD
git push origin v0.1.0
```

## 5. Publish to npm

Login (if needed):

```sh
npm login
```

Publish:

```sh
npm publish --access public
```

Note: prepublishOnly already runs typecheck/test/build automatically.

## 6. Create GitHub Release

Create a release named:

- v0.1.0

Use CHANGELOG.md content as release notes.

## 7. Post-release smoke test

In another directory:

```sh
npm init -y
npm install cjk-number@0.1.0
node -e "import('cjk-number').then(m=>console.log(m.tradChineseFormal.parse(1023)))"
```

Expected output:

- 壹仟零貳拾參

## 8. Optional rollback guidance

If publish is incorrect:

- Prefer deprecating the bad version and releasing a patch.
- Avoid unpublish unless strictly necessary and within npm policy.
