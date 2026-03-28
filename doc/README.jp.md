# cjk-number

アラビア数字と CJK（中日韓）数体系の間の相互変換を行うライブラリです。

以下のドメインをサポートしています：

- 繁体字および簡体字中国語数字
- 正字・略字（大字および小字）のバリエーション
- 十干と十二支
- 韓国語および日本語の数詞スタイル（漢字含む）
- 仮名順序体系（五十音およびいろは順）
- 負の数、小数、および非常に大きな BigInt 値

## インストール

```sh
npm install cjk-number
```

## 動作環境

- Node.js 18+
- ESM パッケージ

## クイックスタート

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

// 文字列をパース -> number / bigint / string
number.parse("一千零二十三"); // 1023
number.parse("壹仟零貳拾參"); // 1023
number.parse("負一百零二"); // -102
number.parse("一點二三"); // 1.23
number.parse("一無量大數", { mode: "preferBigInt" }); // 10n ** 68n
number.parse("一京點一", { mode: "exactDecimal" }); // "10000000000000000.1" (ロスレス)

// 数値をフォーマット -> CJK 文字列
cjkIdeographic.parse(1023); // "一千零二十三"
tradChineseFormal.parse(1023); // "壹仟零貳拾參"
simpChineseFormal.parse(1023); // "壹仟零贰拾叁"
koreanHangulFormal.parse(10n ** 68n); // "일무량대수"
japaneseFormal.parse(10n ** 68n); // "壱無量大数"

// CJK 文字列に対して直接算術演算を実行（正確な小数計算エンジン）
tradChineseInformal.add(["一兆", "一點五"]); // "一兆零一點五"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一億", "一億"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二點五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "十"); // "一千零二十四"
tradChineseInformal.abs("負一兆"); // "一兆"
["三十", "二", "十一"].sort(tradChineseInformal.compare); // ["二", "十一", "三十"]

// 十干と十二支
cjkHeavenlyStem.parse(10); // "癸"
cjkEarthlyBranch.parse(12); // "亥"

// 順序体系（仮名）
hiragana.parse(1); // "あ"
hiragana.parse(46); // "ん"
```

## API

### number.parse(input, options?)

CJK テキストを `number`、`bigint`、または正確な十進数文字列 `string` にパースします。

オプション：

| オプション | 型 | デフォルト | 説明 |
|---|---|---|---|
| `mode` | `"number" \| "preferBigInt" \| "exactDecimal"` | `"number"` | 出力される数値の型を制御します |
| `strict` | `boolean` | `false` | サポートされていない文字を早期に拒否します |
| `explicitTyping` | `ExplicitTyping` | `undefined` | 解析に使用する CJK 体系を明示的に指定します |

**`mode` の値：**

- `"number"` (デフォルト) — `number` を返します。整数が `Number.MAX_SAFE_INTEGER` を超える場合は自動的に `bigint` にプロモートされます。
- `"preferBigInt"` — 整数解析時は常に `bigint` を返します。
- `"exactDecimal"` — ロスレスな十進数文字列（例: `"10000000000000000.1"`）を返します。これにより、非常に大きな値と小数が混在する場合の `MAX_SAFE_INTEGER` 制限を回避できます。

**`explicitTyping` の値：**

- 利用可能な体系名（例: `"hiraganaIroha"`, `"tradChineseFormal"`, `"koreanHangulFormal"`）から選択して、パーサーにその体系のマップを強制的に使用させることができます。これは、同じ記号を共有する体系間（例: 五十音順 vs いろは順）の競合を解決するのに役立ちます。

例：

```js
number.parse("九千零七兆一", { mode: "preferBigInt" }); // 9007000000000001n
number.parse("ぬ", { explicitTyping: "hiraganaIroha" }); // 10
number.parse("ぬ"); // 23 (デフォルトの五十音順)
number.parse("一京點一", { mode: "exactDecimal" }); // "10000000000000000.1"
```

### フォーマッタ (Formatters)

すべてのフォーマッタは以下のメソッドを公開しています：

#### `parse(value)`

`number`、`bigint`、または正確な十進数文字列を CJK 数字文字列にフォーマットします。

#### 算術メソッド

すべての**数値用フォーマッタ**（順序・シーケンス用を除く）は、CJK 文字列を受け取って同じ体系の CJK 文字列を返す算術メソッドも公開しています：

```js
tradChineseInformal.add(["一千", "二十三"]); // "一千零二十三"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一億", "一億"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二點五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "三"); // "八"
tradChineseInformal.compare("三十", "二"); // 1
```

算術演算はすべて **依存関係ゼロの BigFloat エンジン** を使用しています。演算前に小数点は `BigInt` にスケーリングされるため、`"一兆" + "一點五"` のような結果も浮動小数点の誤差なく正確に計算されます。

#### シーケンス・メソッド

すべての順序体系（十干、十二支、仮名）は、順序の移動やデコードのためのメソッドも公開しています：

- `decode(symbol)`: 特定の順序における記号の 1 から始まる数値を返します。
- `next(symbol, count?)`: 順序内の次の記号を返します（循環します）。
- `prev(symbol, count?)`: 順序内の前の記号を返します（循環します）。
- `range(start, end)`: `start` から `end` までの記号の配列を返します（境界を含みます）。

例：

```js
hiraganaIroha.decode("ぬ"); // 10
hiragana.decode("ぬ"); // 23 (五十音順)

cjkHeavenlyStem.next("癸"); // "甲"
cjkEarthlyBranch.prev("子", 2); // "戌"
hiraganaIroha.range("ゑ", "す"); // ["ゑ", "ひ", "も", "せ", "す"]
```

利用可能なフォーマッタ：

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

## ライセンス

MIT
