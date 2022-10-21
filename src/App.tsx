import React, { useState } from "react";
import { Dimensions, layoutTree } from "./lib/layout";
import { paint } from "./lib/painting";
import { CssParser } from "./lib/parsers/css-parser";
import { HtmlParser } from "./lib/parsers/html-parser";
import { getStyleTree } from "./lib/style";

const defaultHtml = `
<hello class="a">
  <world id="b">
  </world>
</hello>
`;

const defaultCss = `
hello.a {
  display: block;
  padding: 20;
  background: #ff0000;
}

world#b {
  display: block;
  padding: 8;
  background: #00ff00;
}
`;

function App() {
  const [html, setHtml] = useState(defaultHtml);
  const [css, setCss] = useState(defaultCss);

  const onRender = () => {
    const root = new HtmlParser(html).parseHtml();
    const rules = new CssParser(css).parseRules();
    const styleTree = getStyleTree(root, { rules });

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const viewport = new Dimensions();
    viewport.content.width = ctx.canvas.width;
    viewport.content.height = ctx.canvas.height;

    const layoutRoot = layoutTree(styleTree, viewport);

    paint(layoutRoot, ctx);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-16">
        <h1 className="text-2xl">Welcome to the browser inside a browser!</h1>
        <p className="mb-2">
          Try writing HTML and CSS below and see what happens.
        </p>
        <textarea
          className="block border w-full h-64 mb-4"
          placeholder="HTML here..."
          value={html}
          onChange={(e) => setHtml(e.target.value)}
        />
        <textarea
          className="block border w-full h-64 mb-4"
          placeholder="CSS here..."
          value={css}
          onChange={(e) => setCss(e.target.value)}
        />
        <button
          className="border border-black rounded px-4 py-2"
          onClick={onRender}
        >
          Render
        </button>
      </div>
      <div className="flex-1 border">
        <canvas id="canvas" className="h-full w-full bg-white" />
      </div>
    </div>
  );
}

export default App;
