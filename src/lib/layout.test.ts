import {
  BoxType,
  DEFAULT_EDGE_SIZES,
  DEFAULT_RECT,
  Dimensions,
  LayoutBox,
} from "./layout";
import { StyledNode } from "./style";

describe("layout", () => {
  describe("getInlineContainer", () => {
    test("should return self if self box type is inline", () => {
      const box = new LayoutBox(BoxType.InlineNode);
      expect(box.getInlineContainer()).toEqual(box);
    });

    test("should return self if self box type is anonymous", () => {
      const box = new LayoutBox(BoxType.AnonymousBlock);
      expect(box.getInlineContainer()).toEqual(box);
    });

    describe("if self box type is block", () => {
      test("if last child is not an anonymous block, should return a new anonymous block", () => {
        const box = new LayoutBox(BoxType.BlockNode);
        expect(box.getInlineContainer()).toEqual(
          new LayoutBox(BoxType.AnonymousBlock)
        );
        expect(box.children.length).toEqual(1);
      });

      test("if last child is an anonymous block, should return the last child", () => {
        const box = new LayoutBox(BoxType.BlockNode);
        box.children.push(new LayoutBox(BoxType.AnonymousBlock));
        expect(box.getInlineContainer()).toEqual(
          new LayoutBox(BoxType.AnonymousBlock)
        );
        expect(box.children.length).toEqual(1);
      });
    });
  });

  describe("calculateBlockWidth", () => {
    test("width should be set to auto if not given", () => {
      const box = new LayoutBox(
        BoxType.BlockNode,
        new StyledNode("test", {}, [])
      );
      const containingBlock: Dimensions = {
        content: { ...DEFAULT_RECT },
        padding: { ...DEFAULT_EDGE_SIZES },
        border: { ...DEFAULT_EDGE_SIZES },
        margin: { ...DEFAULT_EDGE_SIZES },
      };

      box.calculateBlockWidth(containingBlock);

      expect(box.dimensions.content.width).toEqual("auto");
    });

    describe("if width is set to auto", () => {
      test("if width is larger than containing block's width, treat auto margins as 0.", () => {
        const box = new LayoutBox(
          BoxType.BlockNode,
          new StyledNode(
            "test",
            { width: "100", "margin-left": "0", "margin-right": "0" },
            []
          )
        );
        const containingBlock: Dimensions = {
          content: { ...DEFAULT_RECT, width: 50 },
          padding: { ...DEFAULT_EDGE_SIZES },
          border: { ...DEFAULT_EDGE_SIZES },
          margin: { ...DEFAULT_EDGE_SIZES },
        };

        box.calculateBlockWidth(containingBlock);

        expect(box.dimensions.margin.left).toEqual(0);
        expect(box.dimensions.margin.right).toEqual(-50);
      });
    });
  });
});
