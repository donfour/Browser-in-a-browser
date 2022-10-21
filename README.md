# Browser in a browser

[Live demo](https://donfour.github.io/Browser-in-a-browser/)

---

Adopted from [robinson](https://github.com/mbrubeck/robinson) and [this excellent tutorial](https://limpet.net/mbrubeck/2014/08/08/toy-layout-engine-1.html).

Terminologies:

- Selector: a Simple Selector as defined in CSS 2.1.

![image](https://limpet.net/mbrubeck/images/2014/pipeline.svg)

Limitations:

- Only available length unit is px.
- Tags don't have a display value by default. Tag can be any arbitrary names.
- Only `display: block` supported at the moment.

Todos:

- Render inline boxes.
- Render text.
