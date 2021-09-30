import { input } from "./input.js";

import "@fontsource/roboto";

import React from "react";
import ReactDOM from "react-dom";

import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";

import makeStyles from "@mui/styles/makeStyles";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";

import LayersIcon from "@mui/icons-material/Layers";
import MenuIcon from "@mui/icons-material/Menu";

import Paper from "@mui/material/Paper";

import { UndoCommands } from "./undo.js";
import { ToolBox } from "./tools.js";
import { LayerDrawer } from "./layers.js";
import { TextField, Zoom } from "@mui/material";

function resetCanvas() {
  input.createNewDocument();
  closeTopMenu();
  renderAppChrome();
}
function uploadReference() {
  closeTopMenu();
  input.uploadReference();
}
function exportDoc() {
  closeTopMenu();
  input.exportDocument();
}
function importDoc() {
  closeTopMenu();
  input.importDocument();
}

//////////////////////

let menuEl = null;
function TopMenu(props) {
  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
    >
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={openTopMenu}
          size="large"
        >
          <MenuIcon />
        </IconButton>

        <Menu
          id="main-menu"
          anchorEl={menuEl}
          open={Boolean(menuEl)}
          onClose={closeTopMenu}
        >
          <MenuItem onClick={uploadReference}>Add Reference</MenuItem>
          <MenuItem onClick={resetCanvas}>Clear</MenuItem>
          <MenuItem onClick={exportDoc}>Export</MenuItem>
          <MenuItem onClick={importDoc}>Import</MenuItem>
        </Menu>

        <Box sx={{ flexGrow: 1 }} />

        <UndoCommands />

        <Box sx={{ flexGrow: 1 }} />

        <IconButton edge="end" onClick={toggleLayers} size="large">
          <LayersIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
function openTopMenu(e) {
  menuEl = e.currentTarget;
  renderAppChrome();
}
function closeTopMenu() {
  menuEl = null;
  renderAppChrome();
}

function setZoom(event) {
  let zoom = event.target.value / 100;

  input.setZoom(zoom);
}

function StatusBar() {
  return (
    <Paper
      className="statusbar"
      elevation={4}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Box sx={{ flexGrow: 1 }} />
      <Box className="centerdisplay" onClick={input.recenterCanvas}>
        Center {paper.view.center.toString()}
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <TextField
        className="zoombox"
        value={Math.round(paper.view.zoom * 100)}
        onChange={setZoom}
        label="Zoom"
        size="small"
        type="number"
        inputProps={{ min: 1, max: 10000 }}
      />
    </Paper>
  );
}

let layersPanelOpen = false;
function toggleLayers() {
  layersPanelOpen = !layersPanelOpen;
  renderAppChrome();
}
function AppChrome(props) {
  const classes = useStyles();

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <TopMenu canUndo={props.canUndo} canRedo={props.canRedo} />
        <StatusBar />
        <ToolBox />
        <LayerDrawer open={layersPanelOpen} onClose={toggleLayers} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

const theme = createTheme();
const useStyles = makeStyles((theme) => {
  {
  }
});

function renderAppChrome() {
  ReactDOM.render(<AppChrome />, document.getElementById("appChrome"));
}

function initialize() {
  renderAppChrome();
}

export const chrome = {
  init: initialize,
  triggerRender: initialize,
};
