import "./index.css";

import { tools } from "./tools.js";
import { chrome } from "./chrome.js";
import { input } from "./input.js";
import { undo } from "./undo.js";

import paper from "paper";
paper.install(window);

window.onload = function () {
  input.init();
  undo.init();

  input.createNewDocument();

  chrome.init();
  tools.init();
};

window.onbeforeunload = function (event) {
  if (!undo.isSaved()) {
    let message =
      "There are unsaved changes. Leave and discard the unsaved changes?";
    event.returnValue = message;
    return message;
  }
};

window.peek = {
  tools: tools,
  chrome: chrome,
  input: input,
  undo: undo,
};
