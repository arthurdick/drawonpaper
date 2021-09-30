import { undo } from "../undo.js";
import { input } from "../input.js";

import paper from "paper";

const slug = "brush";

let options = {
  color: "black",
  size: 8,
  pressure: true,
};

let paperTool;
function create() {
  let path;
  let tool = new paper.Tool();
  tool.minDistance = 1;

  tool.onMouseDown = function (event) {
    path = new paper.Path();
    path.fillColor = options.color;

    path.add(event.point);
  };

  tool.onMouseDrag = function (event) {
    let step = new paper.Point(event.delta).normalize(
      input.getPressure(options.pressure) * options.size
    );
    step.angle += 90;

    let top = new paper.Point(event.middlePoint).add(step);
    let bottom = new paper.Point(event.middlePoint).subtract(step);

    path.add(top);
    path.insert(0, bottom);
    path.smooth();
  };

  tool.onMouseUp = function (event) {
    path.add(event.point);
    path.closed = true;
    path.smooth();

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

export const brushTool = {
  slug: slug,
  options: options,
  create: create,
  activate: activate,
};
