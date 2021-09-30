import { tools } from "../tools.js";
import { chrome } from "../chrome.js";

import paper from "paper";

const slug = "pan";

let options = {};

let paperTool;
function create() {
  let tool = new paper.Tool();

  tool.onMouseDown = function () {
    tools.setPointer("grabbing");
  };

  tool.onMouseDrag = function (event) {
    let delta = event.downPoint.subtract(event.point);
    paper.view.scrollBy(delta);

    chrome.triggerRender();
  };

  tool.onMouseUp = function () {
    tools.setPointer("grab");
  };

  paperTool = tool;
}

function activate() {
  paperTool.activate();
}

export const panTool = {
  slug: slug,
  create: create,
  options: options,
  activate: activate,
};
