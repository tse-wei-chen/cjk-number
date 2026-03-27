# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-03-27

### Added

- Korean and Japanese numeric formatters:
  - koreanHangulFormal
  - koreanHanjaFormal
  - koreanHanjaInformal
  - japaneseFormal
  - japaneseInformal
- Kana sequence formatters:
  - hiragana / hiraganaIroha
  - katakana / katakanaIroha
- Locale-specific decimal point handling:
  - Traditional Chinese: 點
  - Simplified Chinese: 点
  - Japanese: 点
  - Korean: 점
- Coverage command and gate:
  - npm run coverage
  - Vitest coverage thresholds set to 100% for lines/functions/branches/statements

### Changed

- Normalization expanded for Korean/Japanese forms and sequence symbol parsing.
- Documentation expanded for multi-system coverage and API behavior.

### Removed

- Removed public export `tradFormalPositionalUnits` from API, tests, and README.

### Quality

- typecheck, tests, build, and coverage all pass locally.

## [0.1.0] - 2026-03-27

### Added

- Initial TypeScript package setup with ESM build output.
- Core conversion APIs:
  - integer.parseInt
  - cjkIdeographic
  - tradChineseInformal / tradChineseFormal
  - simpChineseInformal / simpChineseFormal
  - cjkHeavenlyStem / cjkEarthlyBranch
- Fixed/cyclic mode for heavenly stems and earthly branches.
- Support for negative numbers, decimals, and BigInt parsing.
- Large unit support up to 無量大數 / 无量大数.
- Export tradFormalPositionalUnits.
- Unit tests for spec examples, edge cases, detailed unit coverage, and seeded property-style round-trip checks.
- Configurable property-style test controls via environment variables:
  - CJK_TEST_SEED
  - CJK_TEST_SAMPLES
  - CJK_TEST_MAX_DIGITS

### Changed

- Normalization expanded to handle traditional/simplified variant units.
- README expanded with API, supported units, and development guidance.

### Quality

- Build and test pass in local verification.
