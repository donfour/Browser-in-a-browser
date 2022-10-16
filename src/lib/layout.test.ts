import { BoxType, LayoutBox } from "./layout";

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
});
