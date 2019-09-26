import AnnotatorBase from '@selia/annotator';

class Annotator extends AnnotatorBase {
  getEvents() {
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    return {
      mousedown: this.onMouseDown,
      mousemove: this.onMouseMove,
      mouseup: this.onMouseUp,
    }
  }

  onMouseDown(event) {
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

    this.startPoint = this.getMouseEventPosition(event);
    this.phase = this.states.EMPTY_ANNOTATOR;
    this.dragged = false;
  }

  onMouseMove(event) {
    if (this.startPoint) {
      this.currentPoint = this.getMouseEventPosition(event);
      this.draw();
      this.dragged = true;
      this.phase = this.states.EDITING;
    }
  }

  onMouseUp(event) {
    if (this.dragged) {
      let p1 = this.visualizer.canvasToPoint(this.startPoint);
      let p2 = this.visualizer.canvasToPoint(this.currentPoint);

      this.annotation = this.createAnnotation(p1, p2);
      this.registerAnnotation(this.annotation);

      this.phase = this.states.DONE;
      this.draw();
    }

    this.startPoint = null;
    this.currentPoint = null;
    this.dragged = false;
  }

  drawBBox(p1, p2, style) {
    this.ctx.beginPath()

    let dash = style.dash || [];
    let color = style.color || "yellow";
    let width = style.lineWidth || 5;

    this.ctx.setLineDash(dash);
    this.ctx.rect(
      p1.x,
      p1.y,
      p2.x - p1.x,
      p2.y - p1.y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    this.ctx.stroke();
  }

  drawAnnotation(annotation, style) {
    style = style ? style : {};

    let p1 = this.createPoint(annotation.left, annotation.bottom);
    let p2 = this.createPoint(annotation.right, annotation.top);

    p1 = this.visualizer.pointToCanvas(p1);
    p2 = this.visualizer.pointToCanvas(p2);

    this.drawBBox(p1, p2, style);
  }

  drawEdit() {
    let p1 = this.startPoint;
    let p2 = this.currentPoint;
    let style = {
      dash: [10, 15],
      color: "red"
    }
    this.drawBBox(p1, p2, style);
  }

  createAnnotation(p1, p2) {
    p1 = this.visualizer.validatePoints(p1);
    p2 = this.visualizer.validatePoints(p2);

    let top = Math.max(p1.y, p2.y)
    let bottom = Math.min(p1.y, p2.y)
    let left = Math.min(p1.x, p2.x)
    let right = Math.max(p1.x, p2.x)

    return {
      top: top,
      bottom: bottom,
      left: left,
      right: right,
    };
  }

  init() {
    this.startPoint = null;
    this.currentPoint = null;
    this.dragged = false;
  }
}


export default Annotator;
