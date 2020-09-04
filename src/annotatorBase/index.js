import React from 'react';
import ReactDOM from 'react-dom';

import ToolbarContainer from './toolbarContainer';
import Toolbar from './toolbar';


const LIST = 'list';
const SELECT = 'select';
const CREATE = 'create';
const EDIT = 'edit';
const DELETE = 'delete';
const STATES = {
  LIST,
  SELECT,
  CREATE,
  EDIT,
  DELETE,
};


const LIST_STYLE = {
  strokeStyle: 'yellow',
  lineWidth: 1,
};
const SELECT_STYLE = {
  strokeStyle: 'cyan',
  lineWidth: 4,
};
const CREATE_STYLE = {
  lineDash: [10, 15],
  strokeStyle: 'red',
  lineWidth: 4,
};
const EDIT_STYLE = {
  strokeStyle: 'yellow',
  lineWidth: 4,
};
const DELETE_STYLE = {
  strokeStyle: 'red',
  lineWidth: 4,
};
const STYLES = {
  LIST_STYLE,
  SELECT_STYLE,
  CREATE_STYLE,
  EDIT_STYLE,
  DELETE_STYLE,
};


function hasAttr(obj, attr) {
  return Object.prototype.hasOwnProperty.call(obj, attr);
}


let dummyIndex = 0;
function dummyAnnotationRegister(annotation) {
  dummyIndex += 1;
  return dummyIndex;
}


class AnnotatorBase {
  constructor(config) {
    this.canvas = config.canvas;
    this.toolbar = config.toolbar;
    this.visualizer = config.visualizer;

    this.props = {};

    // Annotations object. Should be a mapping of the type
    // { annotationId: annotation }. AnnotationIDs should be
    // strings.
    if (hasAttr(config, 'annotations')) {
      this.annotations = config.annotations;
    } else {
      this.annotations = {};
    }

    // Indicates whether the annotator is active
    if (hasAttr(config, 'active')) {
      this.active = config.active;
    } else {
      this.active = true;
    }

    // Function to signal to the exterior that the annotator has
    // been activated. Should be a function of type
    // () => bool. The returned value indicates whether the annotator
    // should activate.
    if (hasAttr(config, 'activator')) {
      this.activator = () => {
        if (config.activator()) {
          this.activate();
        }
      };
    } else {
      this.activator = () => this.activate();
    }

    // State of the annotator. Can only be one of 'select', 'list',
    // 'create', 'edit', 'delete';
    if (hasAttr(config, 'state')) {
      this.state = config.state;
    } else {
      this.state = CREATE;
    }

    // External function used to notify of a change in state. Should be
    // a function of type (oldState, newState) => newState. The external function might
    // not grant the state change and thus return the old state or even change to
    // another state.
    if (hasAttr(config, 'setState')) {
      this.props.setState = config.setState;
    } else {
      this.props.setState = (oldState, newState) => newState;
    }

    // External function used to register a new annotation. Should be
    // a function of type (annotation) => annotationId. It should
    // return null if the externall registration was unsuccessful.
    // Annotation ID should be strings.
    if (hasAttr(config, 'registerAnnotation')) {
      this.props.registerAnnotation = config.registerAnnotation;
    } else {
      this.props.registerAnnotation = dummyAnnotationRegister;
    }

    // External function used to select an annotation. Should be
    // a function of type (annotationId) => bool. The function should
    // return the externally updated annotation.
    if (hasAttr(config, 'updateAnnotation')) {
      this.props.updateAnnotation = config.updateAnnotation;
    } else {
      this.props.updateAnnotation = (annotationId, annotation) => annotation;
    }

    // External function used to select an annotation. Should be
    // a function of type (annotationId) => selectedId. The function
    // should return if the external selection was successful.
    if (hasAttr(config, 'selectAnnotation')) {
      this.props.selectAnnotation = config.selectAnnotation;
    } else {
      this.props.selectAnnotation = (annotationId) => annotationId;
    }

    // External function used to get the annotation style. Should
    // be a function of type (annotationId) => style. `style` is
    // an object with style directives.
    if (hasAttr(config, 'getAnnotationStyle')) {
      this.props.getAnnotationStyle = config.getAnnotationStyle;
    } else {
      this.props.getAnnotationStyle = (annotationId) => {};
    }

    // External function used to mark an annotation when hovered on.
    // Should be a function of type (annotationId) => (selectedId);
    if (hasAttr(config, 'hoverOnAnnotation')) {
      this.props.hoverOnAnnotation = config.hoverOnAnnotation;
    } else {
      this.props.hoverOnAnnotation = (annotationId) => annotationId;
    }

    // External function used to delete an annotation. Should be
    // a function of type (annotationId) => bool. The function should
    // return if the external delete was successfull.
    if (hasAttr(config, 'deleteAnnotation')) {
      this.props.deleteAnnotation = config.deleteAnnotation;
    } else {
      this.props.deleteAnnotation = (annotationId) => true;
    }

    // Currently selected annotation.
    if (hasAttr(config, 'selectedAnnotation')) {
      this.selectedAnnotation = config.selectedAnnotation;
    } else {
      this.selectedAnnotation = null;
    }

    // States ENUM for internal reference
    this.states = {
      ...STATES,
      ...this.getStates(),
    };

    // Style mapping
    this.styles = STYLES;

    // To be used when mouse is over annotation
    this.hoverAnnotation = null;

    // Use 2D Context for annotation drawing.
    this.ctx = this.canvas.getContext('2d');

    // Add event listeners to annotator canvas
    this.events = this.getEvents();
    this.canvas.addEventListener(
      'visualizer-update',
      () => this.draw(),
      false,
    );
    this.onKeyPress = this.onKeyPress.bind(this);
    this.bindEvents();

    // Add on window size change behaviour, if defined
    if (typeof this.onWindowResize === 'function') {
      window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    // Set event listener status based on activation variable.
    if (this.active) {
      this.activateCanvasEvents();
    } else {
      this.deactivateCanvasEvents();
    }

    // Wait until toolbar has mounted.
    this.toolbarContainer = null;
    this.renderToolbar(() => {
      // Initialize canvas and annotator
      this.adjustSize();
      this.init();

      // Wait for visualizer to be ready to start drawing annotations.
      this.visualizer.waitUntilReady()
        .then(() => this.draw());
    });
  }

  /* eslint-disable class-methods-use-this, no-unused-vars */

  init() {
    // Method for custom intialization code.
  }

  drawAnnotation(annotation, style) {
    // Abstract method.
  }

  getEvents() {
    // Overwrite this method to define event listeners.
    return {};
  }

  /* eslint-enable class-methods-use-this */

  draw() {
    if (!this.visualizer.ready) return;

    this.clean();
    this.drawAnnotations();

    if (this.state === CREATE) {
      this.drawCreation();
      return;
    }

    if (this.state === EDIT) {
      this.drawEdit();
    }
  }

  drawAnnotations() {
    Object.entries(this.annotations).forEach(([annotationId, annotation]) => {
      const style = this.getAnnotationStyle(annotationId);
      this.drawAnnotation(annotation, style);
    });
  }

  getAnnotationStyle(annotationId) {
    if (this.selectedAnnotation === annotationId && this.state === EDIT) {
      return EDIT_STYLE;
    }

    if (this.hoverAnnotation === annotationId && this.state === SELECT) {
      return SELECT_STYLE;
    }

    if (this.hoverAnnotation === annotationId && this.state === DELETE) {
      return DELETE_STYLE;
    }

    return {
      ...LIST_STYLE,
      ...this.props.getAnnotationStyle(annotationId),
    };
  }

  getStates() {
    // Abtract method
    // Return any additional states.
    return {};
  }

  /**
   * Emit a change of annotator state.
   *
   * Will check for permissions to change state by calling the setState function
   * passed at initialization. To be used internally to change states in harmony
   * with external controllers.
   * @private
   */
  setState(state) {
    const newState = this.props.setState(this.state, state);

    if (newState !== this.state) {
      this.forceState(newState);
    }
  }

  /**
   * Get current annotator state.
   *
   * @public
   */
  getState() {
    return this.state;
  }

  /**
   * Forcefully change the state of the annotator.
   *
   * To be used externally to force a change in state.
   * @public
   */
  forceState(state) {
    if (state === SELECT || state === LIST) {
      this.selectedAnnotation = null;
    }

    this.state = state;
    this.draw();

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ state });
    }
  }

  /**
   * Select annotation for editing.
   *
   * To be used internally to select an annotation. Will call the
   * selectAnnotation function provided at initialization to signal exterior
   * controllers of the selection event.
   * @private
   */
  selectAnnotation(annotationId) {
    const selectedId = this.props.selectAnnotation(annotationId);
    this.setSelectedAnnotation(selectedId);
  }

  /**
   * Set selected annotation.
   *
   * @public
   */
  setSelectedAnnotation(annotationId) {
    this.selectedAnnotation = annotationId;
    this.setState(this.states.EDIT);
    this.draw();
  }

  getSelectedAnnotation() {
    return this.selectedAnnotation;
  }

  registerAnnotation(annotation) {
    const validated = this.validateAnnotation(annotation);
    const id = this.props.registerAnnotation(validated);

    if (id === null) return;

    this.annotations[id] = validated;
    this.selectedAnnotation = id;
    this.setState(this.states.EDIT);
    this.draw();
  }

  updateAnnotation(annotationId, annotation) {
    const validated = this.validateAnnotation(annotation);
    const updatedAnnotation = this.props.updateAnnotation(annotationId, validated);
    this.annotations[annotationId] = updatedAnnotation;
    this.draw();
  }

  /**
   * Highlight annotation when hovering.
   *
   * To be used internally to change in hover status. Will call the
   * hover on annotation function provided at start to signal exterior
   * controllers the hovering event.
   * @private
   */
  hoverOnAnnotation(annotationId) {
    const selectedId = this.props.hoverOnAnnotation(annotationId);
    this.setHoverOnAnnotation(selectedId);
  }

  /**
   * Set hovering state on the provided annotation.
   *
   * @public
   */
  setHoverOnAnnotation(annotationId) {
    this.hoverAnnotation = annotationId;
    this.draw();
  }

  getHoverOnAnnotation(annotationId) {
    return this.hoverAnnotation;
  }

  setAnnotations(annotations) {
    this.annotations = annotations;
    this.draw();
  }

  getAnnotations() {
    return this.annotations;
  }

  setAnnotationStyleMap(mapping) {
    this.props.getAnnotationStyle = mapping;
  }

  deleteAnnotation(annotationId) {
    const successful = this.props.deleteAnnotation(annotationId);
    if (!successful) return;

    delete this.annotations[annotationId];
    this.setState(this.states.SELECT);
    this.draw();
  }

  createPoint(x, y) {
    const p = new DOMPoint();
    p.x = x;
    p.y = y;
    return p;
  }

  adjustSize() {
    this.visualizer.adjustSize();
    this.visualizer.draw();

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.width = this.visualizer.canvas.width;
    this.canvas.height = this.visualizer.canvas.height;
  }

  getMouseEventPosition(event) {
    const x = event.offsetX || (event.pageX - this.canvas.offsetLeft);
    const y = event.offsetY || (event.pageY - this.canvas.offsetTop);
    return this.pixelToCoords(this.createPoint(x, y));
  }

  pixelToCoords(p) {
    return this.createPoint(
      p.x / this.canvas.width,
      p.y / this.canvas.height,
    );
  }

  coordsToPixel(p) {
    return this.createPoint(
      p.x * this.canvas.width,
      p.y * this.canvas.height,
    );
  }

  clean() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  activateCanvasEvents() {
    this.canvas.style.pointerEvents = 'auto';
  }

  deactivateCanvasEvents() {
    this.canvas.style.pointerEvents = 'none';
  }

  setActivator(activator) {
    this.activator = () => {
      if (activator()) {
        this.activate();
      }
    };

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ activator: this.activator });
    }
  }

  activate() {
    this.activateCanvasEvents();
    this.active = true;

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ active: true });
    }
  }

  deactivate() {
    this.active = false;
    this.deactivateCanvasEvents();

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ active: false });
    }
  }

  toggleActivate() {
    if (this.active) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  onKeyPress(event) {
    if (!this.active) return;
    if (!event.shiftKey) return;
    if (event.key === 'A') this.setState(CREATE);
    if (event.key === 'S') this.setState(SELECT);
    if (event.key === 'D') this.setState(DELETE);
  }

  bindEvents() {
    Object.keys(this.events).forEach((eventType) => {
      let listeners = this.events[eventType];

      if (!(Array.isArray(listeners))) {
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.addEventListener(eventType, listener, false);
      });
    });

    window.addEventListener('keypress', this.onKeyPress);
  }

  unmount() {
    Object.keys(this.events).forEach((eventType) => {
      let listeners = this.events[eventType];

      if (!(Array.isArray(listeners))) {
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.removeEventListener(eventType, listener);
      });
    });

    window.removeEventListener('keypress', this.onKeyPress);
  }

  onWindowResize() {
    this.adjustSize();
    this.draw();
  }

  getToolbarComponent(props) {
    return <Toolbar {...props} />;
  }

  renderToolbar(callback) {
    ReactDOM.render(
      <ToolbarContainer
        ref={(ref) => { this.toolbarContainer = ref; }}
        active={this.active}
        states={this.states}
        state={this.state}
        component={(props) => this.getToolbarComponent(props)}
        activator={() => this.activator()}
        setState={(state) => this.setState(state)}
        deleteAnnotation={() => this.deleteAnnotation(this.selectedAnnotation)}
      />,
      this.toolbar,
      callback,
    );
  }
}


export default AnnotatorBase;
