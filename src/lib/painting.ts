import { BoxType, LayoutBox, Rect } from "./layout";

export type DisplayList = DisplayCommand[];

export enum DisplayCommandType {
  SolidColor = "SolidColor",
}

//helper type
type DiscriminatedUnion<K extends PropertyKey, T extends object> = {
  [P in keyof T]: { [Q in K]: P } & T[P] extends infer U
    ? { [Q in keyof U]: U[Q] }
    : never;
}[keyof T];

type DisplayCommand = DiscriminatedUnion<
  "type",
  {
    [DisplayCommandType.SolidColor]: {
      color: Color;
      rect: Rect;
    };
    square: { length: number };
  }
>;

export function buildDisplayList(layoutRoot: LayoutBox): DisplayList {
  const list: DisplayList = [];
  renderLayoutBox(list, layoutRoot);
  return list;
}

export function renderLayoutBox(list: DisplayList, layoutBox: LayoutBox) {
  renderBackground(list, layoutBox);
  renderBorders(list, layoutBox);
  // TODO: render text

  for (const child of layoutBox.children) {
    renderLayoutBox(list, child);
  }
}

export function renderBackground(list: DisplayList, layoutBox: LayoutBox) {
  const color = getColor(layoutBox, "background");

  if (!color) return;
  const asdf = layoutBox.dimensions.borderBox();
  console.log(asdf);
  list.push({
    type: DisplayCommandType.SolidColor,
    color,
    rect: asdf,
  });
}

export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

// Return the specified color for CSS property `name`, or None if no color was specified.
function getColor(layoutBox: LayoutBox, name: string): Color | undefined {
  switch (layoutBox.boxType) {
    case BoxType.BlockNode:
    case BoxType.InlineNode:
      return parseColor(layoutBox?.styledNode?.specifiedValues?.[name]);
  }
}

function parseColor(text?: string): Color | undefined {
  const result = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.exec(
    text || ""
  );
  if (result) {
    return {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16),
      a: 255,
    };
  }
}

export function renderBorders(list: DisplayList, layoutBox: LayoutBox) {
  const color = getColor(layoutBox, "border-color");

  if (!color) return;

  const d = layoutBox.dimensions;
  const borderBox = d.borderBox();

  // Left border
  list.push({
    type: DisplayCommandType.SolidColor,
    color,
    rect: new Rect(borderBox.x, borderBox.y, d.border.left, borderBox.height),
  });

  // Right border
  list.push({
    type: DisplayCommandType.SolidColor,
    color,
    rect: new Rect(
      borderBox.x + borderBox.width - d.border.right,
      borderBox.y,
      d.border.right,
      borderBox.height
    ),
  });

  // Top border
  list.push({
    type: DisplayCommandType.SolidColor,
    color,
    rect: new Rect(borderBox.x, borderBox.y, borderBox.width, d.border.top),
  });

  // Bottom border
  list.push({
    type: DisplayCommandType.SolidColor,
    color,
    rect: new Rect(
      borderBox.x,
      borderBox.y + borderBox.height - d.border.bottom,
      borderBox.width,
      d.border.bottom
    ),
  });
}

// Paint a tree of LayoutBoxes to an array of pixels.
export function paint(layoutRoot: LayoutBox, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const displayList = buildDisplayList(layoutRoot);
  console.log("Display list:", displayList);
  for (const item of displayList) {
    switch (item.type) {
      case DisplayCommandType.SolidColor:
        const { r, g, b } = item.color;
        const { x, y, width, height } = item.rect;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, width, height);
        break;
    }
  }
}
