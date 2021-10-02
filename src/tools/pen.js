import { undo } from "../undo.js";
import { input } from "../input.js";

import paper from "paper";

const slug = "pen";

let options = {
  color: "black",
  size: 2,
  pressure: false,
};

let paperTool;
function create() {
  let tool = new paper.Tool();
  tool.minDistance = 1;

  let path;
  let lastPoint;

  function addCap(point, delta) {
    delta.length = options.size;
    let capPoint = point.add(delta);
    path.add(capPoint);
  }

  tool.onMouseDown = function (event) {
    path = new paper.Path();
    path.fillColor = options.color;

    lastPoint = undefined;
  };

  tool.onMouseDrag = function (event) {
    if (event.count == 0) {
      addCap(event.middlePoint, event.delta.multiply(-1));
    } else {
      let step = new paper.Point(event.delta).normalize(
        input.getPressure(options.pressure) * options.size
      );
      step.angle += 90;

      let top = new paper.Point(event.middlePoint).add(step);
      let bottom = new paper.Point(event.middlePoint).subtract(step);
      path.add(top);
      path.insert(0, bottom);
      path.smooth();
    }
    lastPoint = event.middlePoint;
  };

  tool.onMouseUp = function (event) {
    if (!lastPoint) {
      path = paper.Path.Circle(new paper.Point(event.point), options.size / 2);
      path.fillColor = options.color;
    } else {
      addCap(event.point, event.point.subtract(lastPoint));
      path.closed = true;
      path.smooth();
    }

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

export const penTool = {
  slug: slug,
  options: options,
  create: create,
  activate: activate,
};
