import "./index.css";

import { tools } from "./tools.js";
import { chrome } from "./chrome.js";
import { input } from "./input.js";
import { undo } from "./undo.js";

import paper from "paper";
//paper.settings.applyMatrix = false;
paper.install(window);

document.getElementById("paperCanvas").addEventListener("pointerdown", () => {
  // prevent focus from repeatedly opening virtual keyboard on tablet
  document.activeElement.blur();
});

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
