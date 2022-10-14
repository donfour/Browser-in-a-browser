import { BaseParser } from "./base-parser";

describe("BaseParser", () => {
  test("nextChar", () => {
    const parser = new BaseParser("hello");
    expect(parser.nextChar()).toEqual("h");
  });

  test("startsWith", () => {
    const parser = new BaseParser("hello");
    expect(parser.startsWith("he")).toEqual(true);
    expect(parser.startsWith("123")).toEqual(false);
  });

  test("eof", () => {
    const parser = new BaseParser("hello");
    expect(parser.eof()).toEqual(false);
  });

  test("consumeChar", () => {
    const parser = new BaseParser("abc");
    expect(parser.consumeChar()).toEqual("a");
    expect(parser.consumeChar()).toEqual("b");
    expect(parser.consumeChar()).toEqual("c");
    expect(parser.consumeChar()).toBeUndefined();
  });

  test("consumeWhile", () => {
    const parser = new BaseParser("1112");
    expect(parser.consumeWhile((char) => char === "1")).toEqual("111");
  });

  test("consumeWhitespace", () => {
    const parser = new BaseParser("    a");
    parser.consumeWhitespace();
    expect(parser.nextChar()).toEqual("a");
  });
});
