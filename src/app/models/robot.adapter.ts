import Interpreter from 'js-interpreter';

export interface RobotImpl {
  forward(percentage: number): void;

  rotate(percentage: number): void;
}

export class RobotAdapter {

  // TODO: add in robot stats, armour, ammo?, cpu speed etc
  maxSpeed: integer = 120;
  maxRotation: integer = 5;
  sensorDistance: number;

  robotImpl: RobotImpl;
  interpreter: any;

  constructor() {}

  setRobotImpl(robotImpl: RobotImpl) {
    this.robotImpl = robotImpl;
  }

  clampNumber(n: number, bottom: number, top: number): number {
    if (isNaN(n)) {
      n = 0;
    }
    return Math.min(Math.max(n, bottom), top);
  }

  speedFromPercentage(percentage: number): integer {
    const np = this.clampNumber(percentage, 0.0, 100.0);
    return this.maxSpeed * (np / 100.0);
  }

  angleFromPercentage(percentage: number): integer {
    const np = this.clampNumber(percentage, -100.0, 100.0);
    return this.maxRotation * (np / 100.0);
  }

  forward(percentage: number) {
    this.robotImpl.forward(percentage);
  }

  rotate(percentage: number) {
    this.robotImpl.rotate(this.angleFromPercentage(percentage));
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
      const rw = (percentage) => {
        return adapter.rotate(percentage);
      };
      interpreter.setProperty(
        robot,
        'rotate',
        interpreter.createNativeFunction(rw)
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
    if (this.interpreter) {
      for (let n = 0; n < 5; n++) {
        this.interpreter.step();
      }
    }

    // TODO: dual core! :)
  }
}
