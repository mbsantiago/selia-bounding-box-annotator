import AnnotatorBase from "@selia/annotator";

import { distanceToPoint, distanceToAnnotation, isInAnnotation } from "./utils";

const DISTANCE_THRESHOLD = 0.005;
const EDIT_POINT_RADIUS = 4;
const EDIT_POINT_RADIUS_SELECTED = 5;

class Annotator extends AnnotatorBase {
  getEvents() {
    return {
      mousedown: this.onMouseDown.bind(this),
      mousemove: this.onMouseMove.bind(this),
      mouseup: this.onMouseUp.bind(this),
    };
  }

  onMouseDown(event) {
    if (!this.state.isActive()) return;

    const { states, state } = this;
    const position = this.getMouseEventPosition(event);

    if (state.is(states.CREATE)) {
      this.create.start = position;
      this.create.dragging = false;
    }

    const hoverId = this.annotations.getHoverId();

    if (state.is(states.LIST) && hoverId !== null) {
      this.selectAnnotation(this.annotations.getHoverId());
      this.hoverOnAnnotation(null);
    }

    if (state.is(states.DELETE) && hoverId !== null) {
      this.deleteAnnotation(hoverId);
      this.hoverOnAnnotation(null);
    }

    if (state.is(states.EDIT)) {
      this.handleMouseDownOnEdit(position);
    }
  }

  onMouseMove(event) {
    if (!this.state.isActive()) return;

    const position = this.getMouseEventPosition(event);

    if (this.state.is(this.states.CREATE) && this.create.start) {
      this.create.end = position;
      this.create.dragging = true;
      this.draw();
    }

    if (this.state.is(this.states.LIST) || this.state.is(this.states.DELETE)) {
      this.hoverOnAnnotationUpdate(position);
    }

    if (this.state.is(this.states.EDIT)) {
      this.handleMouseMoveOnEdit(position);
    }
  }

  annotationToCanvas(annotation) {
    const { x: left, y: top } = this.visualizer.pointToCanvas(
      this.createPoint(annotation.left, annotation.top)
    );

    const { x: right, y: bottom } = this.visualizer.pointToCanvas(
      this.createPoint(annotation.right, annotation.bottom)
    );

    return { left, top, right, bottom };
  }

  onMouseUp() {
    if (!this.state.isActive()) return;

    if (this.state.is(this.states.CREATE)) {
      this.handleAnnotationCreation();
    }

    if (this.state.is(this.states.EDIT)) {
      this.handleMouseUpOnEdit();
    }
  }

  handleMouseDownOnEdit(position) {
    const annotation = this.annotations.getSelected();
    const point = this.visualizer.canvasToPoint(position);
    const { left, top, right, bottom } = this.annotationToCanvas(annotation);

    this.edit.last = point;
    this.edit.start = point;

    if (distanceToPoint(position, left, top) < DISTANCE_THRESHOLD) {
      this.edit.selected = "topLeft";
    } else if (distanceToPoint(position, left, bottom) < DISTANCE_THRESHOLD) {
      this.edit.selected = "bottomLeft";
    } else if (distanceToPoint(position, right, top) < DISTANCE_THRESHOLD) {
      this.edit.selected = "topRight";
    } else if (distanceToPoint(position, right, bottom) < DISTANCE_THRESHOLD) {
      this.edit.selected = "bottomRight";
    } else if (
      distanceToPoint(position, left, (top + bottom) / 2) < DISTANCE_THRESHOLD
    ) {
      this.edit.selected = "left";
    } else if (
      distanceToPoint(position, (left + right) / 2, top) < DISTANCE_THRESHOLD
    ) {
      this.edit.selected = "top";
    } else if (
      distanceToPoint(position, right, (top + bottom) / 2) < DISTANCE_THRESHOLD
    ) {
      this.edit.selected = "right";
    } else if (
      distanceToPoint(position, (left + right) / 2, bottom) < DISTANCE_THRESHOLD
    ) {
      this.edit.selected = "bottom";
    } else if (isInAnnotation(point, annotation)) {
      this.edit.selected = "move";
    } else {
      this.edit.selected = null;
    }
  }

  handleMouseMoveOnEdit(position) {
    if (this.edit.selected === null) {
      this.handleHoverOnEdit(position);
      this.draw();
      return;
    }

    const point = this.visualizer.canvasToPoint(position);
    const annotation = this.annotations.getSelected();
    const id = this.annotations.getSelectedId();

    if (this.edit.selected === "topLeft") {
      annotation.top = point.y;
      annotation.left = point.x;
      this.updateAnnotation(id, annotation);
    } else if (this.edit.selected === "topRight") {
      annotation.top = point.y;
      annotation.right = point.x;
      this.updateAnnotation(id, annotation);
    } else if (this.edit.selected === "bottomLeft") {
      annotation.bottom = point.y;
      annotation.left = point.x;
      this.updateAnnotation(id, annotation);
    } else if (this.edit.selected === "bottomRight") {
      annotation.bottom = point.y;
      annotation.right = point.x;
      this.updateAnnotation(id, annotation);
    } else if (this.edit.selected === "left") {
      annotation.left = point.x;
      this.updateAnnotation(id, annotation);
    } else if (this.edit.selected === "top") {
      annotation.top = point.y;
      this.updateAnnotation(id, annotation);
    } else if (this.edit.selected === "right") {
      annotation.right = point.x;
      this.updateAnnotation(id, annotation);
    } else if (this.edit.selected === "bottom") {
      annotation.bottom = point.y;
      this.updateAnnotation(id, annotation);
    } else if (this.edit.selected === "move") {
      const shiftX = point.x - this.edit.last.x;
      const shiftY = point.y - this.edit.last.y;
      annotation.left += shiftX;
      annotation.top += shiftY;
      annotation.right += shiftX;
      annotation.bottom += shiftY;
      this.updateAnnotation(id, annotation);
    }

    this.edit.last = point;
  }

  handleHoverOnEdit(position) {
    const annotation = this.annotations.getSelected();
    const point = this.visualizer.canvasToPoint(position);
    const { left, top, right, bottom } = this.annotationToCanvas(annotation);

    if (distanceToPoint(position, left, top) < DISTANCE_THRESHOLD) {
      this.edit.hover = "topLeft";
    } else if (distanceToPoint(position, left, bottom) < DISTANCE_THRESHOLD) {
      this.edit.hover = "bottomLeft";
    } else if (distanceToPoint(position, right, top) < DISTANCE_THRESHOLD) {
      this.edit.hover = "topRight";
    } else if (distanceToPoint(position, right, bottom) < DISTANCE_THRESHOLD) {
      this.edit.hover = "bottomRight";
    } else if (
      distanceToPoint(position, left, (top + bottom) / 2) < DISTANCE_THRESHOLD
    ) {
      this.edit.hover = "left";
    } else if (
      distanceToPoint(position, (left + right) / 2, top) < DISTANCE_THRESHOLD
    ) {
      this.edit.hover = "top";
    } else if (
      distanceToPoint(position, right, (top + bottom) / 2) < DISTANCE_THRESHOLD
    ) {
      this.edit.hover = "right";
    } else if (
      distanceToPoint(position, (left + right) / 2, bottom) < DISTANCE_THRESHOLD
    ) {
      this.edit.hover = "bottom";
    } else if (isInAnnotation(point, annotation)) {
      this.edit.hover = "move";
    } else {
      this.edit.hover = null;
    }
  }

  handleMouseUpOnEdit() {
    this.edit = {
      last: null,
      hover: null,
      selected: null,
    };
  }

  handleAnnotationCreation() {
    if (!this.create.dragging) {
      this.create = {
        start: null,
        end: null,
        dragging: false,
      };
      return;
    }

    const p1 = this.visualizer.canvasToPoint(this.create.start);
    const p2 = this.visualizer.canvasToPoint(this.create.end);
    this.registerAnnotation({
      top: p1.y,
      bottom: p2.y,
      left: p1.x,
      right: p2.x,
    });

    this.create = {
      start: null,
      end: null,
      dragging: false,
    };
  }

  drawBBox(p1, p2, style) {
    this.ctx.beginPath();

    const lineDash = style.lineDash || [];
    const strokeStyle = style.strokeStyle || "yellow";
    const lineWidth = style.lineWidth || 1;

    this.ctx.setLineDash(lineDash);
    this.ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = lineWidth;

    this.ctx.stroke();
  }

  drawAnnotation(annotation, style = {}) {
    let p1 = this.createPoint(annotation.left, annotation.bottom);
    let p2 = this.createPoint(annotation.right, annotation.top);

    p1 = this.coordsToPixel(this.visualizer.pointToCanvas(p1));
    p2 = this.coordsToPixel(this.visualizer.pointToCanvas(p2));

    this.drawBBox(p1, p2, style);
  }

  hoverOnAnnotationUpdate(position) {
    let selected = null;

    this.annotations.list().some(([annotationId, annotation]) => {
      const canvasBox = this.annotationToCanvas(annotation);
      if (distanceToAnnotation(position, canvasBox) < DISTANCE_THRESHOLD) {
        selected = annotationId;
        return true;
      }

      return false;
    });

    this.hoverOnAnnotation(selected);
    this.draw();
  }

  drawEdit() {
    const annotation = this.annotations.getSelected();

    const { x: left, y: bottom } = this.coordsToPixel(
      this.visualizer.pointToCanvas(
        this.createPoint(annotation.left, annotation.bottom)
      )
    );

    const { x: right, y: top } = this.coordsToPixel(
      this.visualizer.pointToCanvas(
        this.createPoint(annotation.right, annotation.top)
      )
    );

    if (this.edit.hover === "move") {
      const height = top - bottom;
      const width = right - left;

      this.ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
      this.ctx.fillRect(left, bottom, width, height);
    }

    this.drawEditPoint(left, bottom, this.edit.hover === "bottomLeft");
    this.drawEditPoint(left, top, this.edit.hover === "topLeft");
    this.drawEditPoint(right, bottom, this.edit.hover === "bottomRight");
    this.drawEditPoint(right, top, this.edit.hover === "topRight");

    this.drawEditPoint(left, (top + bottom) / 2, this.edit.hover === "left");
    this.drawEditPoint((right + left) / 2, top, this.edit.hover === "top");
    this.drawEditPoint(right, (top + bottom) / 2, this.edit.hover === "right");
    this.drawEditPoint(
      (right + left) / 2,
      bottom,
      this.edit.hover === "bottom"
    );
  }

  drawEditPoint(x, y, isselecteding) {
    const rad = isselecteding ? EDIT_POINT_RADIUS_SELECTED : EDIT_POINT_RADIUS;
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x - rad, y - rad, 2 * rad, 2 * rad);
  }

  drawCreation() {
    if (!this.create.start || !this.create.end) return;

    const p1 = this.coordsToPixel(this.create.start);
    const p2 = this.coordsToPixel(this.create.end);

    this.drawBBox(p1, p2, this.styles.CREATE_STYLE);
  }

  validateAnnotation(annotation) {
    const p1 = this.createPoint(annotation.left, annotation.top);
    const p2 = this.createPoint(annotation.right, annotation.bottom);

    const pt1 = this.visualizer.validatePoints(p1);
    const pt2 = this.visualizer.validatePoints(p2);

    return {
      top: Math.max(pt1.y, pt2.y),
      bottom: Math.min(pt1.y, pt2.y),
      left: Math.min(pt1.x, pt2.x),
      right: Math.max(pt1.x, pt2.x),
    };
  }

  init() {
    this.create = {
      start: null,
      end: null,
      dragging: false,
    };

    this.edit = {
      selected: null,
      hover: null,
      last: null,
    };
  }
}

export default Annotator;
