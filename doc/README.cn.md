# cjk-number

此包用于阿拉伯数字与 CJK（中日韩）数字系统之间的相互转换。

支持的范畴包括：

- 繁体与简体中文数字
- 正式与非正式变体（大写与小写）
- 天干与地支
- 韩文与日文数字风格（Hanja / Kanji）
- 假名序号系统（五十音与伊吕波 / Gojuon and Iroha）
- 支持负数、小数以及极大的 BigInt 数值

## 安装

```sh
npm install cjk-number
```

## 运行环境

- Node.js 18+
- ESM 模块

## 快速上手

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

// 解析字符串 -> number / bigint / string
number.parse("一千零二十三"); // 1023
number.parse("壹仟零貳拾參"); // 1023
number.parse("负一百零二"); // -102
number.parse("一点二三"); // 1.23
number.parse("一无量大数", { mode: "preferBigInt" }); // 10n ** 68n
number.parse("一京点一", { mode: "exactDecimal" }); // "10000000000000000.1" (无损)

// 格式化数值 -> CJK 字符串
cjkIdeographic.parse(1023); // "一千零二十三"
tradChineseFormal.parse(1023); // "壹仟零貳拾參"
simpChineseFormal.parse(1023); // "壹仟零贰拾叁"
koreanHangulFormal.parse(10n ** 68n); // "일무량대수"
japaneseFormal.parse(10n ** 68n); // "壱無量大数"

// 在 CJK 字符串上直接进行算术运算（高精度小数引擎）
tradChineseInformal.add(["一兆", "一点五"]); // "一兆零一点五"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一亿", "一亿"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二点五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "十"); // "一千零二十四"
tradChineseInformal.abs("负一兆"); // "一兆"
["三十", "二", "十一"].sort(tradChineseInformal.compare); // ["二", "十一", "三十"]

// 天干与地支
cjkHeavenlyStem.parse(10); // "癸"
cjkEarthlyBranch.parse(12); // "亥"

// 序号系统
hiragana.parse(1); // "あ"
hiragana.parse(46); // "ん"
```

## API

### number.parse(input, options?)

将 CJK 文本解析为 `number`、`bigint` 或高精度小数字符串 `string`。

选项：

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `mode` | `"number" \| "preferBigInt" \| "exactDecimal"` | `"number"` | 控制输出数值的类型 |
| `strict` | `boolean` | `false` | 提早拒绝不支持的字符 |
| `explicitTyping` | `ExplicitTyping` | `undefined` | 强制指定特定的 CJK 系统进行解析 |

**`mode` 数值：**

- `"number"` (默认) — 返回 `number`; 若数值超过 `Number.MAX_SAFE_INTEGER` 则自动转为 `bigint`。
- `"preferBigInt"` — 对于整数解析路径总是以 `bigint` 返回。
- `"exactDecimal"` — 返回无损的十进制字符串（例如 `"10000000000000000.1"`），这可以绕过处理极大型数值加小数时的 `MAX_SAFE_INTEGER` 限制。

**`explicitTyping` 数值：**

- 可以从任何可用的系统名称（例如 `"hiraganaIroha"`, `"tradChineseFormal"`, `"koreanHangulFormal"`）中选择，以强制解析器使用该系统的映射。这对于解决具有相同符号的系统之间的冲突非常有用（例如平假名五十音顺 vs 伊吕波顺）。

示例：

```js
number.parse("九千零七兆一", { mode: "preferBigInt" }); // 9007000000000001n
number.parse("ぬ", { explicitTyping: "hiraganaIroha" }); // 10
number.parse("ぬ"); // 23 (默认为五十音顺序)
number.parse("一京点一", { mode: "exactDecimal" }); // "10000000000000000.1"
```

### 格式化器 (Formatters)

所有格式化器都公开以下方法：

#### `parse(value)`

将 `number`、`bigint` 或高精度十进制字符串格式化为 CJK 数字字符串。

#### 算术方法

所有**数值格式化器**（非序列/序号型）还公开了算术方法，这些方法接受 CJK 字符串并返回相同数值系统下的 CJK 字符串：

```js
tradChineseInformal.add(["一千", "二十三"]); // "一千零二十三"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一亿", "一亿"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二点五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "三"); // "八"
tradChineseInformal.compare("三十", "二"); // 1
```

所有算术运算都使用 **零依赖的 BigFloat 引擎**：在运算前会将小数点缩放为 `BigInt`，因此像 `"一兆" + "一点五"` 這樣的结果是精确的，没有浮点数精度丢失。

#### 序列系统方法

所有序列系统（天干、地支和假名）还公开了用于遍历与解码序列的方法：

- `decode(symbol)`: 返回该符号在特定序列中的 1-indexed 数值。
- `next(symbol, count?)`: 返回序列中的下一个符号（循环）。
- `prev(symbol, count?)`: 返回序列中的上一个符號（循环）。
- `range(start, end)`: 返回从 `start` 到 `end` 之间的符号数组（含边界）。

示例：

```js
hiraganaIroha.decode("ぬ"); // 10
hiragana.decode("ぬ"); // 23 (五十音顺)

cjkHeavenlyStem.next("癸"); // "甲"
cjkEarthlyBranch.prev("子", 2); // "戌"
hiraganaIroha.range("ゑ", "す"); // ["ゑ", "ひ", "も", "せ", "す"]
```

可用格式化器：

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

## 许可

MIT
