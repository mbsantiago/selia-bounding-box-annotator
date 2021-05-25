import ReactDOM from "react-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.css";

import "popper.js/dist/popper.min.js";
import "bootstrap/dist/js/bootstrap.min.js";

import $ from "jquery/dist/jquery.min.js";
import Alert from "bootstrap/js/dist/alert.js";
import Visualizer from "@selia/image-visualizer";

import { DefaultAnnotationStorage } from "@selia/annotator";
import { DefaultStateManager } from "@selia/annotator";

let visualizer = null;
let annotator = null;
function visualizerActivator() {
  annotator.deactivate();
}

function annotatorActivator() {
  visualizer.deactivate();
}

function toggleActivate() {
  visualizer.toggleActivate();
  annotator.toggleActivate();
}

function createAlert(data) {
  const parent = document.getElementById("alert-container");
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-primary";
  alertDiv.innerHTML = `${JSON.stringify(data)}`;
  alertDiv.setAttribute("role", "alert");
  alertDiv.setAttribute(
    "style",
    "position: absolute; z-index:99; opacity: 0.9; display: none;"
  );
  parent.appendChild(alertDiv);
  const alert = new Alert(alertDiv);
  $(".alert").fadeIn("fast");
  setTimeout(() => {
    $(".alert").fadeOut("fast", () => alert.close());
  }, 1000);
}

class AlertStorage extends DefaultAnnotationStorage {
  create(annotation) {
    createAlert(annotation);
    return super.create(annotation);
  }
}

class StateManager extends DefaultStateManager {
  activate() {
    visualizer.deactivate();
    super.activate();
  }
}

visualizer = new Visualizer({
  canvas: document.getElementById("visualizerCanvas"),
  toolbar: document.getElementById("visualizerToolbar"),
  itemInfo: {
    url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/SIPI_Jelly_Beans_4.1.07.tiff/lossy-page1-256px-SIPI_Jelly_Beans_4.1.07.tiff.jpg",
  },
  activator: visualizerActivator,
  active: false,
});

window.onkeypress = (event) => {
  if (event.key === "Enter") {
    toggleActivate();
  }
};

import(/* webpackIgnore: true */ "/annotator.js").then((module) => {
  annotator = new AnnotatorTool.default({
    visualizer,
    canvas: document.getElementById("annotatorCanvas"),
    toolbar: document.getElementById("annotatorToolbar"),
    state: new StateManager({ active: true }),
    annotations: new AlertStorage(),
  });
});
