import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.css';

import 'jquery/dist/jquery.min.js';
import 'popper.js/dist/popper.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';

import $ from 'jquery/dist/jquery.min.js';

import Alert from 'bootstrap/js/dist/alert.js';

import VisualizerBase from '@selia/visualizer';


const visualizer = new VisualizerBase({
  canvas: document.getElementById('dummyCanvas'),
  itemInfo: {},
  active: false,
});


function registerAnnotation(annotation) {
  let parent = document.getElementById('alert-container');

  let alert_div = document.createElement('div');
  alert_div.className = "alert alert-primary";
  alert_div.innerHTML = `Annotation: ${JSON.stringify(annotation)}`;

  alert_div.setAttribute('role', 'alert');
  alert_div.setAttribute('style', 'position: absolute; z-index:99; opacity: 0.9; display: none;');

  parent.appendChild(alert_div);
  let alert = new Alert(alert_div);

  $('.alert').fadeIn('fast')
  setTimeout(() => {
    $('.alert').fadeOut('fast', () => alert.close())
  }, 1000);
}


import(/* webpackIgnore: true */'/annotator.js').then(module => {
  var config = {
    canvas: document.getElementById('annotatorCanvas'),
    visualizer: visualizer,
    edit: true,
    registerAnnotation: registerAnnotation,
  }

  var annotator = new Annotator.default(config);
});
