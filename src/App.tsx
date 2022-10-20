import React, { useState } from "react";
import { buildLayoutTree, Dimensions, layoutTree } from "./lib/layout";
import { paint } from "./lib/painting";
import { CssParser } from "./lib/parsers/css-parser";
import { parseHtml } from "./lib/parsers/html-parser";
import { styleTree } from "./lib/style";

// const canvas = document.getElementById("tutorial");
// const ctx = canvas.getContext("2d");
// const draw = () => {
//   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//   ctx.fillStyle = "rgb(200, 0, 0)";
//   ctx.fillRect(10, 10, 50, 50);
//   ctx.strokeRect(10, 10, 50, 50);
//   ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
//   ctx.fillRect(30, 30, 50, 50);
//   ctx.strokeRect(30, 30, 50, 50);
// };

function App() {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");

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
        <button
          onClick={() => {
            const root = parseHtml(html);
            console.log("Parsed HTML:", root);

            const rules = new CssParser(css).parseRules();
            console.log("Parsed CSS:", rules);

            const st = styleTree(root, { rules });
            console.log("Style tree:", st);

            const ctx = (
              document.getElementById("canvas") as HTMLCanvasElement
            )?.getContext("2d");

            if (!ctx) return;

            const viewport = new Dimensions();
            viewport.content.width = ctx.canvas.width;
            viewport.content.height = ctx.canvas.height;

            const layoutRoot = layoutTree(st, viewport);
            console.log("Layout tree:", layoutRoot);

            paint(layoutRoot, ctx);
          }}
        >
          Parse
        </button>
      </div>
      <div className="flex-1">
        <canvas id="canvas" className="h-full w-full bg-white" />
      </div>
    </div>
  );
}

export default App;
