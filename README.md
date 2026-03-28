# cjk-number

Convert numbers between Arabic values and CJK numeral systems.

Supported domains include:

- Traditional and simplified Chinese numerals
- Formal and informal variants
- Heavenly stems and earthly branches
- Korean and Japanese numeric kanji/hanja styles
- Kana sequence systems (gojuon and iroha)
- Negative numbers, decimals, and very large BigInt values

## Install

```sh
npm install cjk-number
```

## Runtime

- Node.js 18+
- ESM package

## Quick Start

```js
import {
  integer,
  cjkIdeographic,
  tradChineseInformal,
  tradChineseFormal,
  simpChineseInformal,
  simpChineseFormal,
  cjkHeavenlyStem,
  cjkEarthlyBranch,
  koreanHangulFormal,
  japaneseFormal,
  hiragana
} from "cjk-number";

// parse string -> number/bigint
number.parse("一千零二十三"); // 1023
number.parse("壹仟零貳拾參"); // 1023
number.parse("負一百零二"); // -102
number.parse("一點二三"); // 1.23
number.parse("一無量大數", { preferBigInt: true }); // 10n ** 68n

// format number/bigint -> string
cjkIdeographic.parse(1023); // "一千零二十三"
tradChineseFormal.parse(1023); // "壹仟零貳拾參"
simpChineseFormal.parse(1023); // "壹仟零贰拾叁"
koreanHangulFormal.parse(10n ** 68n); // "일무량대수"
japaneseFormal.parse(10n ** 68n); // "壱無量大数"

// stem/branch
cjkHeavenlyStem.parse(10); // "癸"
cjkEarthlyBranch.parse(12); // "亥"

// sequence systems
hiragana.parse(1); // "あ"
hiragana.parse(46); // "ん"
```

## API

### number.parse(input, options?)

Parses CJK text into number or bigint.

Options:

- strict?: boolean
- preferBigInt?: boolean
- heavenlyStemMode?: "fixed" | "cyclic"
- earthlyBranchMode?: "fixed" | "cyclic"

Behavior summary:

- If the value fits safely, returns number by default.
- If out of Number safe range, returns bigint automatically.
- If preferBigInt is true, always returns bigint for integer parse paths.
- Decimal parse returns number.

Examples:

```js
number.parse("九千零七兆一", { preferBigInt: true }); // 9007000000000001n
number.parse("癸"); // 10
number.parse("亥"); // 12
number.parse("壱京", { preferBigInt: true }); // 10n ** 16n
number.parse("ぬ"); // 10 (iroha sequence symbol)
```

### Formatters

All formatters expose parse(value).

Available formatters:

- cjkIdeographic
- tradChineseInformal
- tradChineseFormal
- simpChineseInformal
- simpChineseFormal
- cjkHeavenlyStem
- cjkEarthlyBranch
- koreanHangulFormal
- koreanHanjaFormal
- koreanHanjaInformal
- japaneseFormal
- japaneseInformal
- hiragana
- hiraganaIroha
- katakana
- katakanaIroha

Examples:

```js
tradChineseInformal.parse(-320); // "負三百二十"
simpChineseInformal.parse(12.34); // "十二點三四"
tradChineseFormal.parse(10n ** 68n); // "壹無量大數"
simpChineseFormal.parse(10n ** 64n); // "壹不可思议"

cjkHeavenlyStem.parse(11, { mode: "cyclic" }); // "甲"
cjkEarthlyBranch.parse(13, { mode: "cyclic" }); // "子"
```

## System Coverage

### Full numeric systems (large-unit aware)

These support complete number formatting/parsing and large units up to 無量大數 / 无量大数:

- tradChineseInformal
- tradChineseFormal
- simpChineseInformal
- simpChineseFormal
- koreanHangulFormal
- koreanHanjaFormal
- koreanHanjaInformal
- japaneseFormal
- japaneseInformal

### Sequence systems

These are order-based symbol sequences, not positional decimal numerals:

- cjkHeavenlyStem: 10 symbols
- cjkEarthlyBranch: 12 symbols
- hiragana: modern gojuon sequence (46 symbols)
- katakana: modern gojuon sequence (46 symbols)
- hiraganaIroha: traditional iroha sequence (47 symbols, includes ゐ and ゑ)
- katakanaIroha: traditional iroha sequence (47 symbols, includes ヰ and ヱ)

For sequence formatters:

- fixed mode: only accepts 1..length
- cyclic mode: wraps by sequence length

## Supported Large Units

Traditional:

萬, 億, 兆, 京, 垓, 秭, 穰, 溝, 澗, 正, 載, 極, 恆河沙, 阿僧祇, 那由他, 不可思議, 無量大數

Simplified:

万, 亿, 兆, 京, 垓, 秭, 穰, 沟, 涧, 正, 载, 极, 恒河沙, 阿僧祇, 那由他, 不可思议, 无量大数

Korean naming set:

만, 억, 조, 경, 해, 자, 양, 구, 간, 정, 재, 극, 항하사, 아승기, 나유타, 불가사의, 무량대수

Japanese naming set:

万, 億, 兆, 京, 垓, 秭, 穣, 溝, 澗, 正, 載, 極, 恒河沙, 阿僧祇, 那由他, 不可思議, 無量大数

Note:

- Historical texts may assign different powers for some high-order names.
- This package uses a fixed modern 10^4-step progression across supported large-unit systems.

## Strict Mode

strict: true validates input characters against an allowed set.

Use it when you want to reject unexpected symbols early.

```js
number.parse("一億", { strict: true }); // ok
number.parse("abc", { strict: true }); // throws SyntaxError
```

## Error Cases

Common thrown errors:

- SyntaxError: unsupported/invalid text shape
- RangeError: invalid formatter range in fixed sequence mode
- RangeError: non-integer passed to integer-only paths
- RangeError: decimal parse integer part exceeds Number.MAX_SAFE_INTEGER

## Development

Install and verify:

```sh
npm install
npm run typecheck
npm test
npm run build
```

Release preflight:

```sh
npm run release:check
```

Dry-run package content:

```sh
npm run pack:check
```

Property-style test environment variables:

- CJK_TEST_SEED (default: 20260327)
- CJK_TEST_SAMPLES (default: 100)
- CJK_TEST_MAX_DIGITS (default: 69)

Example:

```sh
CJK_TEST_SEED=42 CJK_TEST_SAMPLES=1000 CJK_TEST_MAX_DIGITS=69 npm test
```

## License

MIT
