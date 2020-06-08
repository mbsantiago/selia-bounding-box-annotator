function distanceToInterval(value, start, end) {
  if (value < start) {
    return start - value;
  }

  if (value > end) {
    return value - end;
  }

  return 0;
}

function distanceToPoint(position, x, y) {
  return Math.max(
    Math.abs(position.x - x),
    Math.abs(position.y - y),
  );
}

function distanceToLeft(position, annotation) {
  return Math.max(
    Math.abs(position.x - annotation.left),
    distanceToInterval(position.y, annotation.bottom, annotation.top),
  );
}

function distanceToRight(position, annotation) {
  return Math.max(
    Math.abs(position.x - annotation.right),
    distanceToInterval(position.y, annotation.bottom, annotation.top),
  );
}

function distanceToTop(position, annotation) {
  return Math.max(
    Math.abs(position.y - annotation.top),
    distanceToInterval(position.x, annotation.left, annotation.right),
  );
}

function distanceToBottom(position, annotation) {
  return Math.max(
    Math.abs(position.y - annotation.bottom),
    distanceToInterval(position.x, annotation.left, annotation.right),
  );
}

function distanceToAnnotation(position, annotation) {
  return Math.min(
    distanceToLeft(position, annotation),
    distanceToTop(position, annotation),
    distanceToRight(position, annotation),
    distanceToBottom(position, annotation),
  );
}

function isInAnnotation(position, annotation) {
  if (position.x < annotation.left) return false;
  if (position.x > annotation.right) return false;
  if (position.y < annotation.bottom) return false;
  if (position.y > annotation.top) return false;

  return true;
}

export {
  distanceToPoint,
  distanceToLeft,
  distanceToRight,
  distanceToTop,
  distanceToBottom,
  distanceToAnnotation,
  isInAnnotation,
};
