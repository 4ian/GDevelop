// @flow
import * as PIXI from 'pixi.js-legacy';

export type PanMoveEvent = {|
  deltaX: number,
  deltaY: number,
  velocity: number,
  data: PIXI.FederatedPointerEvent,
|};

export default function panable(
  sprite: PIXI.DisplayObject,
  inertia: boolean = false
) {
  function pointerDown(e: PIXI.FederatedPointerEvent) {
    start(e.data.originalEvent.nativeEvent);
  }

  function start(t: Touch) {
    if (sprite._pan) {
      if (!sprite._pan.intervalId) {
        return;
      }
      clearInterval(sprite._pan.intervalId);
      sprite.emit('panend');
    }
    sprite._pan = {
      p: {
        x: t.clientX,
        y: t.clientY,
        date: new Date(),
      },
    };
    sprite.addEventListener('globalpointermove', pointerMove);
  }

  function pointerMove(e: PIXI.FederatedPointerEvent) {
    let touch = e.data.originalEvent.nativeEvent;
    if (!e.data.isPrimary) {
      end(e, touch);
      return;
    }
    move(e, touch);
  }

  function move(e: PIXI.FederatedPointerEvent, t: Touch) {
    let now = new Date();
    let interval = now - sprite._pan.p.date;
    if (interval < 12) {
      return;
    }
    let dx = t.clientX - sprite._pan.p.x;
    let dy = t.clientY - sprite._pan.p.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (!sprite._pan.pp) {
      let threshold = t instanceof window.MouseEvent ? 2 : 7;
      if (distance > threshold) {
        sprite.emit('panstart');
      } else {
        return;
      }
    } else {
      let event: PanMoveEvent = {
        deltaX: dx,
        deltaY: dy,
        velocity: distance / interval,
        data: e.data,
      };
      sprite.emit('panmove', event);
    }
    sprite._pan.pp = {
      x: sprite._pan.p.x,
      y: sprite._pan.p.y,
      date: sprite._pan.p.date,
    };
    sprite._pan.p = {
      x: t.clientX,
      y: t.clientY,
      date: now,
    };
  }

  function pointerUp(e: PIXI.FederatedPointerEvent) {
    end(e, e.data.originalEvent.nativeEvent);
  }

  function end(e: PIXI.FederatedPointerEvent, t: Touch) {
    sprite.removeEventListener('globalpointermove', pointerMove);
    if (!sprite._pan || !sprite._pan.pp) {
      sprite._pan = null;
      return;
    }
    if (inertia && t) {
      if (sprite._pan.intervalId) {
        return;
      }
      let interval = new Date() - sprite._pan.pp.date;
      let vx = (t.clientX - sprite._pan.pp.x) / interval;
      let vy = (t.clientY - sprite._pan.pp.y) / interval;
      sprite._pan.intervalId = setInterval(() => {
        if (Math.abs(vx) < 0.04 && Math.abs(vy) < 0.04) {
          clearInterval(sprite._pan.intervalId);
          sprite.emit('panend');
          sprite._pan = null;
          return;
        }
        let touch = {
          clientX: sprite._pan.p.x + vx * 12,
          clientY: sprite._pan.p.y + vy * 12,
        };
        // $FlowFixMe
        move(e, touch);
        vx *= 0.9;
        vy *= 0.9;
      }, 12);
    } else {
      sprite.emit('panend');
      sprite._pan = null;
    }
  }

  sprite.eventMode = 'static';
  sprite.addEventListener('pointerdown', pointerDown);
  sprite.addEventListener('pointerup', pointerUp);
  sprite.addEventListener('pointerupoutside', pointerUp);
}
