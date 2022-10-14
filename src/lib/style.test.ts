import { ElementData } from "./dom";
import { Selector } from "./parsers/css-parser";
import { matchesSimpleSelector } from "./style";

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
});
