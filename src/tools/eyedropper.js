import { chrome } from "../chrome.js";

import paper from "paper";

const slug = "eyedropper";

let options = {
  color: null,
};

let paperTool;
function create() {
  let tool = new paper.Tool();
  tool.maxDistance = 1;

  tool.onMouseDown = function (event) {
    let hitResult = paper.project.hitTest(event.point, { fill: true });
    if (hitResult) {
      options.color = hitResult.item.fillColor.toCSS();
      chrome.triggerRender();
    }
  };

  tool.onMouseDrag = function (event) {
    let hitResult = paper.project.hitTest(event.point, { fill: true });
    if (hitResult) {
      options.color = hitResult.item.fillColor.toCSS();
      chrome.triggerRender();
    }
  };

  paperTool = tool;
}

function activate() {
  paperTool.activate();
}

export const eyedropperTool = {
  slug: slug,
  options: options,
  create: create,
  activate: activate,
};
