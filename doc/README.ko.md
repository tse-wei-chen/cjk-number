# cjk-number

아라비아 숫자와 CJK(한중일) 수 체계 사이의 상호 변환을 위한 라이브러리입니다.

다음 영역을 지원합니다:

- 번체 및 간체 중국어 숫자
- 정식 및 비정식 변체(대문자 및 소문자)
- 천간(Heavenly Stems) 및 지지(Earthly Branches)
- 한국어 및 일본어 수사 스타일(한자 포함)
- 가나 순서 체계(오십음도 및 이로하 순)
- 음수, 소수, 그리고 매우 큰 BigInt 값

## 설치

```sh
npm install cjk-number
```

## 실행 환경

- Node.js 18+
- ESM 패키지

## 빠른 시작

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

// 문자열 파싱 -> number / bigint / string
number.parse("一千零二十三"); // 1023
number.parse("壹仟零貳拾參"); // 1023
number.parse("負一百零二"); // -102
number.parse("一點二三"); // 1.23
number.parse("一無量大數", { mode: "preferBigInt" }); // 10n ** 68n
number.parse("一京點一", { mode: "exactDecimal" }); // "10000000000000000.1" (무손실)

// 숫자 포맷팅 -> CJK 문자열
cjkIdeographic.parse(1023); // "一千零二十三"
tradChineseFormal.parse(1023); // "壹仟零貳拾參"
simpChineseFormal.parse(1023); // "壹仟零贰拾叁"
koreanHangulFormal.parse(10n ** 68n); // "일무량대수"
japaneseFormal.parse(10n ** 68n); // "壱無量大数"

// CJK 문자열에 대해 직접 산술 연산 실행(정밀 소수 계산 엔진)
tradChineseInformal.add(["一兆", "一點五"]); // "一兆零一點五"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一億", "一億"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二點五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "十"); // "一千零二十四"
tradChineseInformal.abs("負一兆"); // "一兆"
["三十", "二", "十一"].sort(tradChineseInformal.compare); // ["二", "十一", "三十"]

// 천간 및 지지
cjkHeavenlyStem.parse(10); // "癸"
cjkEarthlyBranch.parse(12); // "亥"

// 순서 체계(가나)
hiragana.parse(1); // "あ"
hiragana.parse(46); // "ん"
```

## API

### number.parse(input, options?)

CJK 텍스트를 `number`, `bigint`, 또는 정밀 10진수 문자열 `string`으로 파싱합니다.

옵션:

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `mode` | `"number" \| "preferBigInt" \| "exactDecimal"` | `"number"` | 출력되는 숫자의 타입을 제어합니다 |
| `strict` | `boolean` | `false` | 지원되지 않는 문자를 조기에 거부합니다 |
| `explicitTyping` | `ExplicitTyping` | `undefined` | 파싱에 사용할 CJK 체계를 명시적으로 지정합니다 |

**`mode` 값:**

- `"number"` (기본값) — `number`를 반환합니다. 정수가 `Number.MAX_SAFE_INTEGER`를 초과하면 자동으로 `bigint`로 승격됩니다.
- `"preferBigInt"` — 정수 파싱 시 항상 `bigint`를 반환합니다.
- `"exactDecimal"` — 무손실 10진수 문자열(예: `"10000000000000000.1"`)을 반환합니다. 이는 매우 큰 값과 소수가 섞인 경우의 `MAX_SAFE_INTEGER` 제한을 우회하는 데 유용합니다.

**`explicitTyping` 값:**

- 사용 가능한 체계 이름(예: `"hiraganaIroha"`, `"tradChineseFormal"`, `"koreanHangulFormal"`) 중에서 선택하여 파서가 해당 체계의 맵을 강제로 사용하게 할 수 있습니다. 이는 동일한 기호를 공유하는 체계 간(예: 오십음도 vs 이로하 순)의 충돌을 해결하는 데 도움이 됩니다.

예제:

```js
number.parse("九千零七兆一", { mode: "preferBigInt" }); // 9007000000000001n
number.parse("ぬ", { explicitTyping: "hiraganaIroha" }); // 10
number.parse("ぬ"); // 23 (기본 오십음도 순서)
number.parse("一京點一", { mode: "exactDecimal" }); // "10000000000000000.1"
```

### 포맷터 (Formatters)

모든 포맷터는 다음 메서드를 제공합니다:

#### `parse(value)`

`number`, `bigint`, 또는 정밀 10진수 문자열을 CJK 숫자 문자열로 포맷팅합니다.

#### 산술 메서드

모든 **숫자용 포맷터**(순서/시퀀스용 제외)는 CJK 문자열을 입력받아 동일한 체계의 CJK 문자열을 반환하는 산술 메서드를 제공합니다:

```js
tradChineseInformal.add(["一千", "二十三"]); // "一千零二十三"
tradChineseInformal.subtract(["一京", "一兆"]); // "九千九百九十九兆"
tradChineseInformal.multiply(["一億", "一億"]); // "一京"
tradChineseInformal.divide(["五", "二"]); // "二點五"
tradChineseInformal.modulo("五", "二"); // "一"
tradChineseInformal.pow("二", "三"); // "八"
tradChineseInformal.compare("三十", "二"); // 1
```

모든 산술 연산은 **의존성 없는 BigFloat 엔진**을 사용합니다. 연산 전에 소수점은 `BigInt`로 스케일링되므로, `"一兆" + "一點五"`와 같은 결과도 부동 소수점 오차 없이 정확하게 계산됩니다.

#### 시퀀스 메서드

모든 순서 체계(천간, 지지, 가나)는 순서 이동 및 디코딩을 위한 메서드를 제공합니다:

- `decode(symbol)`: 특정 순서에서 기호의 1부터 시작하는 위치 값을 반환합니다.
- `next(symbol, count?)`: 순서상의 다음 기호를 반환합니다(순환합니다).
- `prev(symbol, count?)`: 순서상의 이전 기호를 반환합니다(순환합니다).
- `range(start, end)`: `start`부터 `end`까지의 기호 배열을 반환합니다(경계 포함).

예제:

```js
hiraganaIroha.decode("ぬ"); // 10
hiragana.decode("ぬ"); // 23 (오십음도 순)

cjkHeavenlyStem.next("癸"); // "甲"
cjkEarthlyBranch.prev("子", 2); // "戌"
hiraganaIroha.range("ゑ", "す"); // ["ゑ", "ひ", "모", "세", "す"]
```

사용 가능한 포맷터:

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

## 라이선스

MIT
