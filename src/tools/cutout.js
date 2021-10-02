import { undo } from "../undo.js";

import paper from "paper";

const slug = "cutout";

let options = {
  color: "black",
};

let paperTool;
function create() {
  let path;
  let tool = new paper.Tool();
  tool.minDistance = 1;

  tool.onMouseDown = function (event) {
    path = new paper.Path();

    path.strokeCap = "round"; //square, butt
    path.strokeJoin = "round"; //miter, bevel
    path.fillColor = options.color;

    path.add(event.point);
  };

  tool.onMouseDrag = function (event) {
    path.add(event.point);
    path.smooth();
  };

  tool.onMouseUp = function (event) {
    path.add(event.point);

    let layerIndex = paper.project.activeLayer.index;
    let pathIndex = path.index;
    path.remove();
    let json = path.exportJSON();

    let command = {
      src: slug,
      redo: function () {
        paper.project.layers[layerIndex].importJSON(json);
      },
      undo: function () {
        paper.project.layers[layerIndex].children[pathIndex].remove();
      },
    };

    undo.addCommand(command);
  };
  paperTool = tool;
}

function activate() {
  paperTool.activate();
}

export const cutoutTool = {
  slug: slug,
  options: options,
  create: create,
  activate: activate,
};
