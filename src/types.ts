/**
 * Controls the cyclic mode of the heavenly stem and earthly branch.
 * - `"fixed"` – always return fixed heavenly stem and earthly branch characters.
 * - `"cyclic"` – return cyclic heavenly stem and earthly branch characters.
 */
export type CyclicMode = "fixed" | "cyclic";

/**
 * Options for parsing CJK text into a number.
 */
export interface SystemParseOptions {
  mode?: CyclicMode;
}

/**
 * Controls the numeric output type of `number.parse`.
 * - `"number"`       – always return a JS `number` (default).
 * - `"preferBigInt"` – return `bigint` for integers; `number` only for decimals.
 * - `"exactDecimal"` – return decimals as a lossless string (e.g. `"10000000000000000.5"`),
 *                      bypassing JS float precision limits. Integers still return `bigint`.
 */
export type NumberMode = "number" | "preferBigInt" | "exactDecimal";

/**
 * Controls the explicit typing of the output.
 * - `"cjkIdeographic"` – always return CJK ideographic characters.
 * - `"tradChineseInformal"` – always return traditional Chinese informal characters.
 * - `"tradChineseFormal"` – always return traditional Chinese formal characters.
 * - `"simpChineseInformal"` – always return simplified Chinese informal characters.
 * - `"simpChineseFormal"` – always return simplified Chinese formal characters.
 * - `"cjkHeavenlyStem"` – always return CJK heavenly stem characters.
 * - `"cjkEarthlyBranch"` – always return CJK earthly branch characters.
 * - `"koreanHangulFormal"` – always return Korean hangul formal characters.
 * - `"koreanHanjaFormal"` – always return Korean hanja formal characters.
 * - `"koreanHanjaInformal"` – always return Korean hanja informal characters.
 * - `"japaneseFormal"` – always return Japanese formal characters.
 * - `"japaneseInformal"` – always return Japanese informal characters.
 * - `"hiragana"` – always return hiragana characters.
 * - `"hiraganaIroha"` – always return hiragana iroha characters.
 * - `"katakana"` – always return katakana characters.
 * - `"katakanaIroha"` – always return katakana iroha characters.
 */
export type ExplicitTyping = "cjkIdeographic" | "tradChineseInformal" | "tradChineseFormal" | "simpChineseInformal" | "simpChineseFormal" | "cjkHeavenlyStem" | "cjkEarthlyBranch" | "koreanHangulFormal" | "koreanHanjaFormal" | "koreanHanjaInformal" | "japaneseFormal" | "japaneseInformal" | "hiragana" | "hiraganaIroha" | "katakana" | "katakanaIroha";

export interface NumberParseOptions {
  /** Controls whether to reject unsupported characters early. Defaults to `false`. */
  strict?: boolean;
  /** Controls the numeric output type. Defaults to `"number"`. */
  mode?: NumberMode;
  /**
   * Controls the explicit typing of the output.
   * - `"cjkIdeographic"` – always return CJK ideographic characters.
   * - `"tradChineseInformal"` – always return traditional Chinese informal characters.
   * - `"tradChineseFormal"` – always return traditional Chinese formal characters.
   * - `"simpChineseInformal"` – always return simplified Chinese informal characters.
   * - `"simpChineseFormal"` – always return simplified Chinese formal characters.
   * - `"cjkHeavenlyStem"` – always return CJK heavenly stem characters.
   * - `"cjkEarthlyBranch"` – always return CJK earthly branch characters.
   * - `"koreanHangulFormal"` – always return Korean hangul formal characters.
   * - `"koreanHanjaFormal"` – always return Korean hanja formal characters.
   * - `"koreanHanjaInformal"` – always return Korean hanja informal characters.
   * - `"japaneseFormal"` – always return Japanese formal characters.
   * - `"japaneseInformal"` – always return Japanese informal characters.
   * - `"hiragana"` – always return hiragana characters.
   * - `"hiraganaIroha"` – always return hiragana iroha characters.
   * - `"katakana"` – always return katakana characters.
   * - `"katakanaIroha"` – always return katakana iroha characters.
   */
  explicitTyping?: ExplicitTyping;
}

export type NumberLike = number | bigint | string;

export type DigitArray9 = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export interface DigitSet {
  zero: string;
  point: string;
  digits: DigitArray9;
  smallUnits: [string, string, string];
  bigUnits: string[];
  dropTenOne?: boolean;
}

export interface ScaledValue {
  big: bigint;
  scale: number;
}