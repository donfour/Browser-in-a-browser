// CSS box model. All sizes are in px.

import { Display, StyledNode } from "./style";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type EdgeSizes = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type Dimensions = {
  // Position of the content area relative to the document origin:
  content: Rect;

  // Surrounding edges:
  padding: EdgeSizes;
  border: EdgeSizes;
  margin: EdgeSizes;
};

const DEFAULT_RECT = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

const DEFAULT_EDGE_SIZES = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

export enum BoxType {
  BlockNode,
  InlineNode,
  AnonymousBlock,
}

export class LayoutBox {
  dimensions: Dimensions = {
    content: { ...DEFAULT_RECT },
    padding: { ...DEFAULT_EDGE_SIZES },
    border: { ...DEFAULT_EDGE_SIZES },
    margin: { ...DEFAULT_EDGE_SIZES },
  };
  boxType: BoxType;
  styledNode?: StyledNode;
  children: LayoutBox[] = [];

  constructor(boxType: BoxType, styledNode?: StyledNode) {
    this.boxType = boxType;
    this.styledNode = styledNode;
  }

  // Where a new inline child should go.
  getInlineContainer(): LayoutBox {
    switch (this.boxType) {
      case BoxType.InlineNode:
      case BoxType.AnonymousBlock:
        return this;
      case BoxType.BlockNode: {
        // If we've just generated an anonymous block box, keep using it. Otherwise, create a new one.
        // We assume an inline box cannot contain a block-level child
        switch (this.children[this.children.length - 1]?.boxType) {
          case BoxType.AnonymousBlock:
            break;
          default:
            this.children.push(new LayoutBox(BoxType.AnonymousBlock));
            break;
        }
        return this.children[this.children.length - 1];
      }
    }
  }
}

// Build the tree of LayoutBoxes, but don't perform any layout calculations yet.
function buildLayoutTree(styledNode: StyledNode): LayoutBox {
  const display = styledNode.display();

  let boxType;
  switch (display) {
    case Display.Block:
      boxType = BoxType.BlockNode;
      break;
    case Display.Inline:
      boxType = BoxType.InlineNode;
      break;
    default:
      throw new Error("Root node has display: none.");
  }

  // Create the root box.
  let root = new LayoutBox(boxType, styledNode);

  // Create the descendant boxes.
  for (const child of styledNode.children) {
    switch (child.display()) {
      case Display.Block:
        root.children.push(buildLayoutTree(child));
        break;
      case Display.Inline:
        root.getInlineContainer().children.push(buildLayoutTree(child));
        break;
      case Display.None:
        // Skip nodes with `display: none;`
        break;
    }
  }

  return root;
}
