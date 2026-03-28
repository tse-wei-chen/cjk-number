import { DigitArray9, DigitSet } from "./types.js";

function toDigitArray9(str: string): DigitArray9 {
  const chars = str.split("");
  if (chars.length !== 9) {
    throw new Error(`Invalid digit string length: expected 9, got ${chars.length}`);
  }
  return chars as unknown as DigitArray9;
}
export const TRAD_INFORMAL_DIGITS = toDigitArray9("一二三四五六七八九");
export const SIMP_INFORMAL_DIGITS = toDigitArray9("一二三四五六七八九");
export const TRAD_FORMAL_DIGITS = toDigitArray9("壹貳參肆伍陸柒捌玖");
export const SIMP_FORMAL_DIGITS = toDigitArray9("壹贰叁肆伍陆柒捌玖");
export const KOREAN_HANGUL_DIGITS = toDigitArray9("일이삼사오육칠팔구");
export const KOREAN_HANJA_FORMAL_DIGITS = toDigitArray9("壹貳參四五六七八九");
export const KOREAN_HANJA_INFORMAL_DIGITS = toDigitArray9("一二三四五六七八九");
export const JAPANESE_FORMAL_DIGITS = toDigitArray9("壱弍参四伍六七八九");
export const JAPANESE_INFORMAL_DIGITS = toDigitArray9("一二三四五六七八九");

export const STEMS = ("甲乙丙丁戊己庚辛壬癸").split("");
export const BRANCHES = ("子丑寅卯辰巳午未申酉戌亥").split("");
export const HIRAGANA = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん".split("");
export const HIRAGANA_IROHA = "いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす".split("");
export const KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split("");
export const KATAKANA_IROHA = "イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス".split("");
export const KOREAN_BIG_UNITS = "만,억,조,경,해,자,양,구,간,정,재,극,항하사,아승기,나유타,불가사의,무량대수".split(",");
export const JAPANESE_BIG_UNITS = "万,億,兆,京,垓,秭,穣,溝,澗,正,載,極,恒河沙,阿僧祇,那由他,不可思議,無量大数".split(",");
export const TRAD_BIG_UNITS = "萬,億,兆,京,垓,秭,穰,溝,澗,正,載,極,恆河沙,阿僧祇,那由他,不可思議,無量大數".split(",");
export const SIMP_BIG_UNITS = "万,亿,兆,京,垓,秭,穰,沟,涧,正,载,极,恒河沙,阿僧祇,那由他,不可思议,无量大数".split(",");
let cachedMap: Record<string, number> | undefined;

export function getSequenceMap(): Record<string, number> {
  if (cachedMap) return cachedMap;
  const map: Record<string, number> = {};
  const put = (chars: readonly string[]) => {
    chars.forEach((char, index) => {
      if (map[char] === undefined) {
        map[char] = index + 1;
      }
    });
  };

  put(STEMS);
  put(BRANCHES);
  put(HIRAGANA);
  put(HIRAGANA_IROHA);
  put(KATAKANA);
  put(KATAKANA_IROHA);
  return (cachedMap = map);
}

export const CANONICAL_DIGITS: Record<string, number> = {
  零: 0,
  영: 0,
  령: 0,
  〇: 0,
  "○": 0,
  一: 1,
  壹: 1,
  二: 2,
  貳: 2,
  贰: 2,
  兩: 2,
  两: 2,
  三: 3,
  參: 3,
  叁: 3,
  四: 4,
  肆: 4,
  五: 5,
  伍: 5,
  六: 6,
  陸: 6,
  陆: 6,
  七: 7,
  柒: 7,
  八: 8,
  捌: 8,
  九: 9,
  玖: 9,
};

export const SMALL_UNITS: Record<string, bigint> = {
  十: 10n,
  拾: 10n,
  百: 100n,
  佰: 100n,
  千: 1000n,
  仟: 1000n,
};

function createBigUnitOrder(units: readonly string[]): Array<[string, bigint]> {
  return units
    .map(
      (unit, index) =>
        [unit, 10n ** BigInt((index + 1) * 4)] as [string, bigint],
    )
    .reverse();
}

export const TRAD_INFORMAL_SET: DigitSet = {
  zero: "零",
  point: "點",
  digits: TRAD_INFORMAL_DIGITS,
  smallUnits: ["十", "百", "千"],
  bigUnits: [...TRAD_BIG_UNITS],
  dropTenOne: true,
};

export const TRAD_FORMAL_SET: DigitSet = {
  zero: "零",
  point: "點",
  digits: TRAD_FORMAL_DIGITS,
  smallUnits: ["拾", "佰", "仟"],
  bigUnits: [...TRAD_BIG_UNITS],
  dropTenOne: false,
};

export const SIMP_INFORMAL_SET: DigitSet = {
  zero: "零",
  point: "点",
  digits: SIMP_INFORMAL_DIGITS,
  smallUnits: ["十", "百", "千"],
  bigUnits: [...SIMP_BIG_UNITS],
  dropTenOne: true,
};

export const SIMP_FORMAL_SET: DigitSet = {
  zero: "零",
  point: "点",
  digits: SIMP_FORMAL_DIGITS,
  smallUnits: ["拾", "佰", "仟"],
  bigUnits: [...SIMP_BIG_UNITS],
  dropTenOne: false,
};

export const KOREAN_HANGUL_SET: DigitSet = {
  zero: "영",
  point: "점",
  digits: KOREAN_HANGUL_DIGITS,
  smallUnits: ["십", "백", "천"],
  bigUnits: [...KOREAN_BIG_UNITS],
  dropTenOne: false,
};

export const KOREAN_HANJA_FORMAL_SET: DigitSet = {
  zero: "零",
  point: "점",
  digits: KOREAN_HANJA_FORMAL_DIGITS,
  smallUnits: ["拾", "佰", "仟"],
  bigUnits: [...TRAD_BIG_UNITS],
  dropTenOne: false,
};

export const KOREAN_HANJA_INFORMAL_SET: DigitSet = {
  zero: "零",
  point: "점",
  digits: KOREAN_HANJA_INFORMAL_DIGITS,
  smallUnits: ["十", "百", "千"],
  bigUnits: [...TRAD_BIG_UNITS],
  dropTenOne: true,
};

export const JAPANESE_FORMAL_SET: DigitSet = {
  zero: "零",
  point: "点",
  digits: JAPANESE_FORMAL_DIGITS,
  smallUnits: ["拾", "百", "千"],
  bigUnits: [...JAPANESE_BIG_UNITS],
  dropTenOne: false,
};

export const JAPANESE_INFORMAL_SET: DigitSet = {
  zero: "零",
  point: "点",
  digits: JAPANESE_INFORMAL_DIGITS,
  smallUnits: ["十", "百", "千"],
  bigUnits: [...JAPANESE_BIG_UNITS],
  dropTenOne: true,
};

export const BIG_UNIT_ORDER = createBigUnitOrder(SIMP_BIG_UNITS);
export interface ScaledValue {
  big: bigint;
  scale: number;
}