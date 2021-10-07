import paper from "paper";
import FileSaver from "file-saver";
import hash from "object-hash";

import { undo } from "./undo.js";
import { layers } from "./layers.js";
import { chrome } from "./chrome.js";

const EXPORT_EXTENSION = ".json";

let canvas;

let penPressure = 0.5;

let clipboard = [];

function init() {
  canvas = document.getElementById("paperCanvas");

  paper.setup(canvas);

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);

  canvas.addEventListener("wheel", onWheel);

  document.addEventListener("keydown", onKeyDown);
}

function recenterCanvas() {
  paper.view.center = new paper.Point(0, 0);
  chrome.triggerRender();
}

function setZoom(zoom) {
  if (zoom < 0.01) zoom = 0.01;
  if (zoom > 50) zoom = 50;

  paper.view.zoom = zoom;
  chrome.triggerRender();
}

function onWheel(event) {
  event.preventDefault();

  let newZoom = paper.view.zoom + event.deltaY * -0.01;
  setZoom(newZoom);
}

function resetZoom() {
  setZoom(1);
}

function copySelection() {
  clipboard = [];
  paper.project.selectedItems.forEach((item) => {
    clipboard.push(item.exportJSON());
  });
}

function pasteClipboard() {
  let activeLayer = paper.project.activeLayer.index;
  let pasted = [];
  clipboard.forEach((json) => {
    pasted.push(json);
  });

  let command = {
    src: "paste-clipboard",
    redo: function () {
      pasted.forEach((json) => {
        paper.project.layers[activeLayer].importJSON(json);
      });
    },
    undo: function () {
      let count = pasted.length;
      for (let i = count; i > 0; i--) {
        paper.project.layers[activeLayer].lastChild.remove();
      }
    },
  };

  undo.addCommand(command);

  chrome.triggerRender();
}

function onKeyDown(event) {
  if (event.target.tagName === "INPUT") {
    return;
  }

  switch (event.key) {
    case "u":
    case "U":
      undo.undo();
      break;
    case "r":
    case "R":
      undo.redo();
      break;
    case "0":
      resetZoom();
      break;
    case "Backspace":
    case "Delete":
      deleteSelectedItems();
      break;
    case "c":
    case "C":
      copySelection();
      break;
    case "v":
    case "V":
      pasteClipboard();
      break;
  }
}

function deleteSelectedItems() {
  if (!paper.project.selectedItems.length) {
    return; // no items were actually deleted
  }

  let layerIndex = paper.project.activeLayer.index;
  let json = {};
  paper.project.selectedItems.forEach((item) => {
    json[item.index] = item.exportJSON();
  });

  let command = {
    src: "delete",
    redo: function () {
      let removed = [];
      Object.keys(json).forEach((key) => {
        removed.push(paper.project.layers[layerIndex].children[key]);
      });
      removed.forEach((item) => {
        item.remove();
      });
    },
    undo: function () {
      Object.keys(json).forEach((key) => {
        key = Number(key);
        let item = paper.project.importJSON(json[key]);
        paper.project.layers[layerIndex].insertChild(key, item);
      });
    },
  };

  undo.addCommand(command);
}

function createNewDocument() {
  paper.project.clear();
  layers.addNewLayer();

  recenterCanvas();
  resetZoom();

  undo.init();
}

function exportDocument() {
  let json = paper.project.exportJSON();
  let json_hash = hash(json);
  let blob = new Blob([json], {
    type: "application/json;charset=utf-8",
  });
  FileSaver.saveAs(blob, json_hash.substring(0, 16) + EXPORT_EXTENSION);
  undo.setSaved();
}

function importDocument() {
  let fileIn = document.createElement("input");
  fileIn.type = "file";
  fileIn.accept = EXPORT_EXTENSION;

  fileIn.onchange = function () {
    let reader = new FileReader();
    reader.readAsText(fileIn.files[0]);

    reader.addEventListener(
      "load",
      function () {
        paper.project.clear();
        paper.view.update();
        paper.project.importJSON(reader.result);

        recenterCanvas();
        resetZoom();

        undo.init();
        chrome.triggerRender();
      },
      false
    );
  };

  fileIn.click();
}

function pointerDown(e) {
  canvas.setPointerCapture(e.pointerId);
  penPressure = e.pressure;
  canvas.addEventListener("pointermove", pointerMove);
}
function pointerMove(e) {
  penPressure = e.pressure;
}
function pointerUp(e) {
  canvas.removeEventListener("pointermove", pointerMove);
  canvas.releasePointerCapture(e.pointerId);
}

function getPressure(useDevice) {
  return useDevice ? penPressure : 0.5;
}

function uploadReference() {
  let fileIn = document.createElement("input");
  fileIn.type = "file";
  fileIn.accept = ".jpg,.jpeg,.png,.bmp";

  fileIn.onchange = function () {
    let reader = new FileReader();
    reader.readAsDataURL(fileIn.files[0]);

    reader.addEventListener(
      "load",
      function () {
        let raster = new paper.Raster(reader.result);
        raster.position = [0, 0];

        let layerIndex = paper.project.activeLayer.index;
        let rasterIndex = raster.index;
        let json = raster.exportJSON();

        raster.remove();

        let command = {
          src: "reference",
          redo: function () {
            paper.project.layers[layerIndex].importJSON(json);
          },
          undo: function () {
            paper.project.layers[layerIndex].children[rasterIndex].remove();
          },
        };

        undo.addCommand(command);
      },
      false
    );
  };

  fileIn.click();
}

export const input = {
  init: init,
  setZoom: setZoom,
  recenterCanvas: recenterCanvas,
  getPressure: getPressure,
  exportDocument: exportDocument,
  importDocument: importDocument,
  createNewDocument: createNewDocument,
  uploadReference: uploadReference,
  deleteSelectedItems: deleteSelectedItems,
};
