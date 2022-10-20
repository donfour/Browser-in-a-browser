// CSS box model. All sizes are in px.

import { Display, StyledNode } from "./style";

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x?: number, y?: number, width?: number, height?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
  }

  expandedBy(edge: EdgeSizes): Rect {
    return new Rect(
      this.x - edge.left,
      this.y - edge.top,
      this.width + edge.left + edge.right,
      this.height + edge.top + edge.bottom
    );
  }
}

class EdgeSizes {
  left: number;
  right: number;
  top: number;
  bottom: number;

  constructor(left?: number, right?: number, top?: number, bottom?: number) {
    this.left = left || 0;
    this.right = right || 0;
    this.top = top || 0;
    this.bottom = bottom || 0;
  }
}

export class Dimensions {
  // Position of the content area relative to the document origin:
  content: Rect;

  // Surrounding edges:
  padding: EdgeSizes;
  border: EdgeSizes;
  margin: EdgeSizes;

  constructor(
    content?: Rect,
    padding?: EdgeSizes,
    border?: EdgeSizes,
    margin?: EdgeSizes
  ) {
    this.content = content || new Rect();
    this.padding = padding || new EdgeSizes();
    this.border = border || new EdgeSizes();
    this.margin = margin || new EdgeSizes();
  }

  // The area covered by the content area plus its padding.
  paddingBox(): Rect {
    return this.content.expandedBy(this.padding);
  }
  // The area covered by the content area plus padding and borders.
  borderBox(): Rect {
    return this.paddingBox().expandedBy(this.border);
  }
  // The area covered by the content area plus padding, borders, and margin.
  marginBox(): Rect {
    return this.borderBox().expandedBy(this.margin);
  }
}

export enum BoxType {
  BlockNode = "BlockNode",
  InlineNode = "InlineNode",
  AnonymousBlock = "AnonymousBlock",
}

export class LayoutBox {
  dimensions: Dimensions = new Dimensions();
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
    this.calculateBlockPosition(containingBlock);

    // Recursively lay out the children of this box.
    this.layoutBlockChildren();

    // Parent height can depend on child height, so `calculateHeight`
    // must be called *after* the children are laid out.
    this.calculateBlockHeight();
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
    let width: number | "auto" =
      Number.parseInt(style?.specifiedValues?.width || "") || auto;

    // margin, border, and padding have initial value 0.
    const zero = 0;

    let marginLeft = style?.lookupSize("margin-left", "margin") || zero;
    let marginRight = style?.lookupSize("margin-right", "margin") || zero;

    const borderLeft =
      style?.lookupSize("border-left-width", "border-width") || zero;
    const borderRight =
      style?.lookupSize("border-right-width", "border-width") || zero;

    const paddingLeft = style?.lookupSize("padding-left", "padding") || zero;
    const paddingRight = style?.lookupSize("padding-right", "padding") || zero;

    const total = [
      marginLeft,
      marginRight,
      borderLeft,
      borderRight,
      paddingLeft,
      paddingRight,
      width,
    ]
      .map((num) => (num === "auto" ? 0 : num))
      .reduce((a, b) => a + b, 0);

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
      } else if (marginLeft === auto && marginRight !== auto) {
        marginLeft = underflow;
      } else if (marginLeft !== auto && marginRight === auto) {
        marginRight = underflow;
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
    d.content.width = width;

    d.padding.left = paddingLeft === "auto" ? 0 : paddingLeft;
    d.padding.right = paddingRight === "auto" ? 0 : paddingRight;

    d.border.left = borderLeft === "auto" ? 0 : borderLeft;
    d.border.right = borderRight === "auto" ? 0 : borderRight;

    d.margin.left = marginLeft === "auto" ? 0 : marginLeft;
    d.margin.right = marginRight === "auto" ? 0 : marginRight;
  }

  calculateBlockPosition(containingBlock: Dimensions) {
    const style = this.styledNode;

    if (!style) throw new Error("Styled Node does not exist");

    const d = this.dimensions;

    // If margin-top or margin-bottom is `auto` or undefined, the used value is zero.
    const toPx = (value: number | "auto"): number =>
      value === "auto" ? 0 : value;

    d.margin.top = toPx(style.lookupSize("margin-top", "margin"));
    d.margin.bottom = toPx(style.lookupSize("margin-bottom", "margin"));

    d.border.top = toPx(style.lookupSize("border-top-width", "border-width"));
    d.border.bottom = toPx(
      style.lookupSize("border-bottom-width", "border-width")
    );

    d.padding.top = toPx(style.lookupSize("padding-top", "padding"));
    d.padding.bottom = toPx(style.lookupSize("padding-bottom", "padding"));

    d.content.x =
      containingBlock.content.x +
      d.margin.left +
      d.border.left +
      d.padding.left;

    // Position the box below all the previous boxes in the container.
    d.content.y =
      containingBlock.content.y +
      containingBlock.content.height +
      d.margin.top +
      d.border.top +
      d.padding.top;
  }

  layoutBlockChildren() {
    const d = this.dimensions;
    for (const child of this.children) {
      child.layout(d);
      // Track the height so each child is laid out below the previous content.
      d.content.height = d.content.height + child.dimensions.marginBox().height;
    }
  }

  calculateBlockHeight() {
    // If the height is set to an explicit length, use that exact length.
    // Otherwise, just keep the value set by `layoutBlockChildren`.
    const height = this?.styledNode?.specifiedValues?.["height"];
    if (height) {
      this.dimensions.content.height = Number.parseInt(height);
    }
  }
}

// Build the tree of LayoutBoxes, but don't perform any layout calculations yet.
export function buildLayoutTree(styledNode: StyledNode): LayoutBox {
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

export function layoutTree(
  node: StyledNode,
  containingBlock: Dimensions
): LayoutBox {
  // The layout algorithm expects the container height to start at 0.
  // TODO: Save the initial containing block height, for calculating percent heights.
  containingBlock.content.height = 0.0;
  const rootBox = buildLayoutTree(node);
  rootBox.layout(containingBlock);
  return rootBox;
}
