import { BoxType, LayoutBox, Rect } from "./layout";

export type DisplayList = DisplayCommand[];

export enum DisplayCommandType {
  SolidColor,
}

type DisplayCommand = {
  type: DisplayCommandType;
  data: {
    color?: Color;
    rect: Rect;
  };
};

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

  list.push({
    type: DisplayCommandType.SolidColor,
    data: {
      color,
      rect: layoutBox.dimensions.borderBox(),
    },
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
  let color = getColor(layoutBox, "border-color");

  if (!color) return;

  let d = layoutBox.dimensions;
  let borderBox = d.borderBox();

  // Left border
  list.push({
    type: DisplayCommandType.SolidColor,
    data: {
      color,
      rect: new Rect(borderBox.x, borderBox.y, d.border.left, borderBox.height),
    },
  });

  // Right border
  list.push({
    type: DisplayCommandType.SolidColor,
    data: {
      color,
      rect: new Rect(
        borderBox.x + borderBox.width - d.border.right,
        borderBox.y,
        d.border.right,
        borderBox.height
      ),
    },
  });

  // Top border
  list.push({
    type: DisplayCommandType.SolidColor,
    data: {
      color,
      rect: new Rect(borderBox.x, borderBox.y, borderBox.width, d.border.top),
    },
  });

  // Bottom border
  list.push({
    type: DisplayCommandType.SolidColor,
    data: {
      color,
      rect: new Rect(
        borderBox.x,
        borderBox.y + borderBox.height - d.border.bottom,
        borderBox.width,
        d.border.bottom
      ),
    },
  });
}
