export type CyclicMode = "fixed" | "cyclic";

export interface SystemParseOptions {
  mode?: CyclicMode;
}

export interface IntegerParseOptions {
  strict?: boolean;
  preferBigInt?: boolean;
  heavenlyStemMode?: CyclicMode;
  earthlyBranchMode?: CyclicMode;
}

type IntegerLike = number | bigint;

interface DigitSet {
  zero: string;
  digits: [string, string, string, string, string, string, string, string, string];
  smallUnits: [string, string, string];
  bigUnits: string[];
}

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

const CANONICAL_DIGITS: Record<string, number> = {
  "零": 0,
  "〇": 0,
  "○": 0,
  "一": 1,
  "壹": 1,
  "二": 2,
  "貳": 2,
  "贰": 2,
  "兩": 2,
  "两": 2,
  "三": 3,
  "參": 3,
  "叁": 3,
  "四": 4,
  "肆": 4,
  "五": 5,
  "伍": 5,
  "六": 6,
  "陸": 6,
  "陆": 6,
  "七": 7,
  "柒": 7,
  "八": 8,
  "捌": 8,
  "九": 9,
  "玖": 9
};

const SMALL_UNITS: Record<string, bigint> = {
  十: 10n,
  拾: 10n,
  百: 100n,
  佰: 100n,
  千: 1000n,
  仟: 1000n
};

const TRAD_BIG_UNITS = [
  "萬",
  "億",
  "兆",
  "京",
  "垓",
  "秭",
  "穰",
  "溝",
  "澗",
  "正",
  "載",
  "極",
  "恆河沙",
  "阿僧祇",
  "那由他",
  "不可思議",
  "無量大數"
] as const;

const SIMP_BIG_UNITS = [
  "万",
  "亿",
  "兆",
  "京",
  "垓",
  "秭",
  "穰",
  "沟",
  "涧",
  "正",
  "载",
  "极",
  "恒河沙",
  "阿僧祇",
  "那由他",
  "不可思议",
  "无量大数"
] as const;

function buildFormalPositionalUnits(bigUnits: readonly string[]): string[] {
  const result = [""];
  for (const unit of bigUnits) {
    result.push("拾", "佰", "仟", unit);
  }
  return result;
}

function createBigUnitOrder(units: readonly string[]): Array<[string, bigint]> {
  return units
    .map((unit, index) => [unit, 10n ** BigInt((index + 1) * 4)] as [string, bigint])
    .reverse();
}

export const tradFormalPositionalUnits = buildFormalPositionalUnits(TRAD_BIG_UNITS);

const TRAD_INFORMAL_SET: DigitSet = {
  zero: "零",
  digits: ["一", "二", "三", "四", "五", "六", "七", "八", "九"],
  smallUnits: ["十", "百", "千"],
  bigUnits: [...TRAD_BIG_UNITS]
};

const TRAD_FORMAL_SET: DigitSet = {
  zero: "零",
  digits: ["壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"],
  smallUnits: ["拾", "佰", "仟"],
  bigUnits: [...TRAD_BIG_UNITS]
};

const SIMP_INFORMAL_SET: DigitSet = {
  zero: "零",
  digits: ["一", "二", "三", "四", "五", "六", "七", "八", "九"],
  smallUnits: ["十", "百", "千"],
  bigUnits: [...SIMP_BIG_UNITS]
};

const SIMP_FORMAL_SET: DigitSet = {
  zero: "零",
  digits: ["壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"],
  smallUnits: ["拾", "佰", "仟"],
  bigUnits: [...SIMP_BIG_UNITS]
};

const BIG_UNIT_ORDER = createBigUnitOrder(SIMP_BIG_UNITS);

function normalizeInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new SyntaxError("Empty string is not a valid number");
  }

  return trimmed
    .replace(/負|负/g, "-")
    .replace(/點|点/g, ".")
    .replace(/無量大數/g, "无量大数")
    .replace(/不可思議/g, "不可思议")
    .replace(/恆河沙/g, "恒河沙")
    .replace(/載/g, "载")
    .replace(/極/g, "极")
    .replace(/溝/g, "沟")
    .replace(/澗/g, "涧")
    .replace(/億/g, "亿")
    .replace(/萬/g, "万")
    .replace(/拾/g, "十")
    .replace(/佰/g, "百")
    .replace(/仟/g, "千");
}

function toBigInt(value: IntegerLike): bigint {
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

  return BigInt(result || "0");
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

function parseChineseInteger(raw: string): bigint {
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

  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
    return value;
  }

  return Number(value);
}

function validateStrictCharacters(input: string): void {
  const allowed = /^[0-9零〇○一二三四五六七八九十百千萬万億亿兆京垓秭穰溝沟澗涧正載载極极恆恒河沙阿僧祇那由他不思議议可無无量大數数點点壹貳贰參叁肆伍陸陆柒捌玖兩两拾佰仟負负.-]+$/;
  if (!allowed.test(input)) {
    throw new SyntaxError("Input contains unsupported characters in strict mode");
  }
}

function fromCycle(value: IntegerLike, chars: readonly string[], mode: CyclicMode): string {
  const asBigInt = toBigInt(value);
  const length = BigInt(chars.length);

  if (mode === "fixed") {
    if (asBigInt < 1n || asBigInt > length) {
      throw new RangeError(`Value must be in 1..${chars.length} when mode is fixed`);
    }
    return chars[Number(asBigInt - 1n)];
  }

  const normalized = ((asBigInt - 1n) % length + length) % length;
  return chars[Number(normalized)];
}

function parseCycle(input: string, chars: readonly string[], mode: CyclicMode): number {
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
  if (section === 0) {
    return "";
  }

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

function formatChineseInteger(value: IntegerLike, set: DigitSet): string {
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
      if (output) {
        pendingZero = true;
      }
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
    return formatChineseInteger(value, set);
  }

  const negative = value < 0;
  const source = String(Math.abs(value));
  const [intPart, fracPart] = source.split(".");

  if (!fracPart) {
    return formatChineseInteger(value, set);
  }

  const intText = formatChineseInteger(BigInt(intPart), set);
  let fracText = "";

  for (const ch of fracPart) {
    const digit = Number(ch);
    fracText += digit === 0 ? set.zero : set.digits[digit - 1];
  }

  const withSign = `${intText}點${fracText}`;
  return negative ? `負${withSign}` : withSign;
}

function parseValue(input: string, options: IntegerParseOptions = {}): number | bigint {
  const modeStem = options.heavenlyStemMode ?? "fixed";
  const modeBranch = options.earthlyBranchMode ?? "fixed";

  const stemIndex = STEMS.indexOf(input as (typeof STEMS)[number]);
  if (stemIndex >= 0) {
    return parseCycle(input, STEMS, modeStem);
  }

  const branchIndex = BRANCHES.indexOf(input as (typeof BRANCHES)[number]);
  if (branchIndex >= 0) {
    return parseCycle(input, BRANCHES, modeBranch);
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
    const [intRaw, fracRaw] = body.split(".");
    const intValue = intRaw ? parseChineseInteger(intRaw) : 0n;
    const fracValue = parseFractionDigits(fracRaw ?? "");

    if (intValue > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new RangeError("Decimal parse does not support integer part above MAX_SAFE_INTEGER");
    }

    const composed = Number(intValue) + fracValue;
    return negative ? -composed : composed;
  }

  const parsed = parseChineseInteger(body);
  const signed = negative ? -parsed : parsed;
  return toBestNumeric(signed, options.preferBigInt ?? false);
}

export const integer = {
  parseInt(input: string, options?: IntegerParseOptions): number | bigint {
    return parseValue(input, options);
  }
};

export const cjkIdeographic = {
  parse(value: IntegerLike): string {
    if (typeof value === "number" && !Number.isInteger(value)) {
      return formatDecimal(value, TRAD_INFORMAL_SET);
    }
    return formatChineseInteger(value, TRAD_INFORMAL_SET);
  }
};

export const tradChineseInformal = {
  parse(value: IntegerLike): string {
    if (typeof value === "number" && !Number.isInteger(value)) {
      return formatDecimal(value, TRAD_INFORMAL_SET);
    }
    return formatChineseInteger(value, TRAD_INFORMAL_SET);
  }
};

export const tradChineseFormal = {
  parse(value: IntegerLike): string {
    if (typeof value === "number" && !Number.isInteger(value)) {
      return formatDecimal(value, TRAD_FORMAL_SET);
    }
    return formatChineseInteger(value, TRAD_FORMAL_SET);
  }
};

export const simpChineseInformal = {
  parse(value: IntegerLike): string {
    if (typeof value === "number" && !Number.isInteger(value)) {
      return formatDecimal(value, SIMP_INFORMAL_SET);
    }
    return formatChineseInteger(value, SIMP_INFORMAL_SET);
  }
};

export const simpChineseFormal = {
  parse(value: IntegerLike): string {
    if (typeof value === "number" && !Number.isInteger(value)) {
      return formatDecimal(value, SIMP_FORMAL_SET);
    }
    return formatChineseInteger(value, SIMP_FORMAL_SET);
  }
};

export const cjkHeavenlyStem = {
  parse(value: IntegerLike, options: SystemParseOptions = {}): string {
    return fromCycle(value, STEMS, options.mode ?? "fixed");
  }
};

export const cjkEarthlyBranch = {
  parse(value: IntegerLike, options: SystemParseOptions = {}): string {
    return fromCycle(value, BRANCHES, options.mode ?? "fixed");
  }
};

export const systems = {
  heavenlyStem: STEMS,
  earthlyBranch: BRANCHES
};
