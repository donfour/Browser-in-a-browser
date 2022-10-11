import { AttributesMap, ElementNode, Node, TextNode } from "./dom";

function assert(condition: boolean) {
  if (!condition) throw new Error("assert failed");
}

export class Parser {
  position: number;
  input: string;

  constructor(input: string) {
    this.position = 0;
    this.input = input;
  }

  // Read the current character without consuming it.
  nextChar(): string {
    return this.input[this.position];
  }

  // Do the next characters start with the given string?
  startsWith(s: string): boolean {
    return this.input.slice(this.position).startsWith(s);
  }

  // Return true if all input is consumed.
  eof(): boolean {
    return this.position >= this.input.length;
  }

  // Return the current character, and advance this.position to the next character.
  consumeChar(): string {
    const currentChar = this.input[this.position];
    this.position++;
    return currentChar;
  }

  // Consume characters until `test` returns false.
  consumeWhile(test: (char: string) => boolean): string {
    const result = [];
    while (!this.eof() && test(this.nextChar())) {
      result.push(this.consumeChar());
    }
    return result.join("");
  }

  // Consume and discard zero or more whitespace characters.
  consumeWhitespace(): void {
    this.consumeWhile((char) => char === " ");
  }

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
    assert(this.consumeChar() === "<");
    let tagName = this.parseTagName();
    let attributes = this.parseAttributes();
    assert(this.consumeChar() === ">");

    // Contents.
    let children = this.parseNodes();

    // Closing tag.
    assert(this.consumeChar() === "<");
    assert(this.consumeChar() === "/");
    assert(this.parseTagName() === tagName);
    assert(this.consumeChar() === ">");

    return new ElementNode(children, {
      tagName,
      attributes,
    });
  }

  // Parse a single name="value" pair.
  parseAttr(): [string, string] {
    let name = this.parseTagName();
    assert(this.consumeChar() == "=");
    let value = this.parseAttrValue();
    return [name, value];
  }

  // Parse a quoted value.
  parseAttrValue(): string {
    let openQuote = this.consumeChar();
    assert(openQuote === '"' || openQuote === "'");
    let value = this.consumeWhile((char) => char !== openQuote);
    assert(this.consumeChar() === openQuote);
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
export const parse = (source: string): Node => {
  let nodes = new Parser(source).parseNodes();

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
