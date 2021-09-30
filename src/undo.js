import { chrome } from "./chrome.js";

import React from "react";
import IconButton from "@mui/material/IconButton";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

let savedIndex;

let commands;
let length;
let head;

function init() {
  commands = [];
  length = 0;
  head = -1;
  savedIndex = -1;
}

function addCommand(commandObj) {
  if (canRedo()) {
    commands = commands.slice(0, head + 1); //remove commands after current head

    if (savedIndex > head) {
      savedIndex = -2;
    }
  }

  commands.push(commandObj);

  length = commands.length;

  redoLast(); //execute the new command immediately
}

function canUndo() {
  return head >= 0;
}

function undoLast() {
  if (canUndo()) {
    try {
      commands[head].undo();
    } catch (e) {
      console.error(commands[head], e);
    }
    head--;
    chrome.triggerRender();
  }
}

function canRedo() {
  return head < length - 1;
}

function redoLast() {
  if (canRedo()) {
    head++;
    try {
      commands[head].redo();
    } catch (e) {
      console.error(commands[head], e);
    }
    chrome.triggerRender();
  }
}

function setSaved() {
  savedIndex = head;
}

function isSaved() {
  return head == savedIndex;
}

////////////////////////////////////////

export class UndoCommands extends React.Component {
  render() {
    return (
      <span>
        <IconButton
          edge="end"
          onClick={undoLast}
          size="large"
          disabled={!canUndo()}
        >
          <UndoIcon />
        </IconButton>
        <IconButton
          edge="end"
          onClick={redoLast}
          size="large"
          disabled={!canRedo()}
        >
          <RedoIcon />
        </IconButton>
      </span>
    );
  }
}

export const undo = {
  init: init,
  addCommand: addCommand,
  canUndo: canUndo,
  undo: undoLast,
  canRedo: canRedo,
  redo: redoLast,
  setSaved: setSaved,
  isSaved: isSaved,
};
