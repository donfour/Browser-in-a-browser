import { Parser } from "./parser";

describe("Parser", () => {
  test("nextChar", () => {
    const parser = new Parser("hello");
    expect(parser.nextChar()).toEqual("h");
  });

  test("startsWith", () => {
    const parser = new Parser("hello");
    expect(parser.startsWith("he")).toEqual(true);
    expect(parser.startsWith("123")).toEqual(false);
  });

  test("eof", () => {
    const parser = new Parser("hello");
    expect(parser.eof()).toEqual(false);
  });

  test("consumeChar", () => {
    const parser = new Parser("abc");
    expect(parser.consumeChar()).toEqual("a");
    expect(parser.consumeChar()).toEqual("b");
    expect(parser.consumeChar()).toEqual("c");
    expect(parser.consumeChar()).toBeUndefined();
  });

  test("consumeWhile", () => {
    const parser = new Parser("1112");
    expect(parser.consumeWhile((char) => char === "1")).toEqual("111");
  });

  test("consumeWhitespace", () => {
    const parser = new Parser("    a");
    parser.consumeWhitespace();
    expect(parser.nextChar()).toEqual("a");
  });
});
