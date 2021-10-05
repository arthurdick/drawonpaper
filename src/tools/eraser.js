import { undo } from "../undo.js";
import { input } from "../input.js";

import paper from "paper";

const slug = "eraser";

let options = {
  size: 15,
  pressure: false,
};

let paperTool;
function create() {
  let path;
  let tool = new paper.Tool();
  tool.minDistance = 1;

  tool.onMouseDown = function (event) {
    path = new paper.Path();
    path.fillColor = "grey";
    path.opacity = 0.5;
    path.blendMode = "difference";

    path.add(event.point);
  };

  tool.onMouseDrag = function (event) {
    let step = new paper.Point(event.delta).normalize(
      options.size * input.getPressure(options.pressure)
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

    let layerIndex = paper.project.activeLayer.index;
    let changed = [];
    let originalPaths = [];

    paper.project.layers[layerIndex].children.forEach((child) => {
      if (
        child.subtract &&
        child.index !== path.index &&
        (child.intersects(path) ||
          path.hitTest(child.position) ||
          child.hitTest(path.position))
      ) {
        changed.push(child.index);
        originalPaths.push(child.exportJSON());
      }
    });

    let erasePath = path.exportJSON();
    path.remove();

    if (!changed.length) {
      //nothing was erased
      return;
    }

    let command = {
      src: slug,
      redo: function () {
        let eraseItem = paper.project.layers[layerIndex].importJSON(erasePath);

        changed.forEach((childIndex) => {
          let child = paper.project.layers[layerIndex].children[childIndex];
          let subtracted = child.subtract(eraseItem, {
            insert: false,
            trace: true,
          });
          child.replaceWith(subtracted);
        });

        eraseItem.remove();
      },
      undo: function () {
        let index = 0;
        changed.forEach((childIndex) => {
          let orig = paper.project.layers[layerIndex].importJSON(
            originalPaths[index]
          );
          paper.project.layers[layerIndex].children[childIndex].replaceWith(
            orig
          );

          index++;
        });
      },
    };

    undo.addCommand(command);
  };
  paperTool = tool;
}

function activate() {
  paperTool.activate();
}

export const eraserTool = {
  slug: slug,
  options: options,
  create: create,
  activate: activate,
};
