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
  number,
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

// parse string -> number / bigint / string
number.parse("一千零二十三"); // 1023
number.parse("壹仟零貳拾參"); // 1023
number.parse("負一百零二"); // -102
number.parse("一點二三"); // 1.23
number.parse("一無量大數", { mode: "preferBigInt" }); // 10n ** 68n
number.parse("一京點一", { mode: "exactDecimal" }); // "10000000000000000.1" (lossless)

// format number/bigint/string -> CJK
cjkIdeographic.parse(1023); // "一千零二十三"
tradChineseFormal.parse(1023); // "壹仟零貳拾參"
simpChineseFormal.parse(1023); // "壹仟零贰拾叁"
koreanHangulFormal.parse(10n ** 68n); // "일무량대수"
japaneseFormal.parse(10n ** 68n); // "壱無量大数"

// arithmetic on CJK strings (exact BigFloat engine)
tradChineseInformal.add(["一兆", "一點五"]); // "一兆零一點五"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一億", "一億"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二點五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "十"); // "一千零二十四"
tradChineseInformal.abs("負一兆"); // "一兆"
["三十", "二", "十一"].sort(tradChineseInformal.compare); // ["二", "十一", "三十"]

// stem/branch
cjkHeavenlyStem.parse(10); // "癸"
cjkEarthlyBranch.parse(12); // "亥"

// sequence systems
hiragana.parse(1); // "あ"
hiragana.parse(46); // "ん"
```

## API

### number.parse(input, options?)

Parses CJK text into a `number`, `bigint`, or exact decimal `string`.

Options:

| Option | Type | Default | Description |
|---|---|---|---|
| `mode` | `"number" \| "preferBigInt" \| "exactDecimal"` | `"number"` | Controls the output numeric type |
| `strict` | `boolean` | `false` | Rejects unsupported characters early |
| `heavenlyStemMode` | `"fixed" \| "cyclic"` | `"fixed"` | How to handle out-of-range stem values |
| `earthlyBranchMode` | `"fixed" \| "cyclic"` | `"fixed"` | How to handle out-of-range branch values |
| `explicitTyping` | `ExplicitTyping` | `undefined` | Forces a specific CJK system for parsing |

**`mode` values:**

- `"number"` (default) — returns `number`; auto-promotes to `bigint` if the integer exceeds `Number.MAX_SAFE_INTEGER`.
- `"preferBigInt"` — always returns `bigint` for integer parse paths.
- `"exactDecimal"` — returns a lossless decimal `string` (e.g. `"10000000000000000.1"`), bypassing the `MAX_SAFE_INTEGER` restriction for mixed large+decimal values.

**`explicitTyping` values:**

- Choose from any of the available system names (e.g., `"hiraganaIroha"`, `"tradChineseFormal"`, `"koreanHangulFormal"`) to force the parser to use that system's mapping specifically. This is useful for resolving conflicts between systems that share the same symbols (like Hiragana Gojuon vs Iroha).

Examples:

```js
number.parse("九千零七兆一", { mode: "preferBigInt" }); // 9007000000000001n
number.parse("癸"); // 10
number.parse("亥"); // 12
number.parse("壱京", { mode: "preferBigInt" }); // 10n ** 16n
number.parse("ぬ", { explicitTyping: "hiraganaIroha" }); // 10
number.parse("ぬ"); // 23 (default gojuon sequence)
number.parse("一京點一", { mode: "exactDecimal" }); // "10000000000000000.1"
```

### Formatters

All formatters expose the following methods:

#### `parse(value)`

Formats a `number`, `bigint`, or exact decimal `string` into a CJK numeral string.

#### Arithmetic methods

All numeric formatters (not cyclic/sequence ones) also expose arithmetic methods that accept CJK strings and return a CJK string in the same numeral system:

```js
tradChineseInformal.add(["一千", "二十三"]); // "一千零二十三"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一億", "一億"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二點五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "三"); // "八"
tradChineseInformal.pow("二", 3); // "八" (exponent can be a number)
tradChineseInformal.abs("負五十"); // "五十"
tradChineseInformal.compare("三十", "二"); // 1
["三十", "二", "十一"].sort(tradChineseInformal.compare); // ["二", "十一", "三十"]
```

All arithmetic uses a **zero-dependency BigFloat engine**: decimal points are scaled out to `BigInt` before any operation, so results like `"一兆" + "一點五"` are exact with no floating-point drift.

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
simpChineseInformal.parse(12.34); // "十二点三四"
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

- `SyntaxError`: unsupported or invalid text shape
- `RangeError`: invalid formatter range in fixed sequence mode
- `RangeError`: non-integer passed to integer-only paths
- `RangeError`: decimal parse integer part exceeds `Number.MAX_SAFE_INTEGER` — use `{ mode: "exactDecimal" }` to bypass
- `RangeError`: division by zero in `divide` or `modulo`

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
