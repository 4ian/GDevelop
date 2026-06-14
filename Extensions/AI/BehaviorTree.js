// Very small behavior tree-like utility
export class BehaviorTreeNode {
  constructor(tickFunc) { this.tickFunc = tickFunc; }
  tick(entity, dt) { return this.tickFunc(entity, dt); }
}

export class SequenceNode {
  constructor(children) { this.children = children; }
  tick(entity, dt) {
    for (const c of this.children) {
      const r = c.tick(entity, dt);
      if (!r) return false;
    }
    return true;
  }
}

export class SelectorNode {
  constructor(children) { this.children = children; }
  tick(entity, dt) {
    for (const c of this.children) {
      const r = c.tick(entity, dt);
      if (r) return true;
    }
    return false;
  }
}
