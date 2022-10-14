import { AttributesMap, ElementNode, Node, TextNode } from "./dom";
import { assertEqual, Parser } from "./parser";

export class HtmlParser extends Parser {
  // Parse a tag or attribute name.
  parseTagName(): string {
    return this.consumeWhile((char) => /[a-zA-z0-9]/.test(char));
  }

  // Parse a single node.
  parseNode(): Node {
    switch (this.nextChar()) {
      case "<":
        return this.parseElement();
      default:
        return this.parseText();
    }
  }

  // Parse a text node.
  parseText(): Node {
    return new TextNode(
      [],
      this.consumeWhile((char) => char !== "<")
    );
  }

  // Parse a single element, including its open tag, contents, and closing tag.
  parseElement(): Node {
    // Opening tag.
    assertEqual(this.consumeChar(), "<");
    let tagName = this.parseTagName();
    let attributes = this.parseAttributes();
    assertEqual(this.consumeChar(), ">");

    // Contents.
    let children = this.parseNodes();

    // Closing tag.
    assertEqual(this.consumeChar(), "<");
    assertEqual(this.consumeChar(), "/");
    assertEqual(this.parseTagName(), tagName);
    assertEqual(this.consumeChar(), ">");

    return new ElementNode(children, {
      tagName,
      attributes,
    });
  }

  // Parse a single name="value" pair.
  parseAttr(): [string, string] {
    let name = this.parseTagName();
    assertEqual(this.consumeChar(), "=");
    let value = this.parseAttrValue();
    return [name, value];
  }

  // Parse a quoted value.
  parseAttrValue(): string {
    let openQuote = this.consumeChar();
    assertEqual(openQuote, '"', "'");
    let value = this.consumeWhile((char) => char !== openQuote);
    assertEqual(this.consumeChar(), openQuote);
    return value;
  }

  // Parse a list of name="value" pairs, separated by whitespace.
  parseAttributes(): AttributesMap {
    let attributes: { [key: string]: string } = {};
    while (true) {
      this.consumeWhitespace();
      if (this.nextChar() === ">") {
        break;
      }
      let [name, value] = this.parseAttr();
      attributes[name] = value;
    }
    return attributes;
  }

  // Parse a sequence of sibling nodes.
  parseNodes(): Node[] {
    let nodes = [];
    while (true) {
      this.consumeWhitespace();
      if (this.eof() || this.startsWith("</")) {
        break;
      }
      nodes.push(this.parseNode());
    }
    return nodes;
  }
}

// Parse an HTML document and return the root element.
export const parseHtml = (source: string): Node => {
  let nodes = new HtmlParser(source).parseNodes();

  // If the document contains a root element, just return it. Otherwise, create one.
  if (nodes.length === 1) {
    return nodes[0];
  } else {
    return new ElementNode(nodes, {
      tagName: "html",
      attributes: {},
    });
  }
};
