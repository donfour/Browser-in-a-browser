import { BoxType, Dimensions, LayoutBox } from "./layout";
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
    describe("if width is a number", () => {
      test("if width is different from containing block's width, use margin right to adjust.", () => {
        const box = new LayoutBox(
          BoxType.BlockNode,
          new StyledNode("some text", { width: "50" }, [])
        );

        const containingBlock = new Dimensions();
        containingBlock.content.width = 100;

        box.calculateBlockWidth(containingBlock);

        expect(box.dimensions.margin.right).toEqual(50);
      });
      test("if margin-left is set to auto, set margin-left to underflow.", () => {
        const box = new LayoutBox(
          BoxType.BlockNode,
          new StyledNode(
            "some text",
            { width: "50", "margin-left": "auto" },
            []
          )
        );

        const containingBlock = new Dimensions();
        containingBlock.content.width = 100;

        box.calculateBlockWidth(containingBlock);

        expect(box.dimensions.margin.left).toEqual(50);
        expect(box.dimensions.margin.right).toEqual(0);
      });
      test("if margin-right is set to auto, set margin-right to underflow.", () => {
        const box = new LayoutBox(
          BoxType.BlockNode,
          new StyledNode(
            "some text",
            { width: "50", "margin-right": "auto" },
            []
          )
        );

        const containingBlock = new Dimensions();
        containingBlock.content.width = 100;

        box.calculateBlockWidth(containingBlock);

        expect(box.dimensions.margin.left).toEqual(0);
        expect(box.dimensions.margin.right).toEqual(50);
      });
      test("if both margin-left and margin-right is set to auto, distribute underflow equally between them.", () => {
        const box = new LayoutBox(
          BoxType.BlockNode,
          new StyledNode(
            "some text",
            { width: "50", "margin-left": "auto", "margin-right": "auto" },
            []
          )
        );

        const containingBlock = new Dimensions();
        containingBlock.content.width = 100;

        box.calculateBlockWidth(containingBlock);

        expect(box.dimensions.margin.left).toEqual(25);
        expect(box.dimensions.margin.right).toEqual(25);
      });
    });
    describe("if width is set to auto", () => {
      test("if underflow is larger or equal to 0, set width to underflow", () => {
        const box = new LayoutBox(
          BoxType.BlockNode,
          new StyledNode("some text", { width: "auto" }, [])
        );

        const containingBlock = new Dimensions();
        containingBlock.content.width = 100;

        box.calculateBlockWidth(containingBlock);

        expect(box.dimensions.content.width).toEqual(100);
      });
      test("if underflow is smaller than 0, set width to 0 and shrink margin-right to fit container width.", () => {
        const box = new LayoutBox(
          BoxType.BlockNode,
          new StyledNode(
            "some text",
            { width: "auto", "margin-left": "50", "margin-right": "50" },
            []
          )
        );

        const containingBlock = new Dimensions();
        containingBlock.content.width = 50;

        box.calculateBlockWidth(containingBlock);

        expect(box.dimensions.margin.left).toEqual(50);
        expect(box.dimensions.margin.right).toEqual(0);
      });
    });
  });

  describe("calculateBlockPosition", () => {
    test("should throw an error if styled node does not exist", () => {
      const box = new LayoutBox(BoxType.AnonymousBlock);
      expect(() => {
        box.calculateBlockPosition(new Dimensions());
      }).toThrow("Styled Node does not exist");
    });
    test("box content's x position should be right of containing block's x position, plus box's left margin, border, and padding.", () => {
      const box = new LayoutBox(
        BoxType.BlockNode,
        new StyledNode("some text", {}, [])
      );
      box.dimensions.margin.left = 10;
      box.dimensions.border.left = 10;
      box.dimensions.padding.left = 10;
      const containingBlock = new Dimensions();
      containingBlock.content.x = 50;

      box.calculateBlockPosition(containingBlock);

      expect(box.dimensions.content.x).toEqual(80);
    });
    test("box content's y position should be bottom of containing block's content, plus box's top margin, border, and padding.", () => {
      const box = new LayoutBox(
        BoxType.BlockNode,
        new StyledNode(
          "some text",
          {
            "margin-top": "10",
            "border-top-width": "10",
            "padding-top": "10",
          },
          []
        )
      );
      const containingBlock = new Dimensions();
      containingBlock.content.y = 50;
      containingBlock.content.height = 10;

      box.calculateBlockPosition(containingBlock);

      expect(box.dimensions.content.y).toEqual(90);
    });
  });

  test("layoutBlockChildren", () => {
    const box = new LayoutBox(
      BoxType.BlockNode,
      new StyledNode("some text", {}, [])
    );
    box.children.push(
      new LayoutBox(
        BoxType.BlockNode,
        new StyledNode(
          "some text",
          {
            margin: "10",
            "border-width": "10",
            padding: "10",
          },
          []
        )
      )
    );
    box.layoutBlockChildren();

    expect(box.dimensions.content.height).toEqual(60);
  });
});
