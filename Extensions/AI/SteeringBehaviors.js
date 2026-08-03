// Simple steering behaviors (seek, flee, arrive, wander)
export const Steering = {
  seek: function(position, target, maxSpeed) {
    const desired = { x: target.x - position.x, y: target.y - position.y };
    const len = Math.hypot(desired.x, desired.y) || 1;
    desired.x /= len; desired.y /= len;
    return { x: desired.x * maxSpeed, y: desired.y * maxSpeed };
  },
  flee: function(position, target, maxSpeed) {
    const desired = { x: position.x - target.x, y: position.y - target.y };
    const len = Math.hypot(desired.x, desired.y) || 1;
    desired.x /= len; desired.y /= len;
    return { x: desired.x * maxSpeed, y: desired.y * maxSpeed };
  },
  arrive: function(position, target, maxSpeed, slowdownRadius) {
    const desired = { x: target.x - position.x, y: target.y - position.y };
    const dist = Math.hypot(desired.x, desired.y);
    if (dist < 0.0001) return { x:0, y:0 };
    let speed = maxSpeed;
    if (dist < slowdownRadius) speed = maxSpeed * (dist / slowdownRadius);
    desired.x = (desired.x / dist) * speed;
    desired.y = (desired.y / dist) * speed;
    return desired;
  }
};
