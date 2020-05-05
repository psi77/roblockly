import Phaser from 'phaser';
import { RobotAdapter } from '../models/robot.adapter';
import { ArenaHelper, DaB } from './arena.helper';

class RobotHandler {

  sprite: Phaser.Physics.Matter.Image;
  robotAdapter: RobotAdapter;
  physics: Phaser.Physics.Matter.MatterPhysics;

  constructor(
    robotAdapter: RobotAdapter,
    sprite: Phaser.Physics.Matter.Image,
    physics: Phaser.Physics.Matter.MatterPhysics
  ) {
    this.sprite = sprite;
    this.robotAdapter = robotAdapter;
    this.physics = physics;

    this.sprite.setMass(30);
    this.sprite.setFrictionAir(0.15);
    this.sprite.setFixedRotation();
  }

  step(dab: DaB) {
    // set inputs
    this.robotAdapter.sensorDistance = dab.distance;
    this.robotAdapter.sensorBias = dab.bias;

    // do some code execution
    this.robotAdapter.step();

    // set outputs
    this.sprite.thrust(this.robotAdapter.thrust);
    this.sprite.setAngularVelocity(this.robotAdapter.angularVelocity);
  }
}

export class ArenaScene extends Phaser.Scene {

  helper: ArenaHelper;

  walls: Phaser.GameObjects.GameObject[];
  gfx: Phaser.GameObjects.Graphics;
  sprites: Phaser.Physics.Matter.Image[];
  text: Phaser.GameObjects.Text;
  debug = false;

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

  init(data: any): void {

    // this.walls = [];
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
    this.helper = new ArenaHelper(this);
  }

  createRobots() {

    let x = 50;
    let y = 50;
    for (const adapter of this.robotAdapters) {

      const sprite = this.matter.add.image(x, y, 'ship');
      x += sprite.width + 10;
      y += sprite.height + 10;

      const handler = new RobotHandler(adapter, sprite, this.matter);
      this.robotHandlers.push(handler);
      this.sprites.push(sprite);
    }
  }

  update(time: number): void {

    this.gfx.clear();

    for (const handler of this.robotHandlers) {
      // TODO: setter/container for all stuff
      handler.step(this.helper.distanceToNearest(handler.sprite, 3000));

      if (this.debug) {
        const ra = handler.robotAdapter;
        const ts = handler.sprite;
        // TODO: need text object per sprite, add to handler
        this.text.setPosition(ts.x - ts.width, ts.y + ts.height / 2);
        this.text.setText([
          'Rotation: ' + Math.floor(ts.angle),
          'Sensor: ' + Math.floor(ra.sensorDistance),
          'Bias: ' + ra.sensorBias,
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
      { isStatic: stat }
    ).setScale(width / 500.0, height / 64.0).setAngle(stat ? 0 : 45);
  }
}
