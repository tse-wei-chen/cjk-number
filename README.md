# cjk-number

Convert numbers to and from CJK numeral systems, including traditional/simplified formats, heavenly stems, earthly branches, decimals, negatives, and very large BigInt values.

## Install

```sh
npm install cjk-number
```

## Quick Start

```js
import {
  cjkIdeographic,
  cjkHeavenlyStem,
  cjkEarthlyBranch,
  tradChineseFormal,
  tradChineseInformal,
  simpChineseInformal,
  simpChineseFormal,
  tradFormalPositionalUnits,
  integer
} from "cjk-number";

integer.parseInt("一千零二十三"); // 1023
integer.parseInt("壹仟零貳拾參"); // 1023
integer.parseInt("癸"); // 10
integer.parseInt("亥"); // 12

tradChineseFormal.parse(1023); // "壹仟零貳拾參"
simpChineseFormal.parse(1023); // "壹仟零贰拾叁"
cjkHeavenlyStem.parse(10); // "癸"
cjkEarthlyBranch.parse(12); // "亥"

tradFormalPositionalUnits[68]; // "無量大數"
```

## API

### integer.parseInt(input, options?)

Parses CJK string to number or bigint.

Options:

- strict?: boolean
- preferBigInt?: boolean
- heavenlyStemMode?: "fixed" | "cyclic"
- earthlyBranchMode?: "fixed" | "cyclic"

Examples:

```js
integer.parseInt("負一百零二"); // -102
integer.parseInt("一點二三"); // 1.23
integer.parseInt("九千零七兆一", { preferBigInt: true }); // 9007000000000001n
integer.parseInt("一無量大數", { preferBigInt: true }); // 10n ** 68n
```

### Formatter.parse(value)

Available formatters:

- cjkIdeographic
- tradChineseInformal
- tradChineseFormal
- simpChineseInformal
- simpChineseFormal
- cjkHeavenlyStem
- cjkEarthlyBranch

Examples:

```js
tradChineseInformal.parse(-320); // "負三百二十"
simpChineseInformal.parse(12.34); // "十二點三四"
tradChineseFormal.parse(10n ** 68n); // "壹無量大數"
simpChineseFormal.parse(10n ** 64n); // "壹不可思议"

cjkHeavenlyStem.parse(11, { mode: "cyclic" }); // "甲"
cjkEarthlyBranch.parse(13, { mode: "cyclic" }); // "子"
```

## Supported Large Units

Traditional:

萬, 億, 兆, 京, 垓, 秭, 穰, 溝, 澗, 正, 載, 極, 恆河沙, 阿僧祇, 那由他, 不可思議, 無量大數

Simplified:

万, 亿, 兆, 京, 垓, 秭, 穰, 沟, 涧, 正, 载, 极, 恒河沙, 阿僧祇, 那由他, 不可思议, 无量大数

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

Property-style test environment variables:

- CJK_TEST_SEED (default: 20260327)
- CJK_TEST_SAMPLES (default: 100)
- CJK_TEST_MAX_DIGITS (default: 69)

Example:

```sh
CJK_TEST_SEED=42 CJK_TEST_SAMPLES=1000 CJK_TEST_MAX_DIGITS=69 npm test
```

## Notes

- Decimal parsing currently returns number.
- Very large integers can return bigint when preferBigInt is enabled.
- Heavenly stem and earthly branch parsing is auto-detected by symbol.

## License

MIT
