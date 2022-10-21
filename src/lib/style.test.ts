import { Node, ElementData, ElementNode } from "./dom";
import { Rule, Selector, Stylesheet } from "./parsers/css-parser";
import {
  matchesSimpleSelector,
  matchingRules,
  matchRule,
  specifiedValues,
  getStyleTree,
} from "./style";

describe("style", () => {
  describe("matchesSimpleSelector", () => {
    test("empty selector should match everything", () => {
      const elem: ElementData = {
        tagName: "div",
        attributes: {},
      };
      const selector = new Selector();

      expect(matchesSimpleSelector(elem, selector)).toBeTruthy();
    });
    test("should match if tag name is the same", () => {
      const elem: ElementData = {
        tagName: "div",
        attributes: {},
      };
      const selector = new Selector("div");

      expect(matchesSimpleSelector(elem, selector)).toBeTruthy();
    });
    test("should not match if tag name is different", () => {
      const elem: ElementData = {
        tagName: "div",
        attributes: {},
      };
      const selector = new Selector("p");

      expect(matchesSimpleSelector(elem, selector)).toBeFalsy();
    });
    test("should match if class names are the same", () => {
      const elem: ElementData = {
        tagName: "div",
        attributes: {
          class: "foo bar",
        },
      };
      const selector = new Selector("div", undefined, ["foo", "bar"]);

      expect(matchesSimpleSelector(elem, selector)).toBeTruthy();
    });
    test("should not match if class names are different", () => {
      const elem: ElementData = {
        tagName: "div",
        attributes: {
          class: "foo",
        },
      };
      const selector = new Selector("div", undefined, ["bar"]);

      expect(matchesSimpleSelector(elem, selector)).toBeFalsy();
    });
    test("should match if id is the same", () => {
      const elem: ElementData = {
        tagName: "div",
        attributes: {
          id: "foo",
        },
      };
      const selector = new Selector("div", "foo");

      expect(matchesSimpleSelector(elem, selector)).toBeTruthy();
    });
    test("should not match if id is different", () => {
      const elem: ElementData = {
        tagName: "div",
        attributes: {
          id: "foo",
        },
      };
      const selector = new Selector("div", "bar");

      expect(matchesSimpleSelector(elem, selector)).toBeFalsy();
    });
  });

  describe("matchRule", () => {
    test("should return a matched rule when a rule is matched", () => {
      const elem: ElementData = {
        tagName: "div",
        attributes: {},
      };
      const rule: Rule = {
        selectors: [new Selector("div")],
        declarations: [
          {
            name: "foo",
            value: "bar",
          },
        ],
      };

      expect(matchRule(elem, rule)).toEqual([[0, 0, 1], rule]);
    });
    test("should return undefined when no rule is matched", () => {
      const elem: ElementData = {
        tagName: "div",
        attributes: {},
      };
      const rule: Rule = {
        selectors: [new Selector("p")],
        declarations: [],
      };

      expect(matchRule(elem, rule)).toBeUndefined();
    });
  });

  test("matchingRules", () => {
    // Equivalent to: `<div id="id">...</div>`
    const elem: ElementData = {
      tagName: "div",
      attributes: { id: "id" },
    };
    // Equivalent to: `div { foo: bar; }`
    const rule = {
      selectors: [new Selector("div")],
      declarations: [
        {
          name: "foo",
          value: "bar",
        },
      ],
    };
    // Equivalent to: `div#id { hello: world; }`
    const rule2 = {
      selectors: [new Selector("div", "id")],
      declarations: [
        {
          name: "hello",
          value: "world",
        },
      ],
    };
    const stylesheet: Stylesheet = {
      rules: [rule, rule2],
    };

    expect(matchingRules(elem, stylesheet)).toEqual([
      [[0, 0, 1], rule],
      [[1, 0, 1], rule2],
    ]);
  });

  test("specifiedValues", () => {
    // Equivalent to: `<div id="id">...</div>`
    const elem: ElementData = {
      tagName: "div",
      attributes: { id: "id" },
    };
    // Equivalent to: `div { foo: bar; }`
    const rule = {
      selectors: [new Selector("div")],
      declarations: [
        {
          name: "foo",
          value: "bar",
        },
      ],
    };
    // Equivalent to: `div#id { foo: overwritten; }`
    const rule2 = {
      selectors: [new Selector("div", "id")],
      declarations: [
        {
          name: "foo",
          value: "overwritten",
        },
      ],
    };
    const stylesheet: Stylesheet = {
      rules: [rule, rule2],
    };

    expect(specifiedValues(elem, stylesheet)).toEqual({
      foo: "overwritten",
    });
  });

  describe("getStyleTree", () => {
    test("should return a style tree", () => {
      const root: ElementNode = {
        children: [
          {
            children: [{ children: [], data: "hello" }],
            data: { attributes: {}, tagName: "div" },
          },
        ],
        data: { attributes: {}, tagName: "html" },
      };
      const stylesheet: Stylesheet = {
        rules: [
          {
            selectors: [new Selector("html")],
            declarations: [
              {
                name: "foo",
                value: "bar",
              },
            ],
          },
          {
            selectors: [new Selector("div")],
            declarations: [
              {
                name: "hello",
                value: "world",
              },
            ],
          },
        ],
      };

      expect(getStyleTree(root, stylesheet)).toEqual({
        data: { attributes: {}, tagName: "html" },
        specifiedValues: { foo: "bar" },
        children: [
          {
            data: { attributes: {}, tagName: "div" },
            specifiedValues: { hello: "world" },
            children: [
              {
                data: "hello",
                specifiedValues: {},
                children: [],
              },
            ],
          },
        ],
      });
    });
  });
});
