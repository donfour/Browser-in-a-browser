import { assertEqual, Parser } from "./parser";

export type Stylesheet = {
  rules: Rule[];
};

type Rule = {
  selectors: Selector[];
  declarations: Declaration[];
};

class Selector {
  tagName?: string;
  id?: string;
  classList: string[];

  constructor(tagName?: string, id?: string, classList?: string[]) {
    this.tagName = tagName;
    this.id = id;
    this.classList = classList || [];
  }

  specificity(): [number, number, number] {
    // http://www.w3.org/TR/selectors/#specificity
    let a = this.id ? 1 : 0;
    let b = this.classList.length;
    let c = this.tagName ? 1 : 0;
    return [a, b, c];
  }
}

type Declaration = {
  name: string;
  value: string;
};

function validIdentifierChar(c: string): boolean {
  return /[a-zA-Z0-9\-]/.test(c);
}

export class CssParser extends Parser {
  /// Parse a property name or keyword.
  parseIdentifier(): string {
    return this.consumeWhile(validIdentifierChar);
  }

  // Parse one simple selector, e.g.: `type#id.class1.class2.class3`
  parseSimpleSelector(): Selector {
    let selector = new Selector();
    while (!this.eof()) {
      const nextChar = this.nextChar();
      if (nextChar === "#") {
        this.consumeChar();
        selector.id = this.parseIdentifier();
      } else if (nextChar === ".") {
        this.consumeChar();
        selector.classList.push(this.parseIdentifier());
      } else if (nextChar === "*") {
        // universal selector
        this.consumeChar();
      } else if (validIdentifierChar(nextChar)) {
        selector.tagName = this.parseIdentifier();
      } else {
        break;
      }
    }
    return selector;
  }

  /// Parse a list of declarations enclosed in `{ ... }`.
  parseDeclarations(): Declaration[] {
    assertEqual(this.consumeChar(), "{");
    let declarations = [];
    while (true) {
      this.consumeWhitespace();
      if (this.nextChar() === "}") {
        this.consumeChar();
        break;
      }
      declarations.push(this.parseDeclaration());
    }
    return declarations;
  }

  /// Parse one `<property>: <value>;` declaration.
  parseDeclaration(): Declaration {
    let propertyName = this.parseIdentifier();
    this.consumeWhitespace();
    assertEqual(this.consumeChar(), ":");
    this.consumeWhitespace();
    let value = this.consumeWhile((c) => validIdentifierChar(c) || c === "#");
    this.consumeWhitespace();
    assertEqual(this.consumeChar(), ";");

    return {
      name: propertyName,
      value: value,
    } as Declaration;
  }

  // Parse a rule set: `<selectors> { <declarations> }`.
  parseRule(): Rule {
    const selectors = this.parseSelectors();
    const declarations = this.parseDeclarations();
    const rule: Rule = {
      selectors,
      declarations,
    };
    return rule;
  }

  // Parse a comma-separated list of selectors.
  parseSelectors(): Selector[] {
    let selectors = [];
    while (true) {
      selectors.push(this.parseSimpleSelector());
      this.consumeWhitespace();
      const nextChar = this.nextChar();
      if (nextChar === ",") {
        this.consumeChar();
        this.consumeWhitespace();
      } else if (nextChar === "{") {
        // start of declarations
        break;
      } else {
        throw new Error(`Unexpected character ${nextChar} in selector list`);
      }
    }
    // Return selectors with highest specificity first, for use in matching.
    selectors.sort((a, b) => {
      const aSpecificity = a.specificity();
      const bSpecificity = b.specificity();
      for (let i = 0; i < aSpecificity.length; i++) {
        if (aSpecificity[i] !== bSpecificity[i])
          return bSpecificity[i] - aSpecificity[i];
      }
      return 0;
    });
    return selectors;
  }
}
