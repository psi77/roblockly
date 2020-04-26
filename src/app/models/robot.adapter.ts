import Phaser from 'phaser';
import Interpreter from 'js-interpreter';

export class RobotAdapter {

  // TODO: add in robot stats, armour, ammo?, cpu speed etc
  maxSpeed: integer = 200;
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

  acceleration(xa: number, ya: number) {
    this.sprite.setAcceleration(xa, ya);
  }

  stop() {
    this.sprite.setAcceleration(0);
  }

  compile(program: string) {
    const initFunc = (interpreter, globalObject) => {
      const robot = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'robot', robot);
      const wrapper = function(speed) {
        return this.forward(speed);
      };
      interpreter.setProperty(
        robot,
        'forward',
        interpreter.createNativeFunction(wrapper)
      );
    };
    this.interpreter = new Interpreter(program, initFunc);
  }

  step() {
    // TODO: cpu, better takes more steps
    this.interpreter.step();
  }
}
