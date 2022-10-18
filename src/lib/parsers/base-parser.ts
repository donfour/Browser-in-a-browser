export function assertEqual(actual: string, ...expect: string[]) {
  if (expect.every((s) => s !== actual))
    throw new Error(`Expect "${expect}", but got "${actual}".`);
}

export class BaseParser {
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
    this.consumeWhile((char) => /\s/.test(char));
  }
}
