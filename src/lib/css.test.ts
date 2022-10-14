import { CssParser } from "./css";

describe("CssParser", () => {
  test("parseIdentifier", () => {
    const parser = new CssParser("abc abc");
    expect(parser.parseIdentifier()).toEqual("abc");
  });

  test("parseSimpleSelector", () => {
    const parser = new CssParser("div#id.class");
    expect(parser.parseSimpleSelector()).toEqual({
      classList: ["class"],
      id: "id",
      tagName: "div",
    });
  });

  test("parseDeclarations", () => {
    const parser = new CssParser("{foo: bar; hello: world;}");
    expect(parser.parseDeclarations()).toEqual([
      {
        name: "foo",
        value: "bar",
      },
      {
        name: "hello",
        value: "world",
      },
    ]);
  });

  test("parseDeclaration", () => {
    const parser = new CssParser("foo: bar;");
    expect(parser.parseDeclaration()).toEqual({
      name: "foo",
      value: "bar",
    });
  });

  test("parseRule", () => {
    const parser = new CssParser("div{foo: bar;}");
    expect(parser.parseRule()).toEqual({
      declarations: [
        {
          name: "foo",
          value: "bar",
        },
      ],
      selectors: [
        {
          classList: [],
          id: undefined,
          tagName: "div",
        },
      ],
    });
  });

  test("parseSelectors", () => {
    const parser = new CssParser("div, h1.title, h2#id {");
    expect(parser.parseSelectors()).toEqual([
      {
        classList: [],
        id: "id",
        tagName: "h2",
      },
      {
        classList: ["title"],
        id: undefined,
        tagName: "h1",
      },
      {
        classList: [],
        id: undefined,
        tagName: "div",
      },
    ]);
  });
});
