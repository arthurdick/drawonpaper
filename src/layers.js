import React from "react";
import PropTypes from "prop-types";

import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";

import AddIcon from "@mui/icons-material/AddBox";
import MoveUpIcon from "@mui/icons-material/ArrowUpward";
import MoveDownIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Delete";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CircleIcon from "@mui/icons-material/Circle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TextField from "@mui/material/TextField";

import { undo } from "./undo.js";
import { chrome } from "./chrome.js";

import paper from "paper";

function addNewLayer() {
  paper.project.deselectAll();

  let newLayer = new paper.Layer();
  let layerIndex = newLayer.index;
  newLayer.remove();

  let command = {
    src: "layer-add",
    redo: function () {
      new paper.Layer();
    },
    undo: function () {
      paper.project.layers[layerIndex].remove();
    },
  };

  undo.addCommand(command);

  return newLayer;
}

function removeActive() {
  if (paper.project.layers.length == 1) {
    return; // prevent last layer from being deleted
  }

  let layerIndex = paper.project.activeLayer.index;
  let json = paper.project.activeLayer.exportJSON();

  let command = {
    src: "layer-remove",
    redo: function () {
      paper.project.layers[layerIndex].remove();
    },
    undo: function () {
      let layer = paper.project.importJSON(json);
      paper.project.insertLayer(layerIndex, layer);
    },
  };

  undo.addCommand(command);
}

function moveActiveUp() {
  let fromIndex = paper.project.activeLayer.index;
  let toIndex = fromIndex + 1;

  if (toIndex > paper.project.layers.length - 1) return;

  swapLayersByIndex(fromIndex, toIndex);
}

function moveActiveDown() {
  let fromIndex = paper.project.activeLayer.index;
  let toIndex = fromIndex - 1;

  if (toIndex < 0) return;

  swapLayersByIndex(fromIndex, toIndex);
}

function swapLayersByIndex(fromIndex, toIndex) {
  let command = {
    src: "layer-swap",
    redo: function () {
      paper.project.insertLayer(toIndex, paper.project.layers[fromIndex]);
      paper.project.layers[toIndex].activate();
    },
    undo: function () {
      paper.project.insertLayer(fromIndex, paper.project.layers[toIndex]);
      paper.project.layers[fromIndex].activate();
    },
  };

  undo.addCommand(command);
}

//////////////////////////////////////////////

let focusedIndex;
let focusedName;

export class LayerDrawer extends React.Component {
  onLayerAction(e, action) {
    switch (action) {
      case "add":
        addNewLayer();
        break;
      case "up":
        moveActiveUp();
        break;
      case "down":
        moveActiveDown();
        break;
      case "remove":
        removeActive();
        break;
    }

    chrome.triggerRender();
  }

  toggleLayerVisible(e) {
    let layerIndex = e.currentTarget.parentElement.parentElement.dataset.index;
    let layer = paper.project.layers[layerIndex];
    layer.visible = !layer.visible;

    chrome.triggerRender();
  }

  toggleActiveLayer(e) {
    paper.project.deselectAll();

    let layerIndex = e.currentTarget.parentElement.parentElement.dataset.index;
    paper.project.layers[layerIndex].activate();

    chrome.triggerRender();
  }

  setUserDefinedName(event) {
    paper.project.layers[focusedIndex].data.name = event.target.value;
    chrome.triggerRender();
  }

  handleFocusName(event) {
    focusedIndex =
      event.currentTarget.parentElement.parentElement.parentElement.dataset
        .index;
    focusedName = event.target.value;
    event.target.select();
  }

  handleBlurName(event) {
    let layerIndex = focusedIndex;
    let name = event.target.value;
    let prevName = focusedName;

    let command = {
      src: "layer-name",
      redo: function () {
        paper.project.layers[layerIndex].data.name = name;
      },
      undo: function () {
        paper.project.layers[layerIndex].data.name = prevName;
      },
    };

    undo.addCommand(command);
  }

  render() {
    return (
      <Drawer
        variant="persistent"
        anchor={"right"}
        open={this.props.open}
        onClose={this.props.onClose}
        className="layerdrawer"
      >
        <ToggleButtonGroup
          exclusive
          onChange={this.onLayerAction}
          sx={{ justifyContent: "center", paddingTop: "55px" }}
        >
          <ToggleButton value={"add"}>
            <AddIcon />
          </ToggleButton>
          <ToggleButton
            value={"up"}
            disabled={!paper.project.activeLayer.nextSibling}
          >
            <MoveUpIcon />
          </ToggleButton>
          <ToggleButton
            value={"down"}
            disabled={!paper.project.activeLayer.previousSibling}
          >
            <MoveDownIcon />
          </ToggleButton>
          <ToggleButton
            value={"remove"}
            disabled={paper.project.layers.length == 1}
          >
            <RemoveIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <List
          dense={true}
          sx={{
            display: "flex",
            flexDirection: "column-reverse",
            paddingBottom: "55px",
          }}
        >
          {paper.project.layers.map((layer) => {
            let layerIndex = layer.index;
            return (
              <ListItem key={layerIndex} data-index={layerIndex}>
                <ListItemIcon>
                  <IconButton onClick={this.toggleLayerVisible}>
                    {layer.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                  <IconButton onClick={this.toggleActiveLayer}>
                    {layer == paper.project.activeLayer ? (
                      <CheckCircleIcon />
                    ) : (
                      <CircleIcon />
                    )}
                  </IconButton>
                </ListItemIcon>
                <TextField
                  size="small"
                  value={layer.data.name ? layer.data.name : ""}
                  onChange={this.setUserDefinedName}
                  onFocus={this.handleFocusName}
                  onBlur={this.handleBlurName}
                />
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    );
  }
}

LayerDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export const layers = {
  addNewLayer: addNewLayer,
};
