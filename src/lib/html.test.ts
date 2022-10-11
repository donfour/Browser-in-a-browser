import { parse, Parser } from "./html";

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

  test("parseTagName", () => {
    const parser = new Parser("div");
    expect(parser.parseTagName()).toEqual("div");
  });

  describe("parseNode", () => {
    test("parseText", () => {
      const parser = new Parser('<div id="1">hello</div>');
      expect(parser.parseNode()).toEqual({
        children: [{ children: [], data: "hello" }],
        data: { attributes: { id: "1" }, tagName: "div" },
      });
    });

    test("parseElement", () => {
      const parser = new Parser("hello");
      expect(parser.parseNode()).toEqual({ children: [], data: "hello" });
    });
  });

  test("parseNodes", () => {
    const parser = new Parser("<div>hello</div><div>hello</div>");
    expect(parser.parseNodes()).toEqual([
      {
        children: [{ children: [], data: "hello" }],
        data: { attributes: {}, tagName: "div" },
      },
      {
        children: [{ children: [], data: "hello" }],
        data: { attributes: {}, tagName: "div" },
      },
    ]);
  });
});

test("parse", () => {
  expect(parse("<div>hello</div><div>hello</div>")).toEqual({
    children: [
      {
        children: [{ children: [], data: "hello" }],
        data: { attributes: {}, tagName: "div" },
      },
      {
        children: [{ children: [], data: "hello" }],
        data: { attributes: {}, tagName: "div" },
      },
    ],
    data: { attributes: {}, tagName: "html" },
  });

  expect(parse("<div>hello</div>")).toEqual({
    children: [
      {
        children: [],
        data: "hello",
      },
    ],
    data: { attributes: {}, tagName: "div" },
  });
});
