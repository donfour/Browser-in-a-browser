import { parseHtml, HtmlParser } from "./html-parser";

describe("HtmlParser", () => {
  test("parseTagName", () => {
    const parser = new HtmlParser("div");
    expect(parser.parseTagName()).toEqual("div");
  });

  describe("parseNode", () => {
    test("parseText", () => {
      const parser = new HtmlParser('<div id="1">hello</div>');
      expect(parser.parseNode()).toEqual({
        children: [{ children: [], data: "hello" }],
        data: { attributes: { id: "1" }, tagName: "div" },
      });
    });

    test("parseElement", () => {
      const parser = new HtmlParser("hello");
      expect(parser.parseNode()).toEqual({ children: [], data: "hello" });
    });
  });

  test("parseNodes", () => {
    const parser = new HtmlParser("<div>hello</div><div>hello</div>");
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

test("parseHtml", () => {
  expect(parseHtml("<div>hello</div><div>hello</div>")).toEqual({
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

  expect(parseHtml("<div>hello</div>")).toEqual({
    children: [
      {
        children: [],
        data: "hello",
      },
    ],
    data: { attributes: {}, tagName: "div" },
  });
});
