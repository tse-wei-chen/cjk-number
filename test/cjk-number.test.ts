import { describe, expect, it } from "vitest";
import {
	cjkEarthlyBranch,
	cjkHeavenlyStem,
	cjkIdeographic,
	integer,
	simpChineseFormal,
	simpChineseInformal,
	tradFormalPositionalUnits,
	tradChineseFormal,
	tradChineseInformal
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
  { trad: "無量大數", simp: "无量大数", power: 68n }
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

function readIntFromEnv(key: string, fallback: number, min: number, max: number): number {
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
    expect(integer.parseInt("一千零二十三")).toBe(1023);
    expect(integer.parseInt("壹仟零貳拾參")).toBe(1023);
    expect(integer.parseInt("壹仟零贰拾叁")).toBe(1023);
    expect(integer.parseInt("癸")).toBe(10);
    expect(integer.parseInt("亥")).toBe(12);
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
    expect(integer.parseInt("負一百零二")).toBe(-102);
    expect(tradChineseInformal.parse(-320)).toBe("負三百二十");
  });

  it("supports decimals", () => {
    expect(integer.parseInt("一點二三")).toBeCloseTo(1.23);
    expect(simpChineseInformal.parse(12.34)).toBe("十二點三四");
  });

  it("supports bigint parse for very large integers", () => {
    const parsed = integer.parseInt("九千零七兆一", { preferBigInt: true });
    expect(typeof parsed).toBe("bigint");
    expect(parsed).toBe(9007000000000001n);
  });

  it("supports 京 and 垓 units", () => {
    const parsed = integer.parseInt("一垓零二京三兆", { preferBigInt: true });
    expect(parsed).toBe(100020003000000000000n);
    expect(tradChineseFormal.parse(10000000000000000n)).toBe("壹京");
  });

  it("supports units up to 無量大數", () => {
    expect(integer.parseInt("一恆河沙", { preferBigInt: true })).toBe(10n ** 52n);
    expect(integer.parseInt("一恒河沙", { preferBigInt: true })).toBe(10n ** 52n);
    expect(integer.parseInt("一不可思議", { preferBigInt: true })).toBe(10n ** 64n);
    expect(integer.parseInt("一無量大數", { preferBigInt: true })).toBe(10n ** 68n);
    expect(tradChineseFormal.parse(10n ** 68n)).toBe("壹無量大數");
    expect(simpChineseFormal.parse(10n ** 64n)).toBe("壹不可思议");
  });

  it("parses all unit tokens in detail", () => {
    expect(integer.parseInt("拾", { preferBigInt: true })).toBe(10n);
    expect(integer.parseInt("佰", { preferBigInt: true })).toBe(100n);
    expect(integer.parseInt("仟", { preferBigInt: true })).toBe(1000n);

    for (const { trad, simp, power } of LARGE_UNIT_TABLE) {
      const expected = 10n ** power;
      expect(integer.parseInt(`一${trad}`, { preferBigInt: true })).toBe(expected);
      expect(integer.parseInt(`一${simp}`, { preferBigInt: true })).toBe(expected);
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

describe("unit tables", () => {
  it("exports requested traditional formal positional units", () => {
    expect(tradFormalPositionalUnits).toEqual([
      "",
      "拾",
      "佰",
      "仟",
      "萬",
      "拾",
      "佰",
      "仟",
      "億",
      "拾",
      "佰",
      "仟",
      "兆",
      "拾",
      "佰",
      "仟",
      "京",
      "拾",
      "佰",
      "仟",
      "垓",
      "拾",
      "佰",
      "仟",
      "秭",
      "拾",
      "佰",
      "仟",
      "穰",
      "拾",
      "佰",
      "仟",
      "溝",
      "拾",
      "佰",
      "仟",
      "澗",
      "拾",
      "佰",
      "仟",
      "正",
      "拾",
      "佰",
      "仟",
      "載",
      "拾",
      "佰",
      "仟",
      "極",
      "拾",
      "佰",
      "仟",
      "恆河沙",
      "拾",
      "佰",
      "仟",
      "阿僧祇",
      "拾",
      "佰",
      "仟",
      "那由他",
      "拾",
      "佰",
      "仟",
      "不可思議",
      "拾",
      "佰",
      "仟",
      "無量大數"
    ]);
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

      expect(integer.parseInt(tradInformal, { preferBigInt: true })).toBe(n);
      expect(integer.parseInt(tradFormal, { preferBigInt: true })).toBe(n);
      expect(integer.parseInt(simpInformal, { preferBigInt: true })).toBe(n);
      expect(integer.parseInt(simpFormal, { preferBigInt: true })).toBe(n);
    }
  });
});
