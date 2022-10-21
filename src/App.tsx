import React, { useState } from "react";
import { Dimensions, layoutTree } from "./lib/layout";
import { paint } from "./lib/painting";
import { CssParser } from "./lib/parsers/css-parser";
import { HtmlParser } from "./lib/parsers/html-parser";
import { getStyleTree } from "./lib/style";

function App() {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");

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
        <p>Try writing HTML and CSS below and see what happens.</p>
        <textarea
          className="block border w-full h-64"
          placeholder="HTML here..."
          value={html}
          onChange={(e) => setHtml(e.target.value)}
        />
        <textarea
          className="block border w-full h-64"
          placeholder="CSS here..."
          value={css}
          onChange={(e) => setCss(e.target.value)}
        />
        <button onClick={onRender}>Render</button>
      </div>
      <div className="flex-1">
        <canvas id="canvas" className="h-full w-full bg-white" />
      </div>
    </div>
  );
}

export default App;
