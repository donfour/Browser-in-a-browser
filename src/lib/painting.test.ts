import { BoxType, LayoutBox } from "./layout";
import {
  DisplayCommandType,
  DisplayList,
  renderBackground,
  renderBorders,
} from "./painting";
import { StyledNode } from "./style";

describe("painting", () => {
  describe("renderBackground", () => {
    test("should add no command if background color is not given", () => {
      const layoutBox = new LayoutBox(BoxType.BlockNode);
      const displayList: DisplayList = [];

      renderBackground(displayList, layoutBox);

      expect(displayList).toEqual([]);
    });

    test("should add a command if background color is given", () => {
      const layoutBox = new LayoutBox(
        BoxType.BlockNode,
        new StyledNode(
          "test",
          {
            background: "#ABCDEF",
          },
          []
        )
      );
      const displayList: DisplayList = [];

      renderBackground(displayList, layoutBox);

      expect(displayList).toEqual([
        {
          type: DisplayCommandType.SolidColor,
          color: { a: 255, b: 239, g: 205, r: 171 },
          rect: { height: 0, width: 0, x: 0, y: 0 },
        },
      ]);
    });
  });
  describe("renderBorders", () => {
    test("should not add a command if border-color color is not given", () => {
      const layoutBox = new LayoutBox(BoxType.BlockNode);
      const displayList: DisplayList = [];

      renderBorders(displayList, layoutBox);

      expect(displayList).toEqual([]);
    });

    test("should add a command if border-color color is given", () => {
      const layoutBox = new LayoutBox(
        BoxType.BlockNode,
        new StyledNode("test", { "border-color": "#ABCDEF" }, [])
      );
      layoutBox.dimensions.border.top = 1;
      layoutBox.dimensions.border.right = 2;
      layoutBox.dimensions.border.bottom = 3;
      layoutBox.dimensions.border.left = 4;
      const displayList: DisplayList = [];

      renderBorders(displayList, layoutBox);

      expect(displayList).toEqual([
        {
          type: DisplayCommandType.SolidColor,
          color: { r: 171, g: 205, b: 239, a: 255 },
          rect: { x: -4, y: -1, width: 4, height: 4 },
        },
        {
          type: DisplayCommandType.SolidColor,
          color: { r: 171, g: 205, b: 239, a: 255 },
          rect: { x: 0, y: -1, width: 2, height: 4 },
        },
        {
          type: DisplayCommandType.SolidColor,
          color: { r: 171, g: 205, b: 239, a: 255 },
          rect: { x: -4, y: -1, width: 6, height: 1 },
        },
        {
          type: DisplayCommandType.SolidColor,
          color: { r: 171, g: 205, b: 239, a: 255 },
          rect: { x: -4, y: 0, width: 6, height: 3 },
        },
      ]);
    });
  });
});
