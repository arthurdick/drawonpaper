import React from "react";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Popper from "@mui/material/Popper";
import { RgbaStringColorPicker } from "react-colorful";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Slider from "@mui/material/Slider";
import Input from "@mui/material/Input";

import PanToolIcon from "@mui/icons-material/PanTool";
import Create from "@mui/icons-material/Create";
import Brush from "@mui/icons-material/Brush";
import Puzzle from "@mui/icons-material/Extension";
import FormatPaint from "@mui/icons-material/FormatPaint";
import Eyedropper from "@mui/icons-material/Colorize";
import PaletteIcon from "@mui/icons-material/Palette";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Eraser from "mdi-material-ui/Eraser";
import CursorDefault from "mdi-material-ui/CursorDefault";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import paper from "paper";

import { chrome } from "./chrome.js";

import { panTool } from "./tools/pan.js";
import { selectTool } from "./tools/select.js";
import { penTool } from "./tools/pen.js";
import { brushTool } from "./tools/brush.js";
import { cutoutTool } from "./tools/cutout.js";
import { rollTool } from "./tools/roll.js";
import { eyedropperTool } from "./tools/eyedropper.js";
import { eraserTool } from "./tools/eraser.js";

let toolsList = {};

function init() {
  initTool(panTool);
  initTool(selectTool);
  initTool(penTool);
  initTool(brushTool);
  initTool(cutoutTool);
  initTool(rollTool);
  initTool(eyedropperTool);
  initTool(eraserTool);

  activateTool(panTool.slug);
}

function initTool(theTool) {
  theTool.create();
  toolsList[theTool.slug] = theTool;
}

let activeTool = {};

function activateTool(toolSlug) {
  activeTool = toolsList[toolSlug];
  activeTool.activate();

  pickerEl = undefined;
  settingsEl = undefined;
  actionsEl = undefined;

  if (eyedropperTool.options.color && activeTool.options.color) {
    activeTool.options.color = eyedropperTool.options.color;
    eyedropperTool.options.color = null;
  }

  setPointerForTool(toolSlug);

  paper.project.deselectAll();

  chrome.triggerRender();
}

function setPointerForTool(tool) {
  let pointer = "default";
  switch (tool) {
    case penTool.slug:
    case brushTool.slug:
    case cutoutTool.slug:
      pointer = "crosshair";
      break;
    case panTool.slug:
      pointer = "grab";
      break;
  }

  setPointer(pointer);
}

function setPointer(pointerName) {
  document.getElementById("paperCanvas").style.cursor = pointerName;
}

/////////////////////////////////////////////

function objectHasKey(obj, key) {
  if( !obj || typeof obj != "object") {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(obj, key);
}

let pickerEl;
let settingsEl;
let actionsEl;

class ToolSettings extends React.Component {
  pickerClick(event) {
    if (!pickerEl) {
      pickerEl = event.currentTarget;
    } else {
      pickerEl = undefined;
    }

    chrome.triggerRender();
  }

  settingsClick(event) {
    if (!settingsEl) {
      settingsEl = event.currentTarget;
    } else {
      settingsEl = undefined;
    }
    chrome.triggerRender();
  }

  actionsClick(event) {
    if (!actionsEl) {
      actionsEl = event.currentTarget;
    } else {
      actionsEl = undefined;
    }
    chrome.triggerRender();
  }

  setUsePressure(e, pressure) {
    activeTool.options.pressure = pressure;
    chrome.triggerRender();
  }

  setPenSizeSlider(e, size) {
    activeTool.options.size = size;
    chrome.triggerRender();
  }

  setPenSizeInput(event) {
    let value = Number(event.target.value);
    if (value > 0 && value < 1000) {
      activeTool.options.size = value;
    }
    chrome.triggerRender();
  }

  render() {
    let sx = { padding: "15px" };

    let toolHasColor = objectHasKey(activeTool.options, "color");
    let toolHasSize = objectHasKey(activeTool.options, "size");
    let toolHasActions =
      activeTool &&
      activeTool.getActions &&
      Object.keys(activeTool.getActions()).length;

    let colorOption = null;
    let colorPopper = null;

    if (toolHasColor) {
      colorOption = (
        <ToggleButton value="color" onClick={this.pickerClick}>
          <PaletteIcon sx={{ color: activeTool.options.color }} />
        </ToggleButton>
      );
      colorPopper = (
        <Popper open={Boolean(pickerEl)} anchorEl={pickerEl} placement="right">
          <Paper sx={sx}>
            <RgbaStringColorPicker
              color={activeTool.options.color || "black"}
              onChange={setColor}
            />
          </Paper>
        </Popper>
      );
    }

    let sizeOption = null;
    let sizePopper = null;
    if (toolHasSize) {
      sizeOption = (
        <ToggleButton value="size" onClick={this.settingsClick}>
          <SettingsIcon />
        </ToggleButton>
      );

      sizePopper = (
        <Popper
          open={Boolean(settingsEl)}
          anchorEl={settingsEl}
          placement="right"
        >
          <Paper sx={sx}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={activeTool && activeTool.options.pressure}
                    onChange={this.setUsePressure}
                  />
                }
                label="Use Pen Pressure"
              />
              <FormControlLabel
                control={
                  <>
                    <Slider
                      min={1}
                      max={50}
                      value={activeTool && activeTool.options.size}
                      onChange={this.setPenSizeSlider}
                    />
                    <Input
                      sx={{ width: "5em" }}
                      value={activeTool && activeTool.options.size}
                      size="small"
                      onChange={this.setPenSizeInput}
                      inputProps={{ type: "number", min: 1, max: 50, step: 1 }}
                    />
                  </>
                }
                label="Tool Size"
              />
            </FormGroup>
          </Paper>
        </Popper>
      );
    }

    let actionsOption = null;
    let actionsPopper = null;

    if (toolHasActions) {
      let actions = activeTool.getActions();
      actionsOption = (
        <ToggleButton value="action" onClick={this.actionsClick}>
          <MoreVertIcon />
        </ToggleButton>
      );

      actionsPopper = (
        <Menu
          id="actions-menu"
          anchorEl={actionsEl}
          open={Boolean(actionsEl)}
          onClose={this.actionsClick}
        >
          {Object.keys(actions).map((action) => {
            return (
              <MenuItem
                key={action}
                onClick={() => {
                  actions[action]();
                  actionsEl = undefined;
                }}
              >
                {action}
              </MenuItem>
            );
          })}
        </Menu>
      );
    }

    let open = [];
    pickerEl && open.push("color");
    settingsEl && open.push("size");
    actionsEl && open.push("actions");

    return colorOption || sizeOption || actionsOption ? (
      <>
        <ToggleButtonGroup
          value={open}
          className="buttongroup"
          orientation="vertical"
          variant="contained"
        >
          {colorOption}
          {sizeOption}
          {actionsOption}
        </ToggleButtonGroup>

        {colorPopper}
        {sizePopper}
        {actionsPopper}
      </>
    ) : null;
  }
}

function setColor(color) {
  activeTool.options.color = color;
  chrome.triggerRender();
}

export class ToolBox extends React.Component {
  onToolChange(e, tool) {
    if (!tool) {
      return;
    }

    activateTool(tool);

    chrome.triggerRender();
  }

  render() {
    return (
      <Paper className="toolbox" elevation={4}>
        <ToggleButtonGroup
          orientation="vertical"
          size="small"
          value={activeTool && activeTool.slug}
          exclusive
          onChange={this.onToolChange}
          className="buttongroup"
        >
          <ToggleButton value={panTool.slug}>
            <PanToolIcon />
          </ToggleButton>
          <ToggleButton value={selectTool.slug}>
            <CursorDefault />
          </ToggleButton>
          <ToggleButton value={penTool.slug}>
            <Create />
          </ToggleButton>
          <ToggleButton value={brushTool.slug}>
            <Brush />
          </ToggleButton>
          <ToggleButton value={cutoutTool.slug}>
            <Puzzle />
          </ToggleButton>
          <ToggleButton value={rollTool.slug}>
            <FormatPaint />
          </ToggleButton>
          <ToggleButton value={eyedropperTool.slug}>
            <Eyedropper />
          </ToggleButton>
          <ToggleButton value={eraserTool.slug}>
            <Eraser />
          </ToggleButton>
        </ToggleButtonGroup>

        <ToolSettings />
      </Paper>
    );
  }
}

export const tools = {
  init: init,
  activateTool: activateTool,
  setPointer: setPointer,
};
