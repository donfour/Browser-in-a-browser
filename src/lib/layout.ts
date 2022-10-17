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

export const DEFAULT_RECT = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

export const DEFAULT_EDGE_SIZES = {
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

  // Lay out a box and its descendants.
  layout(containingBlock: Dimensions) {
    switch (this.boxType) {
      case BoxType.BlockNode:
        this.layoutBlock(containingBlock);
        break;
      case BoxType.InlineNode:
        // TODO
        break;
      case BoxType.AnonymousBlock:
        // TODO
        break;
    }
  }

  layoutBlock(containingBlock: Dimensions) {
    // Child width can depend on parent width, so we need to calculate
    // this box's width before laying out its children.
    this.calculateBlockWidth(containingBlock);

    // Determine where the box is located within its container.
    // TODO: this.calculateBlockPosition(containingBlock);

    // Recursively lay out the children of this box.
    // TODO: this.layoutBlockChildren();

    // Parent height can depend on child height, so `calculateHeight`
    // must be called *after* the children are laid out.
    // TODO: this.calculateBlockHeight();
  }

  /// Calculate the width of a block-level non-replaced element in normal flow.
  ///
  /// http://www.w3.org/TR/CSS2/visudet.html#blockwidth
  ///
  /// Sets the horizontal margin/padding/border dimensions, and the `width`.
  calculateBlockWidth(containingBlock: Dimensions) {
    const style = this.styledNode;

    // `width` has initial value `auto`.
    const auto = "auto";
    let width: string | number = style?.specifiedValues?.width || auto;

    // margin, border, and padding have initial value 0.
    const zero = 0;

    let marginLeft =
      style?.specifiedValues["margin-left"] ||
      style?.specifiedValues["margin"] ||
      zero;
    let marginRight =
      style?.specifiedValues["margin-right"] ||
      style?.specifiedValues["margin"] ||
      zero;

    const borderLeft =
      style?.specifiedValues["border-left-width"] ||
      style?.specifiedValues["border-width"] ||
      zero;
    const borderRight =
      style?.specifiedValues["border-right-width"] ||
      style?.specifiedValues["border-width"] ||
      zero;

    const paddingLeft =
      style?.specifiedValues["padding-left"] ||
      style?.specifiedValues["padding"] ||
      zero;
    const paddingRight =
      style?.specifiedValues["padding-right"] ||
      style?.specifiedValues["padding"] ||
      zero;

    const total = [
      marginLeft,
      marginRight,
      borderLeft,
      borderRight,
      paddingLeft,
      paddingRight,
      width,
    ].reduce(
      (a, b) =>
        Number.parseInt(a as string) || 0 + Number.parseFloat(b as string) || 0,
      0
    );

    // If width is not auto and the total is wider than the container, treat auto margins as 0.
    if (width !== auto && total > containingBlock.content.width) {
      if (marginLeft === auto) {
        marginLeft = 0;
      }
      if (marginRight === auto) {
        marginRight = 0;
      }
    }

    // Adjust used values so that the above sum equals `containingBlock.width`.
    // Each arm of the `match` should increase the total width by exactly `underflow`,
    // and afterward all values should be absolute lengths in px.
    const underflow = containingBlock.content.width - (total as number);

    if (width !== auto) {
      if (marginLeft !== auto && marginRight !== auto) {
        // If the values are overconstrained, calculate marginRight.

        marginRight = (marginRight as number) + underflow;
        console.log("marginRight set to: ", marginRight);
      } else if (marginLeft !== auto && marginRight === auto) {
        marginRight = underflow;
      } else if (marginLeft === auto && marginRight !== auto) {
        marginLeft = underflow;
      } else if (marginLeft === auto && marginRight === auto) {
        // If margin-left and margin-right are both auto, their used values are equal.
        marginLeft = underflow / 2.0;
        marginRight = underflow / 2.0;
      }
    } else {
      // If width is set to auto, any other auto values become 0.
      if (marginLeft === auto) marginLeft = 0;
      if (marginRight === auto) marginRight = 0;

      if (underflow >= 0.0) {
        // Expand width to fill the underflow.
        width = underflow;
      } else {
        // Width can't be negative. Adjust the right margin instead.
        width = 0;
        marginRight = (marginRight as number) + underflow;
      }
    }

    const d = this.dimensions;
    d.content.width = Number.parseInt(width as string);

    d.padding.left = Number.parseInt(paddingLeft as string);
    d.padding.right = Number.parseInt(paddingRight as string);

    d.border.left = Number.parseInt(borderLeft as string);
    d.border.right = Number.parseInt(borderRight as string);

    d.margin.left = Number.parseInt(marginLeft as string);
    d.margin.right = Number.parseInt(marginRight as string);
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
