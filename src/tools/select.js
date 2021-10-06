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

  let selectedPaths;

  tool.onMouseDown = function (event) {
    let hitTest = doHitTest(event.point);
    dragging = hitTest && hitTest.item.selected;

    if (dragging) {
      selectedPaths = [];
      paper.project.selectedItems.forEach((selectedItem) => {
        let selectedPath = [selectedItem.index];
        while (selectedItem.parent != paper.project.activeLayer) {
          selectedItem = selectedItem.parent;
          selectedPath.unshift(selectedItem.index);
        }
        selectedPaths.push(selectedPath);
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
        let paths = selectedPaths;
        let delta = event.delta;

        paper.project.selectedItems.forEach((item) => {
          let reverse = new paper.Point(0, 0).subtract(delta);
          item.translate(reverse);
        });

        let command = {
          src: slug + "-move",
          redo: function () {
            paths.forEach((path) => {
              let item = paper.project.layers[layerIndex];
              path.forEach((index) => {
                item = item.children[index];
              });
              item.translate(delta);
            });
          },
          undo: function () {
            paths.forEach((path) => {
              let item = paper.project.layers[layerIndex];
              path.forEach((index) => {
                item = item.children[index];
              });
              item.translate(new paper.Point(0, 0).subtract(delta));
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
