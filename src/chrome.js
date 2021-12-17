import { input } from "./input.js";
import { undo } from "./undo.js";

import "@fontsource/roboto";

import paper from "paper";

import React from "react";
import ReactDOM from "react-dom";

import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import LayersIcon from "@mui/icons-material/Layers";
import MenuIcon from "@mui/icons-material/Menu";

import Paper from "@mui/material/Paper";

import { UndoCommands } from "./undo.js";
import { ToolBox } from "./tools.js";
import { LayerDrawer } from "./layers.js";

function aboutDialog() {
  closeTopMenu();

  confirmAction = {
    title: "About Draw on Paper",
    message: "Released under the MIT License. Visit the source repository?",
    action: () => {
      window.open('https://github.com/arthurdick/drawonpaper');
      confirmAction = null;
      renderAppChrome();
    },
  };
  renderAppChrome();
}

function resetCanvas(e, confirmed) {
  closeTopMenu();

  if (confirmed) {
    confirmAction = null;
  } else if (!undo.isSaved()) {
    confirmAction = {
      title: "Unsaved Changes",
      message: "There are unsaved changes. Clear the document permanently?",
      action: () => {
        resetCanvas(e, true);
      },
    };
    renderAppChrome();
    return;
  }

  input.createNewDocument();
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
function importDoc(e, confirmed) {
  closeTopMenu();

  if (confirmed) {
    confirmAction = null;
  } else if (!undo.isSaved()) {
    confirmAction = {
      title: "Unsaved Changes",
      message:
        "There are unsaved changes. Replace the current document permanently?",
      action: () => {
        importDoc(e, true);
      },
    };
    renderAppChrome();
    return;
  }

  input.importDocument();
  renderAppChrome();
}

//////////////////////

let confirmAction = null;

let menuEl = null;
function TopMenu() {
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
	  <MenuItem onClick={aboutDialog}>About</MenuItem>
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
      <Dialog open={Boolean(confirmAction)}>
        <DialogTitle>{confirmAction && confirmAction.title}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            {confirmAction && confirmAction.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              confirmAction = null;
              renderAppChrome();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmAction && confirmAction.action}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
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
function AppChrome() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <TopMenu />
        <StatusBar />
        <ToolBox />
        <LayerDrawer open={layersPanelOpen} onClose={toggleLayers} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

const theme = createTheme();

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
