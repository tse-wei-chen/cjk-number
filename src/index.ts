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
  弍: "二",
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
  if (typeof value === "bigint") return value;
  if (typeof value === "string") return BigInt(value);
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

function parseFractionDigits(raw: string): string {
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

  return decimal;
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
    const canDropOne = isTenPosition && digit === 1 && output.length === 0 && (set.dropTenOne ?? true);

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

function formatDecimal(value: NumberLike, set: DigitSet): string {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new RangeError("Expected a finite number");
  }

  const source = String(value);
  const negative = source.startsWith("-");
  const absSource = negative ? source.slice(1) : source;
  const [intPart = "0", fracPart] = absSource.split(".");

  if (!fracPart) {
    return formatChineseNumber(BigInt(intPart), set);
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
): number | bigint | string {
  const modeStem = options.heavenlyStemMode ?? "fixed";
  const modeBranch = options.earthlyBranchMode ?? "fixed";
  const explicit = options.explicitTyping;

  if (explicit === "cjkHeavenlyStem") {
    return parseCycle(input, STEMS, modeStem);
  }
  if (explicit === "cjkEarthlyBranch") {
    return parseCycle(input, BRANCHES, modeBranch);
  }
  if (explicit === "hiragana") {
    const idx = (HIRAGANA as readonly string[]).indexOf(input);
    if (idx >= 0) return idx + 1;
  }
  if (explicit === "hiraganaIroha") {
    const idx = (HIRAGANA_IROHA as readonly string[]).indexOf(input);
    if (idx >= 0) return idx + 1;
  }
  if (explicit === "katakana") {
    const idx = (KATAKANA as readonly string[]).indexOf(input);
    if (idx >= 0) return idx + 1;
  }
  if (explicit === "katakanaIroha") {
    const idx = (KATAKANA_IROHA as readonly string[]).indexOf(input);
    if (idx >= 0) return idx + 1;
  }

  // Handle other explicit numeric systems by validating characters?
  // Or just fall through if not a sequence symbol.

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
    const fracDigits = parseFractionDigits(fracRaw);

    if (options.mode === "exactDecimal") {
      // Exact path: return a lossless decimal string.
      const exact = `${intValue}.${fracDigits}`;
      return negative ? `-${exact}` : exact;
    }

    // Legacy path: fall back to Number (may lose precision for very large integers).
    if (intValue > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new RangeError(
        "Decimal parse does not support integer part above MAX_SAFE_INTEGER. Use { mode: \"exactDecimal\" } to bypass.",
      );
    }

    const composed = Number(intValue) + Number(`0.${fracDigits}`);
    return negative ? -composed : composed;
  }

  const parsed = parseChineseNumber(body);
  const signed = negative ? -parsed : parsed;
  return toBestNumeric(signed, options.mode === "preferBigInt");
}

function toScaleFormat(val: NumberLike) {
  const str = String(val);
  const isNeg = str.startsWith("-");
  const abs = isNeg ? str.slice(1) : str;
  const parts = abs.split(".");
  return {
    intPart: parts[0] || "0",
    fracPart: parts[1] || "",
    isNeg,
  };
}

function alignScales(a: NumberLike, b: NumberLike) {
  const parsedA = toScaleFormat(a);
  const parsedB = toScaleFormat(b);
  const maxDec = Math.max(parsedA.fracPart.length, parsedB.fracPart.length);

  const strA = parsedA.intPart + parsedA.fracPart.padEnd(maxDec, "0");
  const strB = parsedB.intPart + parsedB.fracPart.padEnd(maxDec, "0");

  const bigA = BigInt(strA) * (parsedA.isNeg ? -1n : 1n);
  const bigB = BigInt(strB) * (parsedB.isNeg ? -1n : 1n);

  return { bigA, bigB, scale: maxDec };
}

function applyScale(val: bigint, scale: number): string {
  let str = (val < 0n ? -val : val).toString();
  if (scale === 0) return (val < 0n ? "-" : "") + str;

  str = str.padStart(scale + 1, "0");
  const intPart = str.slice(0, -scale);
  const fracPart = str.slice(-scale).replace(/0+$/, "");

  const joined = fracPart ? `${intPart || "0"}.${fracPart}` : (intPart || "0");
  return (val < 0n ? "-" : "") + joined;
}

function mixedAdd(a: NumberLike, b: NumberLike): NumberLike {
  const { bigA, bigB, scale } = alignScales(a, b);
  return applyScale(bigA + bigB, scale);
}

function mixedSubtract(a: NumberLike, b: NumberLike): NumberLike {
  const { bigA, bigB, scale } = alignScales(a, b);
  return applyScale(bigA - bigB, scale);
}

function mixedMultiply(a: NumberLike, b: NumberLike): NumberLike {
  const { bigA, bigB, scale } = alignScales(a, b);
  return applyScale(bigA * bigB, scale * 2);
}

function mixedDivide(a: NumberLike, b: NumberLike): NumberLike {
  const { bigA, bigB } = alignScales(a, b);
  if (bigB === 0n) throw new RangeError("Division by zero");
  
  const EXTRA = 16n;
  const result = (bigA * (10n ** EXTRA)) / bigB;
  return applyScale(result, Number(EXTRA));
}

function mixedModulo(a: NumberLike, b: NumberLike): NumberLike {
  const { bigA, bigB, scale } = alignScales(a, b);
  return applyScale(bigA % bigB, scale);
}

function mixedPow(base: NumberLike, exponent: NumberLike): NumberLike {
  const parsedExp = toScaleFormat(exponent);
  if (parsedExp.fracPart.length > 0) return Number(base) ** Number(exponent);
  const expNum = BigInt(parsedExp.intPart) * (parsedExp.isNeg ? -1n : 1n);
  if (expNum < 0n) return Number(base) ** Number(exponent);

  const parsedBase = toScaleFormat(base);
  const baseBig = BigInt(parsedBase.intPart + parsedBase.fracPart);
  const scale = parsedBase.fracPart.length * Number(expNum);
  
  const result = baseBig ** expNum;
  return applyScale(parsedBase.isNeg && expNum % 2n !== 0n ? -result : result, scale);
}

function mixedCompare(a: NumberLike, b: NumberLike): number {
  const { bigA, bigB } = alignScales(a, b);
  return bigA > bigB ? 1 : bigA < bigB ? -1 : 0;
}

function createSystem(set: DigitSet) {
  return {
    /**
     * Formats a numeric value into the specific CJK numeral system.
     *
     * @param value The number or bigint to format.
     * @returns The formatted string representation in the respective CJK system.
     */
    parse(value: NumberLike): string {
      if (String(value).includes(".")) {
        return formatDecimal(value, set);
      }
      return formatChineseNumber(value, set);
    },
    /**
     * Adds multiple CJK numeric strings together.
     * @param values The CJK numeric strings to add.
     * @returns The sum of the CJK numeric strings.
     */
    add(values: string[]): string {
      if (values.length === 0) {
        return set.zero;
      }
      const [first, ...rest] = values.map((v) => number.parse(v));
      const sum = rest.reduce(mixedAdd, first);
      return this.parse(sum);
    },
    /**
     * Subtracts multiple CJK numeric strings from the first one.
     * @param values The CJK numeric strings to subtract.
     * @returns The difference of the CJK numeric strings.
     */
    subtract(values: string[]): string {
      if (values.length === 0) {
        return set.zero;
      }
      const [first, ...rest] = values.map((v) => number.parse(v));
      const diff = rest.reduce(mixedSubtract, first);
      return this.parse(diff);
    },
    /**
     * Multiplies multiple CJK numeric strings together.
     * @param values The CJK numeric strings to multiply.
     * @returns The product of the CJK numeric strings.
     */
    multiply(values: string[]): string {
      if (values.length === 0) {
        return set.zero;
      }
      const [first, ...rest] = values.map((v) => number.parse(v));
      const product = rest.reduce(mixedMultiply, first);
      return this.parse(product);
    },
    /**
     * Divides multiple CJK numeric strings from the first one.
     * @param values The CJK numeric strings to divide.
     * @returns The quotient of the CJK numeric strings.
     */
    divide(values: string[]): string {
      if (values.length === 0) {
        return set.zero;
      }
      const [first, ...rest] = values.map((v) => number.parse(v));
      const quotient = rest.reduce(mixedDivide, first);
      return this.parse(quotient);
    },
    /**
     * Calculates the remainder of the first string divided by the second.
     */
    modulo(a: string, b: string): string {
      const numA = number.parse(a);
      const numB = number.parse(b);
      return this.parse(mixedModulo(numA, numB));
    },
    /**
     * Raises the first string to the power of the second string or a number.
     */
    pow(base: string, exponent: string | number): string {
      const numBase = number.parse(base);
      const numExp = typeof exponent === "string" ? number.parse(exponent) : exponent;
      return this.parse(mixedPow(numBase, numExp));
    },
    /**
     * Returns the absolute value of the string.
     */
    abs(value: string): string {
      const num = number.parse(value);
      if (typeof num === "bigint") {
        return this.parse(num < 0n ? -num : num);
      }
      if (typeof num === "string") {
        return this.parse(num.startsWith("-") ? num.slice(1) : num);
      }
      return this.parse(Math.abs(num));
    },
    /**
     * Compares two strings. Useful for Array.prototype.sort().
     * @returns 1 if a > b, -1 if a < b, 0 if equal.
     */
    compare(a: string, b: string): number {
      const numA = number.parse(a);
      const numB = number.parse(b);
      return mixedCompare(numA, numB);
    },
  };
}

function createCyclicSystem(chars: readonly string[]) {
  return {
    /**
     * Formats a numeric value into the corresponding character of the cyclic sequence.
     *
     * @param value The number or bigint to format.
     * @param options Options defining how to handle sequence boundaries (e.g., 'fixed' or 'cyclic' mode).
     * @returns The character mapped to the specific sequence position.
     */
    parse(value: NumberLike, options: SystemParseOptions = {}): string {
      return fromCycle(value, chars, options.mode ?? "fixed");
    },
  };
}

export const number = {
  /**
   * Parses a CJK numeric string into a number, bigint, or exact decimal string.
   *
   * @param input The CJK numeric string to parse.
   * @param options Options defining how to handle the parse.
   *   - `mode: "preferBigInt"` – return `bigint` for integers.
   *   - `mode: "exactDecimal"` – return decimals as lossless strings, bypassing float limits.
   * @returns The parsed number, bigint, or exact decimal string.
   */
  parse(input: string, options?: NumberParseOptions): number | bigint | string {
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
