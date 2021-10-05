import { input } from "../input.js";
import { undo } from "../undo.js";
import { chrome } from "../chrome.js";

import paper from "paper";

const slug = "select";

let options = {};

function doHitTest(point) {
  let hitOptions = {
    class: paper.Path,
    fill: true,
    stroke: false,
    segments: false,
    curves: false,
    guides: false,
    tolerance: 8 / paper.view.zoom,
  };

  let result = paper.project.activeLayer.hitTest(point, hitOptions);
  if (result) {
    return result;
  }

  hitOptions.class = paper.Raster;
  return paper.project.activeLayer.hitTest(point, hitOptions);
}

let paperTool;
function create() {
  let tool = new paper.Tool();

  let dragging = false;

  let startPosition;

  tool.onMouseDown = function (event) {
    let hitTest = doHitTest(event.point);
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

      if (event.delta.x || event.delta.y) {
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
    }

    let hitTest = doHitTest(event.point);
    if (!hitTest) {
      paper.project.deselectAll();
    } else {
      hitTest.item.selected = !hitTest.item.selected;
    }

    chrome.triggerRender();
  };

  paperTool = tool;
}

function activate() {
  paperTool.activate();
}

function getActions() {
  let actions = {};
  if (paper.project.selectedItems.length) {
    actions["Delete"] = () => {
      input.deleteSelectedItems();
    };
  }
  return actions;
}

export const selectTool = {
  slug: slug,
  options: options,
  create: create,
  activate: activate,
  getActions: getActions,
};
