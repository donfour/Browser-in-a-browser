import { Node, ElementData, TextNode, ElementNode } from "./dom";
import {
  compareSpecificity,
  Rule,
  Selector,
  Specificity,
  Stylesheet,
} from "./parsers/css-parser";

export enum Display {
  Inline = "Inline",
  Block = "Block",
  None = "None",
}

// Map from CSS property names to values.
type PropertyMap = { [key: string]: string };

// A node with associated style data.
export class StyledNode {
  data: string | ElementData;
  specifiedValues: PropertyMap;
  children: StyledNode[];

  constructor(
    data: string | ElementData,
    specifiedValues: PropertyMap,
    children: StyledNode[]
  ) {
    this.data = data;
    this.specifiedValues = specifiedValues;
    this.children = children;
  }

  // The value of the `display` property (defaults to inline).
  display(): Display {
    switch (this.specifiedValues.display) {
      case "block":
        return Display.Block;
      case "none":
        return Display.None;
      default:
        return Display.Inline;
    }
  }

  lookupSize(property: string, backupProperty: string): number | "auto" {
    if (
      this.specifiedValues[property] === "auto" ||
      this.specifiedValues[backupProperty] === "auto"
    ) {
      return "auto";
    }

    return Number.parseInt(
      this.specifiedValues[property] || this.specifiedValues[backupProperty]
    );
  }
}

export function matchesSimpleSelector(
  elem: ElementData,
  selector: Selector
): boolean {
  // Check type selector
  if (selector.tagName && selector.tagName !== elem?.tagName) {
    return false;
  }

  // Check ID selector
  if (selector.id && selector.id !== elem?.attributes?.id) {
    return false;
  }

  // Check class selectors
  const elemClasses = elem?.attributes?.class?.split(" ") || [];
  if (
    selector?.classList.some((className) => !elemClasses.includes(className))
  ) {
    return false;
  }

  // We didn't find any non-matching selector components.
  return true;
}

export type MatchedRule = [Specificity, Rule];

// If `rule` matches `elem`, return a `MatchedRule`. Otherwise return `None`.
export function matchRule(
  elem: ElementData,
  rule: Rule
): MatchedRule | undefined {
  // Find the first (highest-specificity) matching selector.
  const matchedSelector = rule.selectors.find((selector) =>
    matchesSimpleSelector(elem, selector)
  );
  return matchedSelector ? [matchedSelector.specificity(), rule] : undefined;
}

export function matchingRules(
  elem: ElementData,
  stylesheet: Stylesheet
): MatchedRule[] {
  const result = [];
  for (const rule of stylesheet.rules) {
    const matchedRule = matchRule(elem, rule);
    if (matchedRule) {
      result.push(matchedRule);
    }
  }
  return result;
}

// Apply styles to a single element, returning the specified values.
export function specifiedValues(
  elem: ElementData,
  stylesheet: Stylesheet
): PropertyMap {
  const values: PropertyMap = {};
  const rules = matchingRules(elem, stylesheet);

  // Go through the rules from lowest to highest specificity.
  rules.sort((a, b) => compareSpecificity(b[0], a[0]));

  for (const rule of rules) {
    for (const declaration of rule[1].declarations) {
      values[declaration.name] = declaration.value;
    }
  }

  return values;
}

// Apply a stylesheet to an entire DOM tree, returning a StyledNode tree.
export function styleTree(root: Node, stylesheet: Stylesheet): StyledNode {
  const s =
    root instanceof TextNode
      ? {}
      : specifiedValues((root as ElementNode).data, stylesheet);
  const children: StyledNode[] = root.children.map((child) =>
    styleTree(child, stylesheet)
  );

  return new StyledNode(root.data, s, children);
}
