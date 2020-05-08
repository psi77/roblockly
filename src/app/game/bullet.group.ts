import Phaser from 'phaser';
import { SinCosLookup } from './lookup';
import { ArenaScene } from './arena.scene';

export const BULLET_LABEL = 'bullet_label';

export class BulletGroup {

  // smaller is faster
  FIRE_RATE = 100;

  origin: Phaser.Physics.Matter.Image;
  matter: Phaser.Physics.Matter.MatterPhysics;
  dx: integer;
  dy: integer;
  scene: ArenaScene;
  lastFire = 0.0;

  bullets: Phaser.Physics.Matter.Image[];

  constructor(
    origin: Phaser.Physics.Matter.Image,
    dx: integer,
    dy: integer,
    matter: Phaser.Physics.Matter.MatterPhysics,
    scene: ArenaScene
  ) {
    this.origin = origin;
    this.matter = matter;
    this.dx = dx;
    this.dy = dy;
    this.scene = scene;
  }

  private doFire() {

    const bullet = this.matter.add.image(-50, -50, 'bullet', 0, {isSensor: true, label: BULLET_LABEL});
    bullet.setFixedRotation();
    bullet.setMass(0.003);

    const bp = this.scene.add.particles('bullet');
    const be = bp.createEmitter({
      frame: 1,
      speed: (particle: Phaser.GameObjects.Particles.Particle, key: string, value: number): number => {
        return this.bitDiff(40, 6);
      },
      lifespan: (particle: Phaser.GameObjects.Particles.Particle, key: string, value: number): number => {
        return this.bitDiff(200, 20);
      },
      alpha: (particle: Phaser.GameObjects.Particles.Particle, key: string, value: number): number => {
        return this.bitDiff(200, 10);
      },
      scale: { start: 1.0, end: 0.5 },
      blendMode: 'ADD'
    });

    const cosr = SinCosLookup.inst.cos(this.origin.angle);
    const sinr = SinCosLookup.inst.sin(this.origin.angle);
    bullet.setRotation(this.origin.rotation);
    const bsx = this.origin.x + (this.dx * cosr) - (this.dy * sinr);
    const bsy = this.origin.y + (this.dx * sinr) + (this.dy * cosr);
    bullet.setPosition(bsx, bsy);
    const s = this.bitDiff(10, 2);
    const bv = (this.origin.body as any).velocity;
    bullet.setVelocity(bv.x + s * cosr, bv.y + s * sinr);
    be.startFollow(bullet);

    if (this.scene.soundfx) {
      const sfx = this.scene.sound.add('gunshot', { volume: 0.2 });
      sfx.on('complete', () => {
        sfx.destroy();
      });
      sfx.play();
    }

    // TODO: maybe use module augmentation
    // see https://stackoverflow.com/questions/12698893/is-there-a-way-to-add-methods-on-the-fly-to-a-class-using-typescript
    (bullet.body as any).gameObject.destroyCallback = () => {
      bp.destroy();
      bullet.destroy();
    };
  }

  private bitDiff(base: integer, delta: integer): integer {
    return base - delta + (Math.random() * 2 * delta);
  }

  fire(tick: number): boolean {
    if (tick - this.lastFire > this.FIRE_RATE) {
      this.doFire();
      this.lastFire = tick;
      return true;
    } else {
      return false;
    }
 }
}
