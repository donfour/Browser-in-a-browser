import { ElementData } from "./dom";
import { Selector } from "./parsers/css-parser";

// Map from CSS property names to values.
type PropertyMap = { [key: string]: string };

// A node with associated style data.
export class StyledNode {
  node: Node; // pointer to a DOM node
  specifiedValues: PropertyMap;
  children: StyledNode[];

  constructor(
    node: Node,
    specifiedValues: PropertyMap,
    children: StyledNode[]
  ) {
    this.node = node;
    this.specifiedValues = specifiedValues;
    this.children = children;
  }
}

export function matches(elem: ElementData, selector: Selector): boolean {
  return false;
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
