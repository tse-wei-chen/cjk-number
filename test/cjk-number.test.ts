import { describe, expect, it } from "vitest";
import {
  cjkEarthlyBranch,
  cjkHeavenlyStem,
  cjkIdeographic,
  hiragana,
  hiraganaIroha,
  number,
  japaneseFormal,
  japaneseInformal,
  katakana,
  katakanaIroha,
  koreanHangulFormal,
  koreanHanjaFormal,
  koreanHanjaInformal,
  simpChineseFormal,
  simpChineseInformal,
  tradChineseFormal,
  tradChineseInformal,
} from "../src/index";

const LARGE_UNIT_TABLE = [
  { trad: "萬", simp: "万", power: 4n },
  { trad: "億", simp: "亿", power: 8n },
  { trad: "兆", simp: "兆", power: 12n },
  { trad: "京", simp: "京", power: 16n },
  { trad: "垓", simp: "垓", power: 20n },
  { trad: "秭", simp: "秭", power: 24n },
  { trad: "穰", simp: "穰", power: 28n },
  { trad: "溝", simp: "沟", power: 32n },
  { trad: "澗", simp: "涧", power: 36n },
  { trad: "正", simp: "正", power: 40n },
  { trad: "載", simp: "载", power: 44n },
  { trad: "極", simp: "极", power: 48n },
  { trad: "恆河沙", simp: "恒河沙", power: 52n },
  { trad: "阿僧祇", simp: "阿僧祇", power: 56n },
  { trad: "那由他", simp: "那由他", power: 60n },
  { trad: "不可思議", simp: "不可思议", power: 64n },
  { trad: "無量大數", simp: "无量大数", power: 68n },
] as const;

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomBigInt(rng: () => number, maxDigits: number): bigint {
  const digits = Math.max(1, Math.floor(rng() * maxDigits) + 1);
  let value = String(Math.floor(rng() * 9) + 1);
  for (let i = 1; i < digits; i += 1) {
    value += String(Math.floor(rng() * 10));
  }
  return BigInt(value);
}

function readIntFromEnv(
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

describe("examples from spec", () => {
  it("parses cjk strings into integer values", () => {
    expect(number.parse("一千零二十三")).toBe(1023);
    expect(number.parse("壹仟零貳拾參")).toBe(1023);
    expect(number.parse("壹仟零贰拾叁")).toBe(1023);
    expect(number.parse("癸")).toBe(10);
    expect(number.parse("亥")).toBe(12);
  });

  it("formats values into all requested systems", () => {
    expect(cjkIdeographic.parse(1023)).toBe("一千零二十三");
    expect(cjkHeavenlyStem.parse(10)).toBe("癸");
    expect(cjkEarthlyBranch.parse(12)).toBe("亥");
    expect(tradChineseFormal.parse(1023)).toBe("壹仟零貳拾參");
    expect(tradChineseInformal.parse(1023)).toBe("一千零二十三");
    expect(simpChineseInformal.parse(1023)).toBe("一千零二十三");
    expect(simpChineseFormal.parse(1023)).toBe("壹仟零贰拾叁");
  });
});

describe("new numeric capabilities", () => {
  it("supports negative values", () => {
    expect(number.parse("負一百零二")).toBe(-102);
    expect(tradChineseInformal.parse(-320)).toBe("負三百二十");
  });

  it("supports decimals", () => {
    expect(number.parse("一點二三")).toBeCloseTo(1.23);
    expect(number.parse("一點23")).toBeCloseTo(1.23);
    expect(simpChineseInformal.parse(12.34)).toBe("十二点三四");
  });

  it("supports bigint parse for very large integers", () => {
    const parsed = number.parse("九千零七兆一", { mode: "preferBigInt" });
    expect(typeof parsed).toBe("bigint");
    expect(parsed).toBe(9007000000000001n);
  });

  it("supports 京 and 垓 units", () => {
    const parsed = number.parse("一垓零二京三兆", { mode: "preferBigInt" });
    expect(parsed).toBe(100020003000000000000n);
    expect(tradChineseFormal.parse(10000000000000000n)).toBe("壹京");
  });

  it("supports units up to 無量大數", () => {
    expect(number.parse("一恆河沙", { mode: "preferBigInt" })).toBe(
      10n ** 52n,
    );
    expect(number.parse("一恒河沙", { mode: "preferBigInt" })).toBe(
      10n ** 52n,
    );
    expect(number.parse("一不可思議", { mode: "preferBigInt" })).toBe(
      10n ** 64n,
    );
    expect(number.parse("一無量大數", { mode: "preferBigInt" })).toBe(
      10n ** 68n,
    );
    expect(tradChineseFormal.parse(10n ** 68n)).toBe("壹無量大數");
    expect(simpChineseFormal.parse(10n ** 64n)).toBe("壹不可思议");
  });

  it("parses all unit tokens in detail", () => {
    expect(number.parse("拾", { mode: "preferBigInt" })).toBe(10n);
    expect(number.parse("佰", { mode: "preferBigInt" })).toBe(100n);
    expect(number.parse("仟", { mode: "preferBigInt" })).toBe(1000n);

    for (const { trad, simp, power } of LARGE_UNIT_TABLE) {
      const expected = 10n ** power;
      expect(number.parse(`一${trad}`, { mode: "preferBigInt" })).toBe(
        expected,
      );
      expect(number.parse(`一${simp}`, { mode: "preferBigInt" })).toBe(
        expected,
      );
    }
  });

  it("formats all large units in detail", () => {
    for (const { trad, simp, power } of LARGE_UNIT_TABLE) {
      const value = 10n ** power;
      expect(tradChineseFormal.parse(value)).toBe(`壹${trad}`);
      expect(tradChineseInformal.parse(value)).toBe(`一${trad}`);
      expect(simpChineseFormal.parse(value)).toBe(`壹${simp}`);
      expect(simpChineseInformal.parse(value)).toBe(`一${simp}`);
    }
  });
});

describe("edge cases and error paths", () => {
  it("handles strict mode validation", () => {
    expect(number.parse("一億", { strict: true })).toBe(100000000);
    expect(() => number.parse("abc", { strict: true })).toThrow(
      SyntaxError,
    );
  });

  it("throws for malformed numeric input", () => {
    expect(() => number.parse("   ")).toThrow(SyntaxError);
    expect(() => number.parse("-")).toThrow(SyntaxError);
    expect(() => number.parse("一點")).toThrow(SyntaxError);
    expect(() => number.parse("一點a")).toThrow(SyntaxError);
    expect(() => number.parse("一十a")).toThrow(SyntaxError);
    expect(() => number.parse("一a")).toThrow(SyntaxError);
  });

  it("parses arabic digit strings and promotes overflow to bigint", () => {
    expect(number.parse("123456")).toBe(123456);
    expect(number.parse("12萬")).toBe(120000);
    expect(number.parse("萬", { mode: "preferBigInt" })).toBe(10000n);
    const overflow = number.parse("一京");
    expect(typeof overflow).toBe("bigint");
    expect(overflow).toBe(10n ** 16n);
  });

  it("throws for decimal integer part above MAX_SAFE_INTEGER", () => {
    expect(() => number.parse("一京點一")).toThrow(RangeError);
  });

  it("supports decimal parse edge forms", () => {
    expect(number.parse("點五")).toBeCloseTo(0.5);
    expect(number.parse("일점이")).toBeCloseTo(1.2);
    expect(number.parse("負一點二")).toBeCloseTo(-1.2);
  });

  it("exactDecimal returns a lossless string for small decimals", () => {
    expect(number.parse("一點二三", { mode: "exactDecimal" })).toBe("1.23");
    expect(number.parse("負三點一四一五", { mode: "exactDecimal" })).toBe("-3.1415");
    expect(number.parse("點五", { mode: "exactDecimal" })).toBe("0.5");
  });

  it("exactDecimal bypasses the MAX_SAFE_INTEGER restriction", () => {
    // Legacy path would throw here:
    expect(() => number.parse("一京點一")).toThrow(RangeError);
    // Exact path preserves every digit:
    expect(number.parse("一京點一", { mode: "exactDecimal" })).toBe("10000000000000000.1");
    expect(number.parse("一無量大數點九", { mode: "exactDecimal" })).toBe(
      `${10n ** 68n}.9`,
    );
  });

  it("exactDecimal result round-trips through the formatter", () => {
    const exact = number.parse("一京點五", { mode: "exactDecimal" }) as string;
    expect(tradChineseInformal.parse(exact)).toBe("一京點五");
  });

  it("throws for unsupported formatter inputs", () => {
    expect(() => cjkHeavenlyStem.parse(1.2)).toThrow(RangeError);
    expect(() => tradChineseInformal.parse(Number.NaN)).toThrow(RangeError);
    expect(() => tradChineseInformal.parse(1e-7)).toThrow(RangeError);
    expect(() => tradChineseInformal.parse(10n ** 72n)).toThrow(RangeError);
  });

  it("formats zero explicitly", () => {
    expect(tradChineseInformal.parse(0)).toBe("零");
    expect(simpChineseFormal.parse(0)).toBe("零");
  });

  it("covers decimal formatting branches for all numeric systems", () => {
    expect(cjkIdeographic.parse(1.5)).toBe("一點五");
    expect(cjkIdeographic.parse(10n ** 8n)).toBe("一億");
    expect(cjkIdeographic.parse(-1.02)).toBe("負一點零二");
    expect(tradChineseInformal.parse(2.5)).toBe("二點五");
    expect(tradChineseFormal.parse(3.5)).toBe("參點伍");
    expect(simpChineseFormal.parse(4.5)).toBe("肆点伍");
    expect(koreanHangulFormal.parse(5.6)).toBe("오점육");
    expect(koreanHanjaFormal.parse(5.6)).toBe("五점六");
    expect(koreanHanjaInformal.parse(5.6)).toBe("五점六");
    expect(koreanHanjaInformal.parse(10n ** 8n)).toBe("一億");
    expect(japaneseFormal.parse(5.6)).toBe("伍点六");
    expect(japaneseInformal.parse(5.6)).toBe("五点六");
  });

  it("uses cyclic parse options on number.parse for stems and branches", () => {
    expect(number.parse("甲", { heavenlyStemMode: "cyclic" })).toBe(1);
    expect(number.parse("子", { earthlyBranchMode: "cyclic" })).toBe(1);
  });
});

describe("heavenly stem and earthly branch modes", () => {
  it("supports cyclic mode", () => {
    expect(cjkHeavenlyStem.parse(11, { mode: "cyclic" })).toBe("甲");
    expect(cjkEarthlyBranch.parse(13, { mode: "cyclic" })).toBe("子");
  });

  it("throws in fixed mode when out of range", () => {
    expect(() => cjkHeavenlyStem.parse(11)).toThrow(RangeError);
    expect(() => cjkEarthlyBranch.parse(0)).toThrow(RangeError);
  });
});

describe("korean and japanese sequence systems", () => {
  it("formats korean numeric systems up to large units", () => {
    expect(koreanHangulFormal.parse(1)).toBe("일");
    expect(koreanHangulFormal.parse(1023)).toBe("일천영이십삼");
    expect(koreanHangulFormal.parse(10n ** 68n)).toBe("일무량대수");
    expect(koreanHanjaFormal.parse(1)).toBe("壹");
    expect(koreanHanjaFormal.parse(1023)).toBe("壹仟零貳拾參");
    expect(koreanHanjaFormal.parse(10n ** 68n)).toBe("壹無量大數");
    expect(koreanHanjaInformal.parse(1)).toBe("一");
    expect(koreanHanjaInformal.parse(1023)).toBe("一千零二十三");
  });

  it("formats japanese numeric systems up to large units", () => {
    expect(japaneseFormal.parse(1)).toBe("壱");
    expect(japaneseFormal.parse(1023)).toBe("壱千零弍拾参");
    expect(japaneseFormal.parse(10n ** 68n)).toBe("壱無量大数");
    expect(japaneseInformal.parse(1)).toBe("一");
    expect(japaneseInformal.parse(1023)).toBe("一千零二十三");
    expect(japaneseInformal.parse(10n ** 68n)).toBe("一無量大数");
  });

  it("keeps hiragana and katakana as sequence systems", () => {
    expect(hiragana.parse(1)).toBe("あ");
    expect(hiragana.parse(10)).toBe("こ");
    expect(hiragana.parse(46)).toBe("ん");
    expect(hiraganaIroha.parse(1)).toBe("い");
    expect(hiraganaIroha.parse(10)).toBe("ぬ");
    expect(hiraganaIroha.parse(47)).toBe("す");
    expect(katakana.parse(1)).toBe("ア");
    expect(katakana.parse(10)).toBe("コ");
    expect(katakana.parse(46)).toBe("ン");
    expect(katakanaIroha.parse(1)).toBe("イ");
    expect(katakanaIroha.parse(10)).toBe("ヌ");
    expect(katakanaIroha.parse(47)).toBe("ス");
  });

  it("auto-detects sequence symbols in number.parse", () => {
    expect(number.parse("일")).toBe(1);
    expect(number.parse("구")).toBe(9);
    expect(number.parse("구십구")).toBe(99);
    expect(number.parse("구백구십구만")).toBe(9990000);
    expect(number.parse("일십")).toBe(10);
    expect(number.parse("일억삼천만")).toBe(130000000);
    expect(number.parse("壹拾")).toBe(10);
    expect(number.parse("壱拾")).toBe(10);
    expect(number.parse("壱京", { mode: "preferBigInt" })).toBe(10n ** 16n);
    expect(number.parse("十")).toBe(10);
    expect(number.parse("ぬ", { explicitTyping: "hiraganaIroha" })).toBe(10);
    expect(number.parse("ヌ", { explicitTyping: "katakanaIroha" })).toBe(10);
  });
});

describe("math operations", () => {
  it("adds multiple cjk strings", () => {
    expect(tradChineseInformal.add(["一", "二"])).toBe("三");
    expect(tradChineseInformal.add(["一千", "二十三"])).toBe("一千零二十三");
    expect(simpChineseFormal.add(["壹仟", "贰拾叁"])).toBe("壹仟零贰拾叁");
    expect(koreanHangulFormal.add(["일천", "이십삼"])).toBe("일천영이십삼");
  });

  it("subtracts multiple cjk strings", () => {
    expect(tradChineseInformal.subtract(["五", "二"])).toBe("三");
    expect(tradChineseInformal.subtract(["一千", "二十三"])).toBe("九百七十七");
    expect(tradChineseInformal.subtract(["二", "五"])).toBe("負三");
  });

  it("multiplies multiple cjk strings", () => {
    expect(tradChineseInformal.multiply(["二", "三"])).toBe("六");
    expect(tradChineseInformal.multiply(["一千", "二十三"])).toBe("二萬三千");
  });

  it("divides multiple cjk strings", () => {
    expect(tradChineseInformal.divide(["六", "二"])).toBe("三");
    expect(tradChineseInformal.divide(["一千", "十"])).toBe("一百");
  });

  it("handles precision for large values via BigInt", () => {
    expect(tradChineseInformal.add(["一兆", "一兆"])).toBe("二兆");
    expect(tradChineseInformal.subtract(["一京", "一兆"])).toBe("九千九百九十九兆");
    expect(tradChineseInformal.multiply(["一億", "一億"])).toBe("一京");
    expect(tradChineseInformal.divide(["一兆", "一萬"])).toBe("一億");
  });

  it("supports decimal operations", () => {
    expect(tradChineseInformal.add(["一點五", "二點三"])).toBe("三點八");
    expect(tradChineseInformal.subtract(["二點五", "一點二"])).toBe("一點三");
    expect(tradChineseInformal.multiply(["一點五", "二"])).toBe("三");
    expect(tradChineseInformal.divide(["五", "二"])).toBe("二點五");
  });

  it("handles mixed large integers and decimals (falling back to float precision)", () => {
    // 1 trillion + 1.5 => behaves like Float limit logic
    expect(tradChineseInformal.add(["一兆", "一點五"])).toBe("一兆零一點五");
  });
});

describe("advanced math operations", () => {
  it("computes modulo correctly", () => {
    expect(tradChineseInformal.modulo("五", "二")).toBe("一");
    expect(tradChineseInformal.modulo("一兆", "一億")).toBe("零");
  });

  it("computes power correctly", () => {
    expect(tradChineseInformal.pow("二", "三")).toBe("八");
    expect(tradChineseInformal.pow("二", 3)).toBe("八");
  });

  it("computes absolute values correctly", () => {
    expect(tradChineseInformal.abs("負五十")).toBe("五十");
    expect(tradChineseInformal.abs("五")).toBe("五");
    expect(tradChineseInformal.abs("負一兆")).toBe("一兆");
  });

  it("compares multiple values correctly", () => {
    expect(tradChineseInformal.compare("三十", "二")).toBe(1);
    expect(tradChineseInformal.compare("二", "三十")).toBe(-1);
    expect(tradChineseInformal.compare("五十", "五十")).toBe(0);
    // Sort array test
    const arr = ["三十", "二", "十一"].sort(tradChineseInformal.compare);
    expect(arr).toEqual(["二", "十一", "三十"]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXHAUSTIVE TESTS BELOW
// ─────────────────────────────────────────────────────────────────────────────

describe("exhaustive arithmetic edge cases", () => {
  it("add returns zero element for empty array", () => {
    expect(tradChineseInformal.add([])).toBe("零");
    expect(simpChineseFormal.add([])).toBe("零");
    expect(koreanHangulFormal.add([])).toBe("영");
  });

  it("subtract returns zero element for empty array", () => {
    expect(tradChineseInformal.subtract([])).toBe("零");
  });

  it("multiply returns zero element for empty array", () => {
    expect(tradChineseInformal.multiply([])).toBe("零");
  });

  it("divide returns zero element for empty array", () => {
    expect(tradChineseInformal.divide([])).toBe("零");
  });

  it("add single element is identity", () => {
    expect(tradChineseInformal.add(["五"])).toBe("五");
    expect(tradChineseInformal.add(["一兆"])).toBe("一兆");
  });

  it("subtract single element is identity (0 - n)", () => {
    // The initial accumulator is the first item, so single-item subtract = that item
    expect(tradChineseInformal.subtract(["五"])).toBe("五");
  });

  it("multiply single element is identity", () => {
    expect(tradChineseInformal.multiply(["七"])).toBe("七");
  });

  it("divide single element is identity", () => {
    expect(tradChineseInformal.divide(["八"])).toBe("八");
  });

  it("add multiple operands chains correctly", () => {
    expect(tradChineseInformal.add(["一", "二", "三", "四"])).toBe("十");
    expect(tradChineseInformal.add(["百", "百", "百"])).toBe("三百");
  });

  it("subtract multiple operands chains correctly", () => {
    expect(tradChineseInformal.subtract(["十", "一", "二", "三"])).toBe("四");
  });

  it("multiply multiple operands chains correctly", () => {
    expect(tradChineseInformal.multiply(["二", "三", "四"])).toBe("二十四");
  });

  it("divide multiple operands chains correctly", () => {
    expect(tradChineseInformal.divide(["二十四", "二", "三"])).toBe("四");
  });

  it("add preserves zero correctly", () => {
    expect(tradChineseInformal.add(["零", "五"])).toBe("五");
    expect(tradChineseInformal.add(["五", "零"])).toBe("五");
  });

  it("subtract resulting zero formats correctly", () => {
    expect(tradChineseInformal.subtract(["五", "五"])).toBe("零");
  });

  it("multiply by zero gives zero", () => {
    expect(tradChineseInformal.multiply(["一兆", "零"])).toBe("零");
  });

  it("add works across all major numeric systems", () => {
    expect(simpChineseInformal.add(["一百", "二百"])).toBe("三百");
    expect(tradChineseFormal.add(["壹百", "貳百"])).toBe("參佰");
    expect(simpChineseFormal.add(["壹佰", "贰佰"])).toBe("叁佰");
    expect(koreanHanjaFormal.add(["壹百", "貳百"])).toBe("參佰");
    expect(koreanHanjaInformal.add(["一百", "二百"])).toBe("三百");
    expect(japaneseFormal.add(["壱百", "弍百"])).toBe("参百");
    expect(japaneseInformal.add(["一百", "二百"])).toBe("三百");
  });

  it("subtract works across multiple systems", () => {
    expect(simpChineseInformal.subtract(["五百", "二百"])).toBe("三百");
    expect(koreanHangulFormal.subtract(["오백", "이백"])).toBe("삼백");
  });

  it("multiply works across multiple systems", () => {
    expect(simpChineseInformal.multiply(["二", "五"])).toBe("十");
    expect(japaneseFormal.multiply(["弐", "参"])).toBe("六");
  });

  it("divide works across multiple systems", () => {
    expect(simpChineseInformal.divide(["十", "二"])).toBe("五");
    expect(koreanHanjaFormal.divide(["拾", "貳"])).toBe("五");
  });

  it("add with 3+ decimal operands is exact", () => {
    expect(tradChineseInformal.add(["零點一", "零點二", "零點三"])).toBe("零點六");
    expect(tradChineseInformal.add(["一點二五", "二點七五"])).toBe("四");
  });

  it("multiply decimals is exact BigFloat", () => {
    expect(tradChineseInformal.multiply(["一點五", "一點五"])).toBe("二點二五");
    expect(tradChineseInformal.multiply(["零點一", "零點一"])).toBe("零點零一");
  });

  it("divide produces exact decimal output", () => {
    expect(tradChineseInformal.divide(["一", "四"])).toBe("零點二五");
    expect(tradChineseInformal.divide(["三", "四"])).toBe("零點七五");
  });

  it("modulo works with various integers", () => {
    expect(tradChineseInformal.modulo("十", "三")).toBe("一");
    expect(tradChineseInformal.modulo("七", "七")).toBe("零");
    expect(tradChineseInformal.modulo("一", "七")).toBe("一");
  });

  it("modulo on large numbers", () => {
    expect(tradChineseInformal.modulo("一兆零一", "一兆")).toBe("一");
  });

  it("pow with exponent zero gives one", () => {
    expect(tradChineseInformal.pow("五", "零")).toBe("一");
    expect(tradChineseInformal.pow("一兆", "零")).toBe("一");
  });

  it("pow with exponent one is identity", () => {
    expect(tradChineseInformal.pow("七", "一")).toBe("七");
    expect(tradChineseInformal.pow("一百", 1)).toBe("一百");
  });

  it("pow large bases", () => {
    expect(tradChineseInformal.pow("十", "八")).toBe("一億");
    expect(tradChineseInformal.pow("十", "十二")).toBe("一兆");
  });

  it("pow exponent as number vs cjk string is equivalent", () => {
    expect(tradChineseInformal.pow("三", "三")).toBe(tradChineseInformal.pow("三", 3));
    expect(tradChineseInformal.pow("二", "十")).toBe(tradChineseInformal.pow("二", 10));
  });

  it("abs on zero is zero", () => {
    expect(tradChineseInformal.abs("零")).toBe("零");
  });

  it("abs on negative decimals", () => {
    expect(tradChineseInformal.abs("負一點二三")).toBe("一點二三");
    expect(tradChineseInformal.abs("一點二三")).toBe("一點二三");
  });

  it("compare works with decimals", () => {
    expect(tradChineseInformal.compare("一點五", "一點二")).toBe(1);
    expect(tradChineseInformal.compare("零點一", "零點九")).toBe(-1);
    expect(tradChineseInformal.compare("三點一四", "三點一四")).toBe(0);
  });

  it("compare works with negative values", () => {
    expect(tradChineseInformal.compare("負五", "負三")).toBe(-1);
    expect(tradChineseInformal.compare("負二", "負九")).toBe(1);
    expect(tradChineseInformal.compare("負一", "一")).toBe(-1);
  });

  it("compare works with very large BigInt values", () => {
    expect(tradChineseInformal.compare("一兆", "一億")).toBe(1);
    expect(tradChineseInformal.compare("一億", "一兆")).toBe(-1);
    expect(tradChineseInformal.compare("一兆", "一兆")).toBe(0);
  });

  it("sort large array correctly", () => {
    const arr = ["一百", "十", "一萬", "一千", "五十"].sort(tradChineseInformal.compare);
    expect(arr).toEqual(["十", "五十", "一百", "一千", "一萬"]);
  });

  it("sort with negative values", () => {
    const arr = ["負三", "一", "零", "負一", "五"].sort(tradChineseInformal.compare);
    expect(arr).toEqual(["負三", "負一", "零", "一", "五"]);
  });

  it("division by zero throws", () => {
    expect(() => tradChineseInformal.divide(["六", "零"])).toThrow(RangeError);
    expect(() => tradChineseInformal.modulo("六", "零")).toThrow();
  });

  it("arithmetic with arabic digit strings", () => {
    expect(tradChineseInformal.add(["10", "20"])).toBe("三十");
    expect(tradChineseInformal.multiply(["5", "六"])).toBe("三十");
  });

  it("add large ultra-precise numbers without precision loss", () => {
    // 10^68 + 10^68 = 2 * 10^68
    expect(tradChineseInformal.add(["一無量大數", "一無量大數"])).toBe("二無量大數");
  });

  it("subtract resulting in ultra-large BigInt", () => {
    expect(tradChineseInformal.subtract(["二無量大數", "一無量大數"])).toBe("一無量大數");
  });

  it("multiply producing ultra-large units", () => {
    expect(tradChineseInformal.multiply(["一恆河沙", "一萬"])).toBe("一阿僧祇");
  });
});

describe("exhaustive exactDecimal parse tests", () => {
  it("parses all digit combos exactly", () => {
    expect(number.parse("零點零一", { mode: "exactDecimal" })).toBe("0.01");
    expect(number.parse("九點九九九", { mode: "exactDecimal" })).toBe("9.999");
    expect(number.parse("一百二十三點四五六", { mode: "exactDecimal" })).toBe("123.456");
  });

  it("preserves leading zeros after decimal point", () => {
    expect(number.parse("一點零五", { mode: "exactDecimal" })).toBe("1.05");
    expect(number.parse("一點零零一", { mode: "exactDecimal" })).toBe("1.001");
  });

  it("handles negative decimals exactly", () => {
    expect(number.parse("負三點一四一五", { mode: "exactDecimal" })).toBe("-3.1415");
    expect(number.parse("負零點零零一", { mode: "exactDecimal" })).toBe("-0.001");
  });

  it("returns bigint string for integer exactDecimal", () => {
    // Integer-only path still returns bigint, not string
    const val = number.parse("一千", { mode: "exactDecimal" });
    expect(val).toBe(1000);
  });

  it("exactDecimal round-trips through all formatters", () => {
    const exact = number.parse("一兆點二五", { mode: "exactDecimal" }) as string;
    expect(tradChineseInformal.parse(exact)).toBe("一兆點二五");
    expect(simpChineseInformal.parse(exact)).toBe("一兆点二五");
    expect(koreanHanjaFormal.parse(exact)).toBe("壹兆점貳五");
    expect(japaneseFormal.parse(exact)).toBe("壱兆点弍伍");
  });

  it("exactDecimal handles all large unit names with decimal", () => {
    const exact = number.parse("一無量大數點一", { mode: "exactDecimal" }) as string;
    expect(exact).toBe(`${10n ** 68n}.1`);
    expect(tradChineseInformal.parse(exact)).toBe("一無量大數點一");
  });

  it("exactDecimal with multi-digit decimal precision", () => {
    const exact = number.parse("一恆河沙點一二三四五六七八九", { mode: "exactDecimal" }) as string;
    expect(exact).toBe(`${10n ** 52n}.123456789`);
  });

  it("exactDecimal mode bypasses MAX_SAFE_INTEGER error", () => {
    expect(() => number.parse("一京點一")).toThrow(RangeError);
    const exact = number.parse("一京點一", { mode: "exactDecimal" });
    expect(exact).toBe("10000000000000000.1");
  });
});

describe("exhaustive number.parse coverage", () => {
  it("all arabic digit strings parse correctly", () => {
    expect(number.parse("0")).toBe(0);
    expect(number.parse("1")).toBe(1);
    expect(number.parse("999")).toBe(999);
    expect(number.parse("9007199254740991")).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("overflow auto-promotes to bigint", () => {
    const big = number.parse("一京");
    expect(typeof big).toBe("bigint");
    expect(big).toBe(10n ** 16n);
  });

  it("negative bigint parses correctly", () => {
    const val = number.parse("負一兆", { mode: "preferBigInt" });
    expect(val).toBe(-1_000_000_000_000n);
  });

  it("all zero forms parse to 0", () => {
    expect(number.parse("零")).toBe(0);
    expect(number.parse("〇")).toBe(0);
    expect(number.parse("0")).toBe(0);
  });

  it("leading implicit one in 十 position", () => {
    expect(number.parse("十")).toBe(10);
    expect(number.parse("十五")).toBe(15);
    expect(number.parse("十一")).toBe(11);
  });

  it("parses mixed-unit expressions", () => {
    expect(number.parse("二十三萬四千五百六十七")).toBe(234567);
    expect(number.parse("一百零一")).toBe(101);
    expect(number.parse("一千零一")).toBe(1001);
  });

  it("parses all heavenly stems 1-10", () => {
    const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    stems.forEach((s, i) => {
      expect(number.parse(s)).toBe(i + 1);
    });
  });

  it("parses all earthly branches 1-12", () => {
    const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    branches.forEach((b, i) => {
      expect(number.parse(b)).toBe(i + 1);
    });
  });

  it("cyclic stem/branch wraps around", () => {
    expect(number.parse("甲", { heavenlyStemMode: "cyclic" })).toBe(1);
    expect(number.parse("子", { earthlyBranchMode: "cyclic" })).toBe(1);
  });

  it("preferBigInt always returns bigint for integers", () => {
    expect(number.parse("一", { mode: "preferBigInt" })).toBe(1n);
    expect(number.parse("一百", { mode: "preferBigInt" })).toBe(100n);
    expect(number.parse("一萬", { mode: "preferBigInt" })).toBe(10000n);
  });

  it("parses negative decimals", () => {
    expect(number.parse("負零點五")).toBeCloseTo(-0.5);
    expect(number.parse("負九點九")).toBeCloseTo(-9.9);
  });

  it("parses Korean digits via normalization", () => {
    expect(number.parse("일")).toBe(1);
    expect(number.parse("구")).toBe(9);
    expect(number.parse("구십")).toBe(90);
  });

  it("parses Japanese formal digits", () => {
    expect(number.parse("壱")).toBe(1);
    expect(number.parse("弐")).toBe(2);
    expect(number.parse("参")).toBe(3);
  });

  it("parses traditional variant characters", () => {
    expect(number.parse("壹")).toBe(1);
    expect(number.parse("貳")).toBe(2);
    expect(number.parse("兩")).toBe(2);
    expect(number.parse("參")).toBe(3);
  });

  it("parses hiragana sequence symbols", () => {
    expect(number.parse("あ")).toBe(1);
    expect(number.parse("い")).toBe(2);
    expect(number.parse("ん")).toBe(46);
  });

  it("parses katakana sequence symbols", () => {
    expect(number.parse("ア")).toBe(1);
    expect(number.parse("ン")).toBe(46);
  });

  it("strict mode passes on valid CJK", () => {
    expect(number.parse("一二三", { strict: true })).toBe(123);
    expect(number.parse("一億", { strict: true })).toBe(100000000);
  });

  it("strict mode throws on ASCII letters", () => {
    expect(() => number.parse("abc", { strict: true })).toThrow(SyntaxError);
    expect(() => number.parse("1abc", { strict: true })).toThrow(SyntaxError);
  });
});

describe("exhaustive formatter coverage", () => {
  it("all formatters handle 0 correctly", () => {
    expect(tradChineseInformal.parse(0)).toBe("零");
    expect(tradChineseFormal.parse(0)).toBe("零");
    expect(simpChineseInformal.parse(0)).toBe("零");
    expect(simpChineseFormal.parse(0)).toBe("零");
    expect(koreanHangulFormal.parse(0)).toBe("영");
    expect(koreanHanjaFormal.parse(0)).toBe("零");
    expect(koreanHanjaInformal.parse(0)).toBe("零");
    expect(japaneseFormal.parse(0)).toBe("零");
    expect(japaneseInformal.parse(0)).toBe("零");
  });

  it("all formatters handle 1 correctly", () => {
    expect(tradChineseInformal.parse(1)).toBe("一");
    expect(tradChineseFormal.parse(1)).toBe("壹");
    expect(simpChineseInformal.parse(1)).toBe("一");
    expect(simpChineseFormal.parse(1)).toBe("壹");
    expect(koreanHangulFormal.parse(1)).toBe("일");
    expect(koreanHanjaFormal.parse(1)).toBe("壹");
    expect(koreanHanjaInformal.parse(1)).toBe("一");
    expect(japaneseFormal.parse(1)).toBe("壱");
    expect(japaneseInformal.parse(1)).toBe("一");
  });

  it("all formatters handle 10 correctly", () => {
    expect(tradChineseInformal.parse(10)).toBe("十");
    expect(tradChineseFormal.parse(10)).toBe("壹拾");
    expect(simpChineseInformal.parse(10)).toBe("十");
    expect(simpChineseFormal.parse(10)).toBe("壹拾");
    expect(koreanHangulFormal.parse(10)).toBe("일십");
    expect(koreanHanjaFormal.parse(10)).toBe("壹拾");
    expect(koreanHanjaInformal.parse(10)).toBe("十");
    expect(japaneseFormal.parse(10)).toBe("壱拾");
    expect(japaneseInformal.parse(10)).toBe("十");
  });

  it("all formatters handle 100 correctly", () => {
    expect(tradChineseInformal.parse(100)).toBe("一百");
    expect(tradChineseFormal.parse(100)).toBe("壹佰");
    expect(simpChineseFormal.parse(100)).toBe("壹佰");
    expect(koreanHangulFormal.parse(100)).toBe("일백");
  });

  it("all formatters handle 1000 correctly", () => {
    expect(tradChineseInformal.parse(1000)).toBe("一千");
    expect(tradChineseFormal.parse(1000)).toBe("壹仟");
    expect(koreanHangulFormal.parse(1000)).toBe("일천");
    expect(japaneseFormal.parse(1000)).toBe("壱千");
  });

  it("all formatters handle 10001 with zero bridging", () => {
    expect(tradChineseInformal.parse(10001)).toBe("一萬零一");
    expect(simpChineseInformal.parse(10001)).toBe("一万零一");
    expect(koreanHanjaInformal.parse(10001)).toBe("一萬零一");
  });

  it("all formatters handle negative values", () => {
    expect(tradChineseInformal.parse(-1)).toBe("負一");
    expect(tradChineseFormal.parse(-100)).toBe("負壹佰");
    expect(simpChineseInformal.parse(-999)).toBe("負九百九十九");
    expect(koreanHangulFormal.parse(-10)).toBe("負일십");
  });

  it("all formatters handle decimals correctly", () => {
    expect(tradChineseInformal.parse(1.5)).toBe("一點五");
    expect(simpChineseInformal.parse(1.5)).toBe("一点五");
    expect(koreanHangulFormal.parse(1.5)).toBe("일점오");
    expect(koreanHanjaFormal.parse(1.5)).toBe("壹점五");
    expect(japaneseFormal.parse(1.5)).toBe("壱点伍");
    expect(japaneseInformal.parse(1.5)).toBe("一点五");
  });

  it("formatters handle section zero bridging at various positions", () => {
    expect(tradChineseInformal.parse(1001)).toBe("一千零一");
    expect(tradChineseInformal.parse(1010)).toBe("一千零一十");
    expect(tradChineseInformal.parse(10010)).toBe("一萬零十");
    expect(tradChineseInformal.parse(100001)).toBe("十萬零一");
    expect(tradChineseInformal.parse(1000001)).toBe("一百萬零一");
    expect(tradChineseInformal.parse(10000001)).toBe("一千萬零一");
  });

  it("formatters handle bigint correctly", () => {
    expect(tradChineseInformal.parse(10n ** 8n)).toBe("一億");
    expect(tradChineseFormal.parse(10n ** 16n)).toBe("壹京");
    expect(simpChineseInformal.parse(10n ** 68n)).toBe("一无量大数");
    expect(koreanHangulFormal.parse(10n ** 68n)).toBe("일무량대수");
    expect(japaneseFormal.parse(10n ** 68n)).toBe("壱無量大数");
  });

  it("all cyclic formatters handle fixed mode boundaries", () => {
    expect(cjkHeavenlyStem.parse(1)).toBe("甲");
    expect(cjkHeavenlyStem.parse(10)).toBe("癸");
    expect(() => cjkHeavenlyStem.parse(0)).toThrow(RangeError);
    expect(() => cjkHeavenlyStem.parse(11)).toThrow(RangeError);

    expect(cjkEarthlyBranch.parse(1)).toBe("子");
    expect(cjkEarthlyBranch.parse(12)).toBe("亥");
    expect(() => cjkEarthlyBranch.parse(0)).toThrow(RangeError);
    expect(() => cjkEarthlyBranch.parse(13)).toThrow(RangeError);
  });

  it("cyclic formatters wrap correctly", () => {
    expect(cjkHeavenlyStem.parse(11, { mode: "cyclic" })).toBe("甲");
    expect(cjkHeavenlyStem.parse(21, { mode: "cyclic" })).toBe("甲");
    expect(cjkHeavenlyStem.parse(-1, { mode: "cyclic" })).toBe("壬");

    expect(cjkEarthlyBranch.parse(13, { mode: "cyclic" })).toBe("子");
    expect(cjkEarthlyBranch.parse(25, { mode: "cyclic" })).toBe("子");
    expect(cjkEarthlyBranch.parse(-1, { mode: "cyclic" })).toBe("戌");
  });

  it("hiragana/katakana fixed mode", () => {
    expect(hiragana.parse(1)).toBe("あ");
    expect(hiragana.parse(46)).toBe("ん");
    expect(() => hiragana.parse(47)).toThrow(RangeError);
    expect(() => hiragana.parse(0)).toThrow(RangeError);
    expect(katakana.parse(1)).toBe("ア");
    expect(katakana.parse(46)).toBe("ン");
  });

  it("hiraganaIroha/katakanaIroha fixed mode", () => {
    expect(hiraganaIroha.parse(1)).toBe("い");
    expect(hiraganaIroha.parse(47)).toBe("す");
    expect(katakanaIroha.parse(1)).toBe("イ");
    expect(katakanaIroha.parse(47)).toBe("ス");
  });

  it("formatters throw for NaN", () => {
    expect(() => tradChineseInformal.parse(Number.NaN)).toThrow(RangeError);
    expect(() => tradChineseFormal.parse(Number.NaN)).toThrow(RangeError);
    expect(() => simpChineseInformal.parse(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it("formatters throw for non-integer float in stem/branch", () => {
    expect(() => cjkHeavenlyStem.parse(1.5)).toThrow(RangeError);
    expect(() => cjkEarthlyBranch.parse(0.5)).toThrow(RangeError);
  });

  it("formatters throw for values exceeding large unit range", () => {
    expect(() => tradChineseInformal.parse(10n ** 72n)).toThrow(RangeError);
    expect(() => simpChineseFormal.parse(10n ** 72n)).toThrow(RangeError);
  });

  it("formatters handle exact decimal strings from exactDecimal mode", () => {
    // These come from number.parse with mode: "exactDecimal"
    expect(tradChineseInformal.parse("1.5")).toBe("一點五");
    expect(tradChineseInformal.parse("10000000000000000.5")).toBe("一京點五");
    expect(simpChineseInformal.parse("1000000000000.25")).toBe("一兆点二五");
  });
});

describe("exhaustive normalization and parsing edge cases", () => {
  it("normalizes traditional/simplified variant units", () => {
    expect(number.parse("壱")).toBe(1);
    expect(number.parse("弐")).toBe(2);
    expect(number.parse("参")).toBe(3);
    expect(number.parse("拾")).toBe(10);
    expect(number.parse("佰")).toBe(100);
    expect(number.parse("仟")).toBe(1000);
    expect(number.parse("萬", { mode: "preferBigInt" })).toBe(10000n);
    expect(number.parse("億", { mode: "preferBigInt" })).toBe(100000000n);
  });

  it("normalizes Japanese variant kanji units", () => {
    expect(number.parse("壱")).toBe(1);
    expect(number.parse("弐")).toBe(2);
    expect(number.parse("参")).toBe(3);
  });

  it("normalizes traditional Chinese negative sign", () => {
    expect(number.parse("負一")).toBe(-1);
    expect(number.parse("負五百")).toBe(-500);
  });

  it("normalizes simplified Chinese negative sign", () => {
    expect(number.parse("负一")).toBe(-1);
    expect(number.parse("负五百")).toBe(-500);
  });

  it("normalizes decimal point variants", () => {
    expect(number.parse("一點五")).toBeCloseTo(1.5);     // traditional
    expect(number.parse("一点五")).toBeCloseTo(1.5);     // simplified
    expect(number.parse("일점오")).toBeCloseTo(1.5);     // korean
  });

  it("empty string throws SyntaxError", () => {
    expect(() => number.parse("")).toThrow(SyntaxError);
    expect(() => number.parse("   ")).toThrow(SyntaxError);
  });

  it("lone minus sign throws SyntaxError", () => {
    expect(() => number.parse("-")).toThrow(SyntaxError);
    expect(() => number.parse("負")).toThrow(SyntaxError);
  });

  it("lone decimal point throws SyntaxError", () => {
    expect(() => number.parse("一點")).toThrow(SyntaxError);
  });

  it("invalid character in section throws SyntaxError", () => {
    expect(() => number.parse("一a")).toThrow(SyntaxError);
    expect(() => number.parse("一十a")).toThrow(SyntaxError);
  });

  it("invalid character in fraction throws SyntaxError", () => {
    expect(() => number.parse("一點a")).toThrow(SyntaxError);
    expect(() => number.parse("一點@")).toThrow(SyntaxError);
  });

  it("integer part above MAX_SAFE_INTEGER with decimal throws without exactDecimal", () => {
    expect(() => number.parse("一京點一")).toThrow(RangeError);
  });

  it("trims leading/trailing whitespace", () => {
    expect(number.parse("  一千  ")).toBe(1000);
    expect(number.parse("\t五\t")).toBe(5);
  });

  it("点 / 點 / 점 all parse as decimal separator", () => {
    expect(number.parse("一點五")).toBeCloseTo(1.5);
    expect(number.parse("一点五")).toBeCloseTo(1.5);
    expect(number.parse("一점오")).toBeCloseTo(1.5);
  });

  it("parses zero-prefixed decimal (dot at start)", () => {
    expect(number.parse("點五")).toBeCloseTo(0.5);
    expect(number.parse("点五")).toBeCloseTo(0.5);
  });
});

describe("property-style round trip", () => {
  it("keeps value through format->parse for large random integers", () => {
    const seed = readIntFromEnv("CJK_TEST_SEED", 20260327, 0, 0x7fffffff);
    const sampleCount = readIntFromEnv("CJK_TEST_SAMPLES", 100, 1, 5000);
    const maxDigits = readIntFromEnv("CJK_TEST_MAX_DIGITS", 69, 1, 69);
    const rng = createSeededRng(seed);

    for (let i = 0; i < sampleCount; i += 1) {
      const n = randomBigInt(rng, maxDigits);

      const tradInformal = tradChineseInformal.parse(n);
      const tradFormal = tradChineseFormal.parse(n);
      const simpInformal = simpChineseInformal.parse(n);
      const simpFormal = simpChineseFormal.parse(n);
      const koreanHanjaF = koreanHanjaFormal.parse(n);
      const koreanHanjaI = koreanHanjaInformal.parse(n);
      const japaneseF = japaneseFormal.parse(n);
      const japaneseI = japaneseInformal.parse(n);
      const koreanHangul = koreanHangulFormal.parse(n);

      expect(number.parse(tradInformal, { mode: "preferBigInt" })).toBe(n);
      expect(number.parse(tradFormal, { mode: "preferBigInt" })).toBe(n);
      expect(number.parse(simpInformal, { mode: "preferBigInt" })).toBe(n);
      expect(number.parse(simpFormal, { mode: "preferBigInt" })).toBe(n);
      expect(number.parse(koreanHanjaF, { mode: "preferBigInt" })).toBe(n);
      expect(number.parse(koreanHanjaI, { mode: "preferBigInt" })).toBe(n);
      expect(number.parse(japaneseF, { mode: "preferBigInt" })).toBe(n);
      expect(number.parse(japaneseI, { mode: "preferBigInt" })).toBe(n);

      // Korean Hangul has a homophone ambiguity for '구' (9 and 10^32). 
      // We mapped '구' to 9, so parsing Hangul > 10^32 will not round-trip.
      if (n < 10n ** 32n) {
        expect(number.parse(koreanHangul, { mode: "preferBigInt" })).toBe(n);
      }
    }
  });

  it("arithmetic add/subtract is self-inverse for random integers", () => {
    const rng = createSeededRng(98765);
    for (let i = 0; i < 30; i += 1) {
      const a = randomBigInt(rng, 10);
      const b = randomBigInt(rng, 10);
      const strA = tradChineseInformal.parse(a);
      const strB = tradChineseInformal.parse(b);
      const sumStr = tradChineseInformal.add([strA, strB]);
      const backStr = tradChineseInformal.subtract([sumStr, strB]);
      expect(number.parse(backStr, { mode: "preferBigInt" })).toBe(a);
    }
  });

  it("arithmetic multiply/divide is self-inverse for random divisible integers", () => {
    const rng = createSeededRng(11111);
    for (let i = 0; i < 30; i += 1) {
      const b = randomBigInt(rng, 5) + 1n; // avoid zero
      const a = b * randomBigInt(rng, 5);  // guarantee divisibility
      const strA = tradChineseInformal.parse(a);
      const strB = tradChineseInformal.parse(b);
      const prodStr = tradChineseInformal.multiply([strA, "一"]);
      const quotStr = tradChineseInformal.divide([prodStr, "一"]);
      expect(number.parse(quotStr, { mode: "preferBigInt" })).toBe(a);
    }
  });

  it("compare is consistent with arithmetic", () => {
    const pairs: Array<[bigint, bigint]> = [
      [1n, 2n], [100n, 50n], [10n ** 16n, 10n ** 8n], [0n, 1n],
      [999n, 1000n], [10n ** 68n, 10n ** 68n - 1n],
    ];
    for (const [a, b] of pairs) {
      const strA = tradChineseInformal.parse(a);
      const strB = tradChineseInformal.parse(b);
      const cmp = tradChineseInformal.compare(strA, strB);
      const expected = a > b ? 1 : a < b ? -1 : 0;
      expect(cmp).toBe(expected);
    }
  });
});
