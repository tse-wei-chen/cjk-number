# cjk-number

此套件用於阿拉伯數字與 CJK（中日韓）數字系統之間的相互轉換。

支援的範疇包括：

- 繁體與簡體中文數字
- 正體與普通體（大寫與小寫）
- 天干與地支
- 韓文與日文數字風格（Hanja / Kanji）
- 假名序號系統（五音與伊呂波 / Gojuon and Iroha）
- 支援負數、小數以及極大的 BigInt 數值

## 安裝

```sh
npm install cjk-number
```

## 執行環境

- Node.js 18+
- ESM 模組

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

// 解析字串 -> number / bigint / string
number.parse("一千零二十三"); // 1023
number.parse("壹仟零貳拾參"); // 1023
number.parse("負一百零二"); // -102
number.parse("一點二三"); // 1.23
number.parse("一無量大數", { mode: "preferBigInt" }); // 10n ** 68n
number.parse("一京點一", { mode: "exactDecimal" }); // "10000000000000000.1" (無損)

// 格式化數值 -> CJK 字串
cjkIdeographic.parse(1023); // "一千零二十三"
tradChineseFormal.parse(1023); // "壹仟零貳拾參"
simpChineseFormal.parse(1023); // "壹仟零贰拾叁"
koreanHangulFormal.parse(10n ** 68n); // "일무량대수"
japaneseFormal.parse(10n ** 68n); // "壱無量大数"

// 在 CJK 字串上直接進行算術運算（精確小數引擎）
tradChineseInformal.add(["一兆", "一點五"]); // "一兆零一點五"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一億", "一億"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二點五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "十"); // "一千零二十四"
tradChineseInformal.abs("負一兆"); // "一兆"
["三十", "二", "十一"].sort(tradChineseInformal.compare); // ["二", "十一", "三十"]

// 天干與地支
cjkHeavenlyStem.parse(10); // "癸"
cjkEarthlyBranch.parse(12); // "亥"

// 序號系統
hiragana.parse(1); // "あ"
hiragana.parse(46); // "ん"
```

## API

### number.parse(input, options?)

將 CJK 文字解析成 `number`、`bigint` 或精確小數字串 `string`。

選項：

| 選項 | 類型 | 預設值 | 說明 |
|---|---|---|---|
| `mode` | `"number" \| "preferBigInt" \| "exactDecimal"` | `"number"` | 控制輸出數值的類型 |
| `strict` | `boolean` | `false` | 提早拒絕不支援的字元 |
| `explicitTyping` | `ExplicitTyping` | `undefined` | 強制指定特定的 CJK 系統進行解析 |

**`mode` 數值：**

- `"number"` (預設) — 返回 `number`; 若數值超過 `Number.MAX_SAFE_INTEGER` 則自動轉為 `bigint`。
- `"preferBigInt"` — 對於整數解析路徑總是以 `bigint` 返回。
- `"exactDecimal"` — 返回無損的十進制字串（例如 `"10000000000000000.1"`），這可以繞過處理極大型數值加小數時的 `MAX_SAFE_INTEGER` 限制。

**`explicitTyping` 數值：**

- 可以從任何可用的系統名稱（例如 `"hiraganaIroha"`, `"tradChineseFormal"`, `"koreanHangulFormal"`）中選擇，以強制解析器使用該系統的映射。這對於解決具有相同符號的系統之間的衝突非常有用（例如平假名五十音順 vs 伊呂波順）。

範例：

```js
number.parse("九千零七兆一", { mode: "preferBigInt" }); // 9007000000000001n
number.parse("ぬ", { explicitTyping: "hiraganaIroha" }); // 10
number.parse("ぬ"); // 23 (預設為五十音順序)
number.parse("一京點一", { mode: "exactDecimal" }); // "10000000000000000.1"
```

### 格式化器 (Formatters)

所有格式化器都公開以下方法：

#### `parse(value)`

將 `number`、`bigint` 或精確十進制字串格式化為 CJK 數字字串。

#### 算術方法

所有**數值格式化器**（非序列/序號型）還公開了算術方法，這些方法接受 CJK 字串並返回相同數值系統下的 CJK 字串：

```js
tradChineseInformal.add(["一千", "二十三"]); // "一千零二十三"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一億", "一億"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二點五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "三"); // "八"
tradChineseInformal.compare("三十", "二"); // 1
```

所有算術運算都使用 **零依賴的 BigFloat 引擎**：在運算前會將小數點縮放為 `BigInt`，因此像 `"一兆" + "一點五"` 這樣的結果是精確的，沒有浮點數精度損失。

#### 序列系統方法

所有序列系統（天干、地支和假名）還公開了用於遍歷與解碼序列的方法：

- `decode(symbol)`: 返回該符號在特定序列中的 1-indexed 數值。
- `next(symbol, count?)`: 返回序列中的下一個符號（循環）。
- `prev(symbol, count?)`: 返回序列中的上一個符號（循環）。
- `range(start, end)`: 返回從 `start` 到 `end` 之間的符號陣列（含邊界）。

範例：

```js
hiraganaIroha.decode("ぬ"); // 10
hiragana.decode("ぬ"); // 23 (五十音順)

cjkHeavenlyStem.next("癸"); // "甲"
cjkEarthlyBranch.prev("子", 2); // "戌"
hiraganaIroha.range("ゑ", "す"); // ["ゑ", "ひ", "禮", "せ", "す"]
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

## 授權

MIT
