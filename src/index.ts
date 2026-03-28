import {
	CyclicMode,
	SystemParseOptions,
	NumberParseOptions,
	NumberLike,
	DigitSet,
} from "./types.js";
import {
	STEMS,
	BRANCHES,
	KOREAN_HANGUL_DIGITS,
	KOREAN_HANJA_FORMAL_DIGITS,
	KOREAN_HANJA_INFORMAL_DIGITS,
	JAPANESE_FORMAL_DIGITS,
	JAPANESE_INFORMAL_DIGITS,
	HIRAGANA,
	HIRAGANA_IROHA,
	KATAKANA,
	KATAKANA_IROHA,
	SEQUENCE_SYMBOL_TO_NUMBER,
	CANONICAL_DIGITS,
	SMALL_UNITS,
	BIG_UNIT_ORDER,
	TRAD_INFORMAL_SET,
	TRAD_FORMAL_SET,
	SIMP_INFORMAL_SET,
	SIMP_FORMAL_SET,
	KOREAN_HANGUL_SET,
	KOREAN_HANJA_FORMAL_SET,
	KOREAN_HANJA_INFORMAL_SET,
	JAPANESE_FORMAL_SET,
	JAPANESE_INFORMAL_SET,
} from "./constants.js";

export * from "./types.js";

const NORMALIZE_MAP: Record<string, string> = {
  負: "-",
  负: "-",
  점: ".",
  點: ".",
  点: ".",
  무량대수: "无量大数",
  불가사의: "不可思议",
  나유타: "那由他",
  아승기: "阿僧祇",
  항하사: "恒河沙",
  재: "载",
  정: "正",
  간: "涧",
  양: "穰",
  자: "秭",
  해: "垓",
  경: "京",
  조: "兆",
  억: "亿",
  만: "万",
  천: "千",
  백: "百",
  십: "十",
  일: "一",
  이: "二",
  삼: "三",
  사: "四",
  오: "五",
  육: "六",
  칠: "七",
  팔: "八",
  구: "九",
  壱: "一",
  弐: "二",
  参: "三",
  無量大數: "无量大数",
  無量大数: "无量大数",
  不可思議: "不可思议",
  穣: "穰",
  恆河沙: "恒河沙",
  載: "载",
  極: "极",
  溝: "沟",
  澗: "涧",
  億: "亿",
  萬: "万",
  拾: "十",
  佰: "百",
  仟: "千",
};
const NORMALIZE_KEYS = Object.keys(NORMALIZE_MAP).sort(
  (a, b) => b.length - a.length,
);

function normalizeInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new SyntaxError("Empty string is not a valid number");
  }

  let result = "";
  let i = 0;

  while (i < trimmed.length) {
    let matched = false;

    for (const key of NORMALIZE_KEYS) {
      if (trimmed.startsWith(key, i)) {
        result += NORMALIZE_MAP[key];
        i += key.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result += trimmed[i];
      i += 1;
    }
  }

  return result;
}

function toBigInt(value: NumberLike): bigint {
  if (typeof value === "bigint") {
    return value;
  }
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new RangeError("Expected an integer value");
  }
  return BigInt(value);
}

function parseDigitsOnly(input: string): bigint {
  let result = "";
  for (const ch of input) {
    const digit = CANONICAL_DIGITS[ch];
    if (digit === undefined) {
      throw new SyntaxError(`Unexpected character ${ch} in digit sequence`);
    }
    result += String(digit);
  }

  return BigInt(result);
}

function parseSection(section: string): bigint {
  if (!section) {
    return 0n;
  }

  if (/^[0-9]+$/.test(section)) {
    return BigInt(section);
  }

  const hasSmallUnit = /十|百|千/.test(section);
  if (!hasSmallUnit) {
    return parseDigitsOnly(section);
  }

  let total = 0n;
  let currentDigit: bigint | null = null;

  for (const ch of section) {
    if (ch in CANONICAL_DIGITS) {
      currentDigit = BigInt(CANONICAL_DIGITS[ch]);
      continue;
    }

    const unit = SMALL_UNITS[ch];
    if (!unit) {
      throw new SyntaxError(`Unexpected character ${ch} in section`);
    }

    const effectiveDigit = currentDigit ?? 1n;
    total += effectiveDigit * unit;
    currentDigit = null;
  }

  if (currentDigit !== null) {
    total += currentDigit;
  }

  return total;
}

function parseChineseNumber(raw: string): bigint {
  if (/^[0-9]+$/.test(raw)) {
    return BigInt(raw);
  }

  let rest = raw;
  let total = 0n;

  for (const [unitChar, unitValue] of BIG_UNIT_ORDER) {
    const index = rest.indexOf(unitChar);
    if (index < 0) {
      continue;
    }

    const left = rest.slice(0, index);
    const right = rest.slice(index + unitChar.length);
    const sectionValue = left ? parseSection(left) : 1n;
    total += sectionValue * unitValue;
    rest = right;
  }

  total += parseSection(rest);
  return total;
}

function parseFractionDigits(raw: string): number {
  if (!raw) {
    throw new SyntaxError("Fraction part cannot be empty");
  }

  let decimal = "";
  for (const ch of raw) {
    if (/[0-9]/.test(ch)) {
      decimal += ch;
      continue;
    }

    const digit = CANONICAL_DIGITS[ch];
    if (digit === undefined) {
      throw new SyntaxError(`Unexpected character ${ch} in fraction part`);
    }

    decimal += String(digit);
  }

  return Number(`0.${decimal}`);
}

function toBestNumeric(value: bigint, preferBigInt: boolean): number | bigint {
  if (preferBigInt) {
    return value;
  }

  if (
    value > BigInt(Number.MAX_SAFE_INTEGER) ||
    value < BigInt(Number.MIN_SAFE_INTEGER)
  ) {
    return value;
  }

  return Number(value);
}

function validateStrictCharacters(input: string): void {
  const allowed =
    /^[0-9零〇○一二三四五六七八九十百千萬万億亿兆京垓秭穰溝沟澗涧正載载極极恆恒河沙阿僧祇那由他不思議议可無无量大數数點点점壹貳贰參叁肆伍陸陆柒捌玖兩两拾佰仟負负壱弐参ぁ-ゟ゠-ヿ가-힣.-]+$/;
  if (!allowed.test(input)) {
    throw new SyntaxError(
      "Input contains unsupported characters in strict mode",
    );
  }
}

function fromCycle(
  value: NumberLike,
  chars: readonly string[],
  mode: CyclicMode,
): string {
  const asBigInt = toBigInt(value);
  const length = BigInt(chars.length);

  if (mode === "fixed") {
    if (asBigInt < 1n || asBigInt > length) {
      throw new RangeError(
        `Value must be in 1..${chars.length} when mode is fixed`,
      );
    }
    return chars[Number(asBigInt - 1n)];
  }

  const normalized = (((asBigInt - 1n) % length) + length) % length;
  return chars[Number(normalized)];
}

function parseCycle(
  input: string,
  chars: readonly string[],
  mode: CyclicMode,
): number {
  const index = chars.indexOf(input);
  if (index < 0) {
    throw new SyntaxError(`Unknown symbol ${input}`);
  }

  const value = index + 1;
  if (mode === "fixed") {
    return value;
  }

  return value;
}

function formatSection(section: number, set: DigitSet): string {
  const values = [1000, 100, 10, 1];
  const units = [set.smallUnits[2], set.smallUnits[1], set.smallUnits[0], ""];
  let output = "";
  let pendingZero = false;

  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    const digit = Math.floor(section / value) % 10;

    if (digit === 0) {
      if (output) {
        pendingZero = true;
      }
      continue;
    }

    if (pendingZero) {
      output += set.zero;
      pendingZero = false;
    }

    const isTenPosition = value === 10;
    const canDropOne = isTenPosition && digit === 1 && output.length === 0;

    if (!canDropOne) {
      output += set.digits[digit - 1];
    }

    output += units[i];
  }

  return output;
}

function formatChineseNumber(value: NumberLike, set: DigitSet): string {
  const raw = toBigInt(value);
  if (raw === 0n) {
    return set.zero;
  }

  const negative = raw < 0n;
  let n = negative ? -raw : raw;
  const sections: number[] = [];

  while (n > 0n) {
    sections.push(Number(n % 10_000n));
    n /= 10_000n;
  }

  let output = "";
  let pendingZero = false;

  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (section === 0) {
      pendingZero = Boolean(output);
      continue;
    }

    if (output && (pendingZero || section < 1000)) {
      output += set.zero;
    }

    output += formatSection(section, set);

    if (i > 0) {
      const unit = set.bigUnits[i - 1];
      if (!unit) {
        throw new RangeError("Value exceeds supported big unit range");
      }
      output += unit;
    }

    pendingZero = false;
  }

  return negative ? `負${output}` : output;
}

function formatDecimal(value: number, set: DigitSet): string {
  if (!Number.isFinite(value)) {
    throw new RangeError("Expected a finite number");
  }

  if (Number.isInteger(value)) {
    return formatChineseNumber(value, set);
  }

  const negative = value < 0;
  const source = String(Math.abs(value));
  const [intPart, fracPart] = source.split(".");

  if (!fracPart) {
    return formatChineseNumber(value, set);
  }

  const intText = formatChineseNumber(BigInt(intPart), set);
  let fracText = "";

  for (const ch of fracPart) {
    const digit = Number(ch);
    fracText += digit === 0 ? set.zero : set.digits[digit - 1];
  }

  const withSign = `${intText}${set.point}${fracText}`;
  return negative ? `負${withSign}` : withSign;
}

function parseValue(
  input: string,
  options: NumberParseOptions = {},
): number | bigint {
  const modeStem = options.heavenlyStemMode ?? "fixed";
  const modeBranch = options.earthlyBranchMode ?? "fixed";

  try {
    return parseCycle(input, STEMS, modeStem);
  } catch {
    // Not a heavenly stem, continue to next parser.
  }

  try {
    return parseCycle(input, BRANCHES, modeBranch);
  } catch {
    // Not an earthly branch, continue to sequence/numeric parsing.
  }

  const sequenceValue = SEQUENCE_SYMBOL_TO_NUMBER[input];
  if (sequenceValue !== undefined) {
    return sequenceValue;
  }

  const normalized = normalizeInput(input);
  if (options.strict) {
    validateStrictCharacters(normalized);
  }

  const negative = normalized.startsWith("-");
  const body = negative ? normalized.slice(1) : normalized;

  if (!body) {
    throw new SyntaxError("Missing numeric content");
  }

  if (body.includes(".")) {
    const [intRaw, fracRaw = ""] = body.split(".");
    const intValue = intRaw ? parseChineseNumber(intRaw) : 0n;
    const fracValue = parseFractionDigits(fracRaw);

    if (intValue > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new RangeError(
        "Decimal parse does not support integer part above MAX_SAFE_INTEGER",
      );
    }

    const composed = Number(intValue) + fracValue;
    return negative ? -composed : composed;
  }

  const parsed = parseChineseNumber(body);
  const signed = negative ? -parsed : parsed;
  return toBestNumeric(signed, options.preferBigInt ?? false);
}

function createSystem(set: DigitSet) {
  return {
    parse(value: NumberLike): string {
      if (typeof value === "number") {
        return formatDecimal(value, set);
      }
      return formatChineseNumber(value, set);
    },
  };
}

function createCyclicSystem(chars: readonly string[]) {
  return {
    parse(value: NumberLike, options: SystemParseOptions = {}): string {
      return fromCycle(value, chars, options.mode ?? "fixed");
    },
  };
}

export const number = {
  parse(input: string, options?: NumberParseOptions): number | bigint {
    return parseValue(input, options);
  },
};

export const cjkIdeographic = createSystem(TRAD_INFORMAL_SET);
export const tradChineseInformal = createSystem(TRAD_INFORMAL_SET);
export const tradChineseFormal = createSystem(TRAD_FORMAL_SET);
export const simpChineseInformal = createSystem(SIMP_INFORMAL_SET);
export const simpChineseFormal = createSystem(SIMP_FORMAL_SET);
export const koreanHangulFormal = createSystem(KOREAN_HANGUL_SET);
export const koreanHanjaFormal = createSystem(KOREAN_HANJA_FORMAL_SET);
export const koreanHanjaInformal = createSystem(KOREAN_HANJA_INFORMAL_SET);
export const japaneseFormal = createSystem(JAPANESE_FORMAL_SET);
export const japaneseInformal = createSystem(JAPANESE_INFORMAL_SET);

export const cjkHeavenlyStem = createCyclicSystem(STEMS);
export const cjkEarthlyBranch = createCyclicSystem(BRANCHES);
export const hiragana = createCyclicSystem(HIRAGANA);
export const hiraganaIroha = createCyclicSystem(HIRAGANA_IROHA);
export const katakana = createCyclicSystem(KATAKANA);
export const katakanaIroha = createCyclicSystem(KATAKANA_IROHA);

export const systems = {
  heavenlyStem: STEMS,
  earthlyBranch: BRANCHES,
  koreanHangulFormal: KOREAN_HANGUL_DIGITS,
  koreanHanjaFormal: KOREAN_HANJA_FORMAL_DIGITS,
  koreanHanjaInformal: KOREAN_HANJA_INFORMAL_DIGITS,
  japaneseFormal: JAPANESE_FORMAL_DIGITS,
  japaneseInformal: JAPANESE_INFORMAL_DIGITS,
  hiragana: HIRAGANA,
  hiraganaIroha: HIRAGANA_IROHA,
  katakana: KATAKANA,
  katakanaIroha: KATAKANA_IROHA,
};
