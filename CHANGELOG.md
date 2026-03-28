# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-03-28

### Breaking Changes

- **`preferBigInt` option removed**: Replaced by `{ mode: "preferBigInt" }` in `NumberParseOptions`.
- **`NumberLike` type widened**: Now includes `string` to support lossless decimals. Callers using `exactDecimal` mode should handle potential string returns.

### Added

- **`explicitTyping` option**: Allows forcing a specific system (e.g., `hiraganaIroha`) to resolve ambiguous symbols like "ぬ".
- **Arithmetic methods on numeric formatters**: Added `add`, `subtract`, `multiply`, and `divide` to all numeric system formatters.
- **Advanced math methods on numeric formatters**: Added `modulo`, `pow`, `abs`, and `compare` (compatible with `Array.prototype.sort`).
- **Zero-dependency BigFloat engine**: An internal fixed-point engine that eliminates floating-point rounding errors by scaling decimals to BigInt.
- **`NumberMode` enum and unified `mode` option**: Introduced a single `mode` field to choose between `number`, `preferBigInt`, and `exactDecimal` output.
- **Exact decimal parse path**: Supports parsing and round-trip formatting of lossless decimal strings via `{ mode: "exactDecimal" }`.

### Changed

- **Improved Error Messages**: Oversized decimal integer parts now suggest using `exactDecimal` mode.
- **Formatter Upgrades**: `formatDecimal` now accepts `NumberLike` (including strings) for direct consumption of exact decimals.
- **Internal Refactoring**: `parseFractionDigits` now returns raw digit strings to enable lossless decimal composition.

## [0.3.0] - 2026-03-28

### Breaking Changes

- **API Renamed**: The exported `integer` object has been renamed to `number`.
  - `integer.parseInt(...)` is now `number.parse(...)`.
  - Exported TypeScript types `IntegerLike` and `IntegerParseOptions` have been renamed to `NumberLike` and `NumberParseOptions`.
  - *Migration: Any code importing `integer` or related types must be updated to import `number` and use `number.parse` instead.*

### Changed

- Refined internal error messages and documentation to use "number" while preserving native JS integrations like `Number.isInteger`.

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
