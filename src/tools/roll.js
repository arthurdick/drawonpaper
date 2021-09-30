import { undo } from "../undo.js";

import paper from "paper";

const slug = "roll";

let options = {
  color: "black",
};

let paperTool;
function create() {
  let selected;
  let toColor;

  let tool = new paper.Tool();
  tool.minDistance = 1;

  tool.onMouseDown = function (event) {
    selected = {};
    toColor = options.color;
  };

  tool.onMouseDrag = function (event) {
    let hit = paper.project.activeLayer.hitTestAll(event.point);
    if (hit) {
      hit.forEach((result) => {
        if (!(result.item.index in selected)) {
          selected[result.item.index] = result.item.fillColor.toCSS();
          result.item.fillColor = toColor;
        }
      });
    }
  };

  tool.onMouseUp = function (event) {
    if (Object.keys(selected).length < 1) {
      return;
    }

    let layerIndex = paper.project.activeLayer.index;
    let mySelected = selected;
    let newColor = toColor;

    let command = {
      src: slug,
      redo: function () {
        Object.keys(mySelected).forEach((key) => {
          paper.project.layers[layerIndex].children[key].fillColor = newColor;
        });
      },
      undo: function () {
        Object.keys(mySelected).forEach((key) => {
          paper.project.layers[layerIndex].children[key].fillColor =
            mySelected[key];
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

export const rollTool = {
  slug: slug,
  options: options,
  create: create,
  activate: activate,
};
