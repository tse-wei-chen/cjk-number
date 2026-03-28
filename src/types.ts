export type CyclicMode = "fixed" | "cyclic";

export interface SystemParseOptions {
  mode?: CyclicMode;
}

export interface NumberParseOptions {
  strict?: boolean;
  preferBigInt?: boolean;
  heavenlyStemMode?: CyclicMode;
  earthlyBranchMode?: CyclicMode;
}

export type NumberLike = number | bigint;

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
}
