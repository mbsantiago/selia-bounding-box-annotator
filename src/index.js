import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css';

import 'popper.js/dist/popper.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';

import $ from 'jquery/dist/jquery.min.js';
import Alert from 'bootstrap/js/dist/alert.js';
import Visualizer from '@selia/image-visualizer';


let visualizer = null;
let annotator = null;
function visualizerActivator() {
  annotator.deactivate();
  visualizer.activate();
}

function annotatorActivator() {
  annotator.activate();
  visualizer.deactivate();
}

function toggleActivate() {
  annotator.toggleActivate();
  visualizer.toggleActivate();
}

let id = 0;
function registerAnnotation(annotation) {
  const parent = document.getElementById('alert-container');

  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-primary';
  alertDiv.innerHTML = `Annotation: ${JSON.stringify(annotation)}`;

  alertDiv.setAttribute('role', 'alert');
  alertDiv.setAttribute('style', 'position: absolute; z-index:99; opacity: 0.9; display: none;');

  parent.appendChild(alertDiv);

  const alert = new Alert(alertDiv);

  $('.alert').fadeIn('fast');

  setTimeout(() => {
    $('.alert').fadeOut('fast', () => alert.close());
  }, 1000);

  id += 1;
  return id.toString();
}

visualizer = new Visualizer({
  canvas: document.getElementById('visualizerCanvas'),
  itemInfo: {
    url: 'https://homepages.cae.wisc.edu/~ece533/images/baboon.png',
  },
  activator: visualizerActivator,
  active: false,
});

window.onkeypress = (event) => {
  if (event.key === 'Enter') {
    toggleActivate();
  }
};

import(/* webpackIgnore: true */'/annotator.js').then((module) => {
  annotator = new AnnotatorTool.default({
    canvas: document.getElementById('annotatorCanvas'),
    state: 'create',
    activator: annotatorActivator,
    visualizer,
    registerAnnotation,
  });

  ReactDOM.render(
    visualizer.renderToolbar(),
    document.getElementById('visualizerToolbar'),
    () => {
      ReactDOM.render(
        annotator.renderToolbar(),
        document.getElementById('annotatorToolbar'),
        () => {
          annotator.adjustSize();
          visualizer.draw();
          annotator.draw();
        },
      );
    },
  );
});
