import Phaser from 'phaser';
import { RobotAdapter, RobotImpl } from '../models/robot.adapter';

export class ArenaScene extends Phaser.Scene implements RobotImpl {

  sprite: Phaser.Physics.Arcade.Image;
  walls: Phaser.GameObjects.GameObject[] = [];
  gfx: Phaser.GameObjects.Graphics;

  robotAdapter: RobotAdapter;

  constructor() {
    super({
      key: 'ArenaScene'
    });
  }

  init(data: any): void {
    console.log(data);
    this.robotAdapter = data.robotAdapter;
    this.robotAdapter.setRobotImpl(this);
  }

  preload(): void {
    this.load.image('ship', 'assets/arena/ship.png');
  }

  create(): void {

    this.sprite = this.physics.add.image(200, 300, 'ship');

    this.sprite.setBounce(0.2);
    this.sprite.setDamping(true);
    this.sprite.setDrag(0.50);
    this.sprite.setMaxVelocity(120);

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
  }

  update(time: number): void {

    // const nearest = this.raycast(
    //   this.sprite,
    //   3000
    // );

    // if (nearest === 0) {
    //   this.sprite.setAngularVelocity(-300);
    //   this.sprite.setAcceleration(2);
    // } else if (nearest < 60) {
    //   this.sprite.setAngularVelocity(-100);
    //   this.sprite.setAcceleration(0);
    // } else {
    //   this.sprite.setAngularVelocity(0);
    //   this.physics.velocityFromRotation(
    //     this.sprite.rotation,
    //     120,
    //     (this.sprite.body as Phaser.Physics.Arcade.Body).acceleration
    //   );
    // }

    // TODO: setter for all stuff
    this.robotAdapter.sensorDistance = this.raycast(this.sprite, 3000);
    this.robotAdapter.step();

    this.physics.world.collide(this.sprite, this.walls);
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

    let currentX = startX;
    let currentY = startY;
    let distance = 0;

    if (robot.body.overlapX !== 0 || robot.body.overlapY !== 0) {
      console.log('stuck');
      return distance;
    }

    const px = Math.cos(rotation);
    const py = Math.sin(rotation);

    // TODO: maybe want to do this outside of here if doing more than one scan!
    this.gfx.clear();

    while (distance < range) {
      const closest = this.physics.closest(
        {
          x: currentX,
          y: currentY
        },
        this.walls
      ) as Phaser.Physics.Arcade.Body;
      if (closest) {
        const dd = Phaser.Math.Distance.Between(currentX, currentY, closest.x, closest.y);
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

        const zone = robot.width * 0.5 * Math.SQRT2;
        if (dd < zone) {
          if (this.game.config.physics.arcade.debug) {
            this.gfx.strokeCircle(nX, nY, zone);
          }
          return distance;
        }

      } else {
        return range + 1;
      }
    }
  }

  forward(percentage: number) {
    this.physics.velocityFromRotation(
      this.sprite.rotation,
      this.robotAdapter.speedFromPercentage(percentage), // TODO: not will be robot specific
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
