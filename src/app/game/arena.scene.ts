import Phaser from 'phaser';
import { RobotAdapter } from '../models/robot.adapter';
import { ArenaHelper, SensorDetails } from './arena.helper';
import { BulletGroup, BULLET_LABEL } from './bullet.group';

export const WALL_LABEL = 'wall';
export const ROBOT_LABEL = 'robot';

class RobotHandler {

  sprite: Phaser.Physics.Matter.Image;
  robotAdapter: RobotAdapter;
  physics: Phaser.Physics.Matter.MatterPhysics;
  bulletGroup: BulletGroup;

  constructor(
    robotAdapter: RobotAdapter,
    sprite: Phaser.Physics.Matter.Image,
    physics: Phaser.Physics.Matter.MatterPhysics,
    scene: ArenaScene
  ) {
    this.sprite = sprite;
    this.robotAdapter = robotAdapter;
    this.physics = physics;
    this.bulletGroup = new BulletGroup(sprite, sprite.width / 2, 0, physics, scene);

    this.sprite.setMass(30);
    this.sprite.setFrictionAir(0.15);
    this.sprite.setFixedRotation();
  }

  step(details: SensorDetails, tick: number) {
    // set inputs
    this.robotAdapter.sensorDistance = details.distance;
    this.robotAdapter.sensorBias = details.bias;
    this.robotAdapter.sensorLabel = details.label;

    // do some code execution
    this.robotAdapter.step();

    // set outputs
    this.sprite.thrust(this.robotAdapter.thrust);
    this.sprite.setAngularVelocity(this.robotAdapter.angularVelocity);

    if (this.robotAdapter.fireRequest === true) {
      if (this.bulletGroup.fire(tick) === true) {
        this.robotAdapter.fireRequest = false;
      }
    }
  }
}

export class ArenaScene extends Phaser.Scene {

  helper: ArenaHelper;

  walls: Phaser.GameObjects.GameObject[];
  gfx: Phaser.GameObjects.Graphics;
  sprites: Phaser.Physics.Matter.Image[];
  text: Phaser.GameObjects.Text;
  debug = false;
  soundfx = false;

  robotAdapters: RobotAdapter[];
  robotHandlers: RobotHandler[];

  constructor() {
    super({
      key: 'ArenaScene'
    });
  }

  toggleDebug() {
    this.debug = !this.debug;
  }

  toggleSoundFX() {
    this.soundfx = !this.soundfx;
  }

  init(data: any): void {

    this.gfx = null;
    this.sprites = [];
    this.robotHandlers = [];
    this.robotHandlers = [];

    console.log('ArenaScene init');
    console.log(data);
    this.robotAdapters = data.robotAdapters;
  }

  preload(): void {
    this.load.image('ship', 'assets/arena/ship.png');
    this.load.image('wall', 'assets/arena/platform.png');
    this.load.spritesheet('bullet', 'assets/arena/smoke.png', { frameWidth: 4, frameHeight: 4 });
    this.load.image('spark0', 'assets/arena/blue.png');
    this.load.image('spark1', 'assets/arena/red.png');

    this.load.audio('gunshot', ['assets/arena/gunshot.mp3']);
    this.load.audio('hit', ['assets/arena/hit.mp3']);
    this.load.audio('thud', ['assets/arena/thud.mp3']);
  }

  create(): void {

    console.log('ArenaScene create');
    this.createWall(0, 0, 10, 600, true);
    this.createWall(0, 0, 400, 10, true);
    this.createWall(390, 0, 10, 600, true);
    this.createWall(0, 590, 400, 10, true);

    for (let i = 0; i < 3; i++) {
      this.createWall(
        55 + Math.random() * 300,
        55 + Math.random() * 500,
        20,
        20 + Math.random() * 200,
        false,
      );
      this.createWall(
        55 + Math.random() * 300,
        55 + Math.random() * 500,
        20 + Math.random() * 200,
        20,
        false
      );
    }
    this.createRobots();
    this.text = this.add.text(350, 270, '', { font: '9px Courier', fill: '#00ff00' });
    this.gfx = this.add.graphics();

    // all the bodies we care about for sensing
    const allBodies = this.matter.getMatterBodies();
    this.helper = new ArenaHelper(this, allBodies);

    this.matter.world.on('collisionstart', this.collisionHandler.bind(this));
  }

  private smallExplosion(x: integer, y: integer, sound: string) {

    const p0 = this.add.particles('spark0');
    const emitter0 = p0.createEmitter({
      x,
      y,
      speed: { min: -400, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      lifespan: 200,
      gravityY: 800
    });
    const p1 = this.add.particles('spark1');
    const emitter1 = p1.createEmitter({
      x,
      y,
      speed: { min: -400, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.05, end: 0 },
      blendMode: 'ADD',
      lifespan: 100,
      gravityY: 800
    });
    emitter0.explode(20, x, y);
    emitter1.explode(20, x, y);

    if (this.soundfx) {
      const sfx = this.sound.add(sound, { volume: 0.2 });
      sfx.on('complete', () => {
        sfx.destroy();
      });
      sfx.play();
    }

    this.time.delayedCall(200, () => {
      p0.destroy();
      p1.destroy();
    });
  }

  collisionHandler(event: Phaser.Physics.Matter.Events.CollisionStartEvent) {

    const pairs = event.pairs;

    for (const pair of pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      let bulletCollision = false;
      let bullet = null;
      let bulletTarget = null;

      if (bodyA.label === BULLET_LABEL) {
        bullet = bodyA;
        bulletTarget = bodyB;
        bulletCollision = true;
      }

      if (bodyB.label === BULLET_LABEL) {
        bullet = bodyB;
        bulletTarget = bodyA;
        bulletCollision = true;
      }

      if (bulletCollision) {
        let sound = 'thud';
        if (bulletTarget.gameObject != null) {
          bulletTarget.gameObject.setTintFill(0xff0000);
          this.time.delayedCall(50, (go: any) => {
            go.clearTint();
          }, [bulletTarget.gameObject]);
          sound = bulletTarget.label === ROBOT_LABEL ? 'hit' : 'thud';
        }
        if (bullet.gameObject !== null) {
          this.smallExplosion(bullet.gameObject.x, bullet.gameObject.y, sound);
          bullet.gameObject.destroyCallback();
        }
      }
    }
  }

  createRobots() {

    let x = 50;
    let y = 50;
    for (const adapter of this.robotAdapters) {

      const sprite = this.matter.add.image(x, y, 'ship', null, { label: ROBOT_LABEL });
      x += sprite.width + 10;
      y += sprite.height + 10;

      const handler = new RobotHandler(adapter, sprite, this.matter, this);
      this.robotHandlers.push(handler);
      this.sprites.push(sprite);
    }
  }

  update(time: number): void {

    this.gfx.clear();

    for (const handler of this.robotHandlers) {
      // TODO: setter/container for all stuff
      handler.step(this.helper.distanceToNearest(handler.sprite, 3000), time);

      if (this.debug) {
        const ra = handler.robotAdapter;
        const ts = handler.sprite;
        // TODO: need text object per sprite, add to handler
        this.text.setPosition(ts.x - ts.width, ts.y + ts.height / 2);
        this.text.setText([
          'Rotation: ' + Math.floor(ts.angle),
          'Sensor:',
          '  dist: ' + Math.floor(ra.sensorDistance),
          '  bias: ' + ra.sensorBias,
          '  label: ' + ra.sensorLabel,
          // 'Thrust: ' + Math.floor((ts.body as any).thrust * 100), // TODO: need matter type
        ]);
        this.text.setVisible(true);
      } else {
        this.text.setVisible(false);
      }
    }
  }

  createWall(x: integer, y: integer, width: integer, height: integer, stat: boolean) {
    const wall = this.matter.add.image(
      x + (width / 2.0),
      y + (height / 2.0),
      'wall',
      null,
      { isStatic: stat, label: WALL_LABEL }
    ).setScale(width / 500.0, height / 64.0).setAngle(stat ? 0 : 45);
  }
}
