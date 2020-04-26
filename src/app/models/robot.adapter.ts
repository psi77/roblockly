import Phaser from 'phaser';
import Interpreter from 'js-interpreter';

export class RobotAdapter {

  // TODO: add in robot stats, armour, ammo?, cpu speed etc
  maxSpeed: integer = 100;
  sensorDistance: number;
  sprite: Phaser.Physics.Arcade.Image;
  physics: Phaser.Physics.Arcade.ArcadePhysics;

  interpreter: any;

  // TODO: pass functions for movement etc so can handle phaser.arcade specific?
  constructor(
    sprite: Phaser.Physics.Arcade.Image,
    physics: Phaser.Physics.Arcade.ArcadePhysics
  ) {
    this.sprite = sprite;
    this.physics = physics;
  }

  speedFromPercentage(percentage: number): integer {
    const np = Math.min(Math.max(percentage, 0.0), 1.0);
    return this.maxSpeed * np;
  }

  forward(percentage: number) {
    this.physics.velocityFromRotation(
      this.sprite.rotation,
      this.speedFromPercentage(percentage),
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

  stop() {
    this.sprite.setAcceleration(0);
  }

  compile(program: string) {
    const adapter = this;
    const initFunc = (interpreter, globalObject) => {
      const robot = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'robot', robot);

      // forward
      const fw = (percentage) => {
        return adapter.forward(percentage);
      };
      interpreter.setProperty(
        robot,
        'forward',
        interpreter.createNativeFunction(fw)
      );

      // rotate
      const rw = (velocity) => {
        return adapter.rotate(velocity);
      };
      interpreter.setProperty(
        robot,
        'rotate',
        interpreter.createNativeFunction(rw)
      );

      // acceleration
      const aw = (xa, ya) => {
        return adapter.accelerate(xa, ya);
      };
      interpreter.setProperty(
        robot,
        'accelerate',
        interpreter.createNativeFunction(aw)
      );

      // scanner
      const sw = () => {
        return adapter.sensorDistance;
      };
      interpreter.setProperty(
        robot,
        'sensor',
        interpreter.createNativeFunction(sw)
      );

    };
    this.interpreter = new Interpreter(program, initFunc);
  }

  step() {
    // TODO: cpu, better takes more steps

    for (let n = 0; n < 10; n++) {
      this.interpreter.step();
    }
  }
}
