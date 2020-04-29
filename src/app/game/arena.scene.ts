import Phaser from 'phaser';
import { RobotAdapter, RobotImpl } from '../models/robot.adapter';

class RobotHandler implements RobotImpl {

  sprite: Phaser.Physics.Arcade.Image;
  robotAdapter: RobotAdapter;
  physics: Phaser.Physics.Arcade.ArcadePhysics;

  constructor(
    robotAdapter: RobotAdapter,
    sprite: Phaser.Physics.Arcade.Image,
    physics: Phaser.Physics.Arcade.ArcadePhysics
  ) {
    this.sprite = sprite;
    this.robotAdapter = robotAdapter;
    this.physics = physics;
  }

  forward(percentage: number) {
    this.physics.velocityFromRotation(
      this.sprite.rotation,
      this.robotAdapter.speedFromPercentage(percentage),
      (this.sprite.body as Phaser.Physics.Arcade.Body).acceleration
    );
    this.sprite.setAngularVelocity(0);
  }

  rotate(angularVelocity: number) {
    // TODO: normalise angularVelocity
    this.sprite.setAngularVelocity(angularVelocity);
  }

  accelerate(xa: number, ya: number) {
    this.sprite.setAcceleration(xa, ya);
  }
}

export class ArenaScene extends Phaser.Scene {

  walls: Phaser.GameObjects.GameObject[];
  gfx: Phaser.GameObjects.Graphics;
  sprites: Phaser.Physics.Arcade.Image[];

  robotAdapters: RobotAdapter[];
  robotHandlers: RobotHandler[];

  constructor() {
    super({
      key: 'ArenaScene'
    });
  }

  init(data: any): void {

    this.walls = [];
    this.gfx = null;
    this.sprites = [];
    this.robotHandlers = [];
    this.robotHandlers = [];

    // console.log(data);
    console.log('ArenaScene init');
    console.log(data);
    this.robotAdapters = data.robotAdapters;
  }

  preload(): void {
    this.load.image('ship', 'assets/arena/ship.png');
  }

  create(): void {

    console.log('ArenaScene create');
    this.createWall(5, 5, 10, 600, true);
    this.createWall(15, 5, 400, 10, true);
    this.createWall(395, 15, 10, 600, true);
    this.createWall(15, 595, 400, 10, true);

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

    this.physics.add.collider(this.walls, null);

    this.gfx = this.add.graphics();

    this.createRobots();
  }

  createRobots() {

    let x = 50;
    let y = 50;
    for (const adapter of this.robotAdapters) {
      const sprite = this.physics.add.image(x, y, 'ship');
      sprite.setBounce(0.2);

      sprite.setDamping(true);
      sprite.setDrag(0.5);
      // sprite.setAngularDrag(0.2);

      sprite.setMaxVelocity(120);
      x += sprite.width + 10;
      y += sprite.height + 10;

      const handler = new RobotHandler(adapter, sprite, this.physics);
      adapter.setRobotImpl(handler);
      this.robotHandlers.push(handler);
      this.sprites.push(sprite);
    }
  }

  update(time: number): void {

    this.gfx.clear();

    // TODO: setter for all stuff
    for (const handler of this.robotHandlers) {
      handler.robotAdapter.sensorDistance = this.raycast(handler.sprite, 3000);
      handler.robotAdapter.step();
      this.physics.world.collide(handler.sprite, this.walls);
      this.physics.world.collide(handler.sprite, this.sprites);
    }
  }

  createWall(x: integer, y: integer, width: integer, height: integer, stat: boolean) {
    for (let i = x; i < x + width; i += 10) {
      for (let j = y; j < y + height; j += 10) {
        const w = this.add.rectangle(i, j, 10, 10, 0x666ff);
        this.physics.add.existing(w, stat);
        this.walls.push(w);
      }
    }
  }

  raycast(robot: Phaser.Physics.Arcade.Image, range: integer) {

    const startX = robot.x;
    const startY = robot.y;
    const rotation = robot.rotation;

    const px = Math.cos(rotation);
    const py = Math.sin(rotation);

    const zone = robot.width * 0.5 * Math.SQRT2;

    let currentX = (px * zone) + startX;
    let currentY = (py * zone) + startY;

    let distance = 0;

    const allOtherObjects: Phaser.GameObjects.GameObject[] = [];
    for (const w of this.walls) {
      allOtherObjects.push(w);
    }
    for (const r of this.robotHandlers) {
      if (r.sprite !== robot) {
        allOtherObjects.push(r.sprite);
      }
    }
    while (distance < range) {
      const closest = this.physics.closest(
        {
          x: currentX,
          y: currentY
        },
        allOtherObjects
      ) as Phaser.Physics.Arcade.Body;
      if (closest) {
        const dd = Phaser.Math.Distance.Between(currentX, currentY, closest.x, closest.y);

        if (dd <= zone) {
          if (this.game.config.physics.arcade.debug) {
            // this.gfx.strokeCircle(nX, nY, zone);
            this.gfx.strokeCircle(currentX, currentY, zone);
          }
          return distance;
        }

        distance += dd;
        const nX = (px * dd) + currentX;
        const nY = (py * dd) + currentY;

        if (this.game.config.physics.arcade.debug) {
          this.gfx.lineStyle(2, 0xff3300)
            .strokeCircle(currentX, currentY, dd)
            .lineBetween(closest.x, closest.y, currentX, currentY)
            .lineStyle(2, 0xffff00)
            .lineBetween(currentX, currentY, nX, nY);
        }
        currentX = nX;
        currentY = nY;

      } else {
        return range + 1;
      }
    }
  }
}
