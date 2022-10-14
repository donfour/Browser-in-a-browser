export class Node {
  children: Node[];
  constructor(children: Node[]) {
    this.children = children;
  }
}

export class TextNode extends Node {
  data: string;
  constructor(children: Node[], data: string) {
    super(children);
    this.data = data;
  }
}

export type AttributesMap = { [key: string]: string };

export type ElementData = {
  tagName: string;
  attributes: AttributesMap;
};

export class ElementNode extends Node {
  data: ElementData;
  constructor(children: Node[], data: ElementData) {
    super(children);
    this.data = data;
  }
}
