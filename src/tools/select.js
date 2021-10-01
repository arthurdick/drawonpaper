import { undo } from "../undo.js";

import paper from "paper";

const slug = "select";

let options = {};

let paperTool;
function create() {
  let tool = new paper.Tool();

  let hitOptions;
  
  let dragging = false;

  let startPosition;

  tool.onMouseDown = function (event) {
    hitOptions = {
      fill: true,
      stroke: false,
      segments: false,
      curves: false,
      guides: false,
      tolerance: 8 / paper.view.zoom,
    };

    let hitTest = paper.project.activeLayer.hitTest(event.point, hitOptions);
    dragging = hitTest && hitTest.item.selected;

    if (dragging) {
      startPosition = {};
      paper.project.selectedItems.forEach((selectedItem) => {
        if (selectedItem.parent != paper.project.activeLayer) {
          selectedItem = selectedItem.parent;
        }
        startPosition[selectedItem.index] = selectedItem.position;
      });
    }
  };

  tool.onMouseDrag = function (event) {
    if (!dragging) {
      return;
    }
    paper.project.selectedItems.forEach((selectedItem) => {
      selectedItem.translate(event.delta);
    });
  };

  tool.onMouseUp = function (event) {
    if (dragging) {
      dragging = false;

      let layerIndex = paper.project.activeLayer.index;
      let actionStart = startPosition;
      let actionEnd = {};

      paper.project.selectedItems.forEach((selectedItem) => {
        if (selectedItem.parent != paper.project.activeLayer) {
          selectedItem = selectedItem.parent;
        }
        actionEnd[selectedItem.index] = selectedItem.position;
      });

      let command = {
        src: slug + "-move",
        redo: function () {
          Object.keys(actionStart).forEach((key) => {
            paper.project.layers[layerIndex].children[key].position =
              actionEnd[key];
          });
        },
        undo: function () {
          Object.keys(actionStart).forEach((key) => {
            paper.project.layers[layerIndex].children[key].position =
              actionStart[key];
          });
        },
      };

      undo.addCommand(command);

      return;
    }

    let hitTest = paper.project.activeLayer.hitTest(event.point, hitOptions);
    if (!hitTest || !event.modifiers.shift) {
      paper.project.deselectAll();
    }

    if (hitTest) {
      hitTest.item.selected = !hitTest.item.selected;
    }
  };

  paperTool = tool;
}

function activate() {
  paperTool.activate();
}

export const selectTool = {
  slug: slug,
  options: options,
  create: create,
  activate: activate,
};
