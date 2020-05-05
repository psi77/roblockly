import { ArenaScene } from './arena.scene';

class DaP {
  distance: number;
  point: Phaser.Geom.Point;
  constructor(distance: number, point: Phaser.Geom.Point) {
    this.distance = distance;
    this.point = point;
  }
}

export class DaB {
  distance: number;
  bias: integer;
  constructor(distance: number, bias: integer) {
    this.distance = distance;
    this.bias = bias;
  }
}

class RayFinder {

  rayStart: Phaser.Geom.Point;
  rayEnd: Phaser.Geom.Point;
  bias: integer;

  // TODO: bounds protocol!
  private static pointToBounds(start: Phaser.Geom.Point, end: Phaser.Geom.Point, bounds): Phaser.Geom.Point {
    const cp = RayFinder.closestPoint(
      start.x,
      start.y,
      bounds,
    );
    const is1 = RayFinder.lineLineIntersection(
      start,
      end,
      cp,
      new Phaser.Geom.Point(cp.x + bounds.max.x - bounds.min.x, cp.y),
    );
    const is2 = RayFinder.lineLineIntersection(
      start,
      end,
      cp,
      new Phaser.Geom.Point(cp.x, cp.y + bounds.max.y - bounds.min.y),
    );
    const sbb = {
      min: {
        x: bounds.min.x - 1,
        y: bounds.min.y - 1,
      },
      max: {
        x: bounds.max.x + 1,
        y: bounds.max.y + 1,
      }
    };
    if (is1 !== undefined && RayFinder.contains(sbb, is1)) {
      return is1;
    }
    if (is2 !== undefined && RayFinder.contains(sbb, is2)) {
      return is2;
    }
    return undefined;
  }

  private static contains(bounds, point: Phaser.Geom.Point) {
    return point.x >= bounds.min.x && point.x <= bounds.max.x
      && point.y >= bounds.min.y && point.y <= bounds.max.y;
  }

  private static closestPoint(px: integer, py: integer, bounds): Phaser.Geom.Point {
    const dx = Math.max(bounds.min.x - px, 0, px - bounds.max.x);
    const dy = Math.max(bounds.min.y - py, 0, py - bounds.max.y);
    const mx = Math.sign(bounds.min.x - px);
    const my = Math.sign(bounds.min.y - py);
    return new Phaser.Geom.Point((dx * mx) + px, (dy * my) + py);
  }

  private static lineLineIntersection(
    A: Phaser.Geom.Point,
    B: Phaser.Geom.Point,
    C: Phaser.Geom.Point,
    D: Phaser.Geom.Point): Phaser.Geom.Point {

    // Line AB represented as a1x + b1y = c1
    const a1 = B.y - A.y;
    const b1 = A.x - B.x;
    const c1 = a1 * (A.x) + b1 * (A.y);

    // Line CD represented as a2x + b2y = c2
    const a2 = D.y - C.y;
    const b2 = C.x - D.x;
    const c2 = a2 * (C.x) + b2 * (C.y);

    const determinant = a1 * b2 - a2 * b1;

    if (determinant === 0) {
      // The lines are parallel.
      return undefined;
    } else {
      const x = (b2 * c1 - b1 * c2) / determinant;
      const y = (a1 * c2 - a2 * c1) / determinant;
      return new Phaser.Geom.Point(x, y);
    }
  }

  constructor(ox: number, oy: number, dx: number, dy: number, cosr: number, sinr: number, range: number, bias: integer) {

    this.bias = bias;
    this.rayStart = new Phaser.Geom.Point(
      ox + (dx * cosr) - (dy * sinr),
      oy + (dx * sinr) + (dy * cosr)
    );
    const oex = dx + range;
    const oey = dy;
    const fex = ox + (oex * cosr) - (oey * sinr);
    const fey = oy + (oex * sinr) + (oey * cosr);

    this.rayEnd = new Phaser.Geom.Point(fex, fey);
  }

  initDebug(gfx: Phaser.GameObjects.Graphics) {
      gfx.lineBetween(this.rayStart.x, this.rayStart.y, this.rayEnd.x, this.rayEnd.y);
      gfx.strokeCircle(this.rayStart.x, this.rayStart.y, 2);
  }

  distanceAndPoint(x: integer, y: integer, width: integer, height: integer, rotation: number): DaP {  // TODO: need type for bounds!

    const s = Math.sin(-rotation);
    const c = Math.cos(-rotation);

    // translate
    const tsx = this.rayStart.x - x;
    const tsy = this.rayStart.y - y;
    const tex = this.rayEnd.x - x;
    const tey = this.rayEnd.y - y;

    // rotate
    const rsx = (tsx * c) - (tsy * s);
    const rsy = (tsx * s) + (tsy * c);

    const rex = (tex * c) - (tey * s);
    const rey = (tex * s) + (tey * c);

    const ray = RayFinder.pointToBounds(
      new Phaser.Geom.Point(rsx, rsy),
      new Phaser.Geom.Point(rex, rey),
      {
        min: {
          x: - width / 2,
          y: - height / 2
        },
        max: {
          x: width / 2,
          y: height / 2
        }
      }
    );
    if (ray !== undefined) {
      const dist = Phaser.Math.Distance.BetweenPointsSquared(new Phaser.Geom.Point(rsx, rsy), ray);
      // translate point back
      const ic = Math.cos(rotation);
      const is = Math.sin(rotation);
      const nx = (ray.x * ic) - (ray.y * is);
      const ny = (ray.x * is) + (ray.y * ic);
      return new DaP(dist, new Phaser.Geom.Point(x + nx, y + ny));
    } else {
      return undefined;
    }
  }
}

export class ArenaHelper {

  arenaScene: ArenaScene;

  constructor(arenaScene: ArenaScene) {
    this.arenaScene = arenaScene;
    // TODO: sin cos lookup
  }

  // TODO: factor this lot out into a helper which we can add a sin/cos lookup to
  distanceToNearest(origin: Phaser.Physics.Matter.Image, maxRange: integer): DaB {

    // TODO: use lookup
    const sr = Math.sin(origin.rotation);
    const cr = Math.cos(origin.rotation);

    const oex = origin.x + maxRange + (origin.width / 2.0);
    const oey = origin.y;

    const endX = origin.x + (oex * cr) - (oey * sr);
    const endY = origin.y + (oex * sr) + (oey * cr);

    const rayWidth = origin.width;

    // TODO: there may be a bug here where sometimes the scanner doesn't see some blocks... :(
    const bodies = this.arenaScene.matter.intersectRay(origin.x, origin.y, endX, endY, rayWidth);

    let closestDistance = maxRange * maxRange;
    let closestPoint: Phaser.Geom.Point = null;
    let closestBias = 0;

    const leftRay = new RayFinder(origin.x, origin.y, origin.width / 2.0, -origin.height / 2.0, cr, sr, maxRange, 1);
    const midRay = new RayFinder(origin.x, origin.y, origin.width / 2.0, 0.0, cr, sr, maxRange, 0);
    const rightRay = new RayFinder(origin.x, origin.y, origin.width / 2.0, origin.height / 2.0, cr, sr, maxRange, -1);

    const rays = [midRay, leftRay, rightRay];

    if (this.arenaScene.debug) {
      this.arenaScene.gfx.lineStyle(1, 0xffff00);
      for (const ray of rays) {
        ray.initDebug(this.arenaScene.gfx);
      }
    }
    for (const bod of bodies) {
      // TODO: get matter type to cast to
      const go = (bod as any).gameObject as Phaser.GameObjects.GameObject;
      if (go.body !== origin.body) {

        const pos = (bod as any).position;
        const w = (bod as any).gameObject._scaleX * (bod as any).gameObject.width;
        const h = (bod as any).gameObject._scaleY * (bod as any).gameObject.height;
        const r = (bod as any).angle;

        if (this.arenaScene.debug) {
          const gfx = this.arenaScene.gfx;

          gfx.lineStyle(2, 0x00ffff);
          gfx.save();
          gfx.translateCanvas(pos.x, pos.y);
          gfx.rotateCanvas(r);
          gfx.strokeRect(- w / 2, - h / 2, w, h);
          gfx.restore();
          gfx.strokeCircle(pos.x, pos.y, 3);
        }

        for (const ray of rays) {
          const dap = ray.distanceAndPoint(pos.x, pos.y, w, h, r);
          if (dap !== undefined && this.arenaScene.debug) {
            this.arenaScene.gfx.strokeCircle(dap.point.x, dap.point.y, 3);
          }
          if (dap !== undefined && dap.distance < closestDistance) {
            closestDistance = dap.distance;
            closestPoint = dap.point;
            closestBias = ray.bias;
          }
        }
      }
    }
    if (closestPoint && this.arenaScene.debug) {
      this.arenaScene.gfx.lineStyle(1, 0xff0000);
      this.arenaScene.gfx.strokeCircle(closestPoint.x, closestPoint.y, rayWidth / 2.0);
    }
    return new DaB(Math.sqrt(closestDistance), closestBias);
  }
}
