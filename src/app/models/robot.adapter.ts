import Phaser from 'phaser';
import Interpreter from 'js-interpreter';

export interface RobotImpl {
  forward(percentage: number): void;

  rotate(angularVelocity: number): void;

  accelerate(xa: number, ya: number): void;
}

export class RobotAdapter {

  // TODO: add in robot stats, armour, ammo?, cpu speed etc
  maxSpeed: integer = 100;
  sensorDistance: number;

  robotImpl: RobotImpl;
  interpreter: any;

  constructor() {}

  setRobotImpl(robotImpl: RobotImpl) {
    this.robotImpl = robotImpl;
  }

  speedFromPercentage(percentage: number): integer {
    const np = Math.min(Math.max(percentage, 0.0), 1.0);
    return this.maxSpeed * np;
  }

  forward(percentage: number) {
    this.robotImpl.forward(percentage);
  }

  rotate(angularVelocity: number) {
    this.robotImpl.rotate(angularVelocity);
  }

  accelerate(xa: number, ya: number) {
    this.robotImpl.accelerate(xa, ya);
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

    for (let n = 0; n < 5; n++) {
      this.interpreter.step();
    }
  }
}