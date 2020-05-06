import Interpreter from 'js-interpreter';
import { DebugService } from '../debug.service';

export class RobotAdapter {

  private debugService: DebugService;

  // TODO: add in robot stats, armour, ammo?, cpu speed etc
  maxSpeed = 0.04;
  maxRotation = 0.02;
  sensorDistance: number;
  sensorBias: integer;

  thrust = 0.0;
  angularVelocity = 0.0;

  interpreter: any;

  constructor(debugService: DebugService) {
    this.debugService = debugService;
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
    this.thrust = this.speedFromPercentage(percentage);
  }

  rotate(percentage: number) {
    this.angularVelocity = this.angleFromPercentage(percentage);
  }

  debugCode(id: string) {
    this.debugService.highlight(id);
  }

  compile(program: string) {
    const adapter = this;
    const initFunc = (interpreter, globalObject) => {
      const robot = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'robot', robot);

      // highlight block
      const hb = (id) => {
        return adapter.debugCode(id);
      };
      interpreter.setProperty(
        robot,
        'debug',
        interpreter.createNativeFunction(hb)
      );

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

      // sensor
      const sw = () => {
        return adapter.sensorDistance;
      };
      interpreter.setProperty(
        robot,
        'sensor',
        interpreter.createNativeFunction(sw)
      );

      // bias
      const bw = () => {
        return adapter.sensorBias;
      };
      interpreter.setProperty(
        robot,
        'bias',
        interpreter.createNativeFunction(bw)
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
