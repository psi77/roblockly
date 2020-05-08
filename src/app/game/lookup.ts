export class SinCosLookup {

  public static inst = new SinCosLookup();

  LENGTH = 3600.0;
  FACTOR = this.LENGTH / 360.0;
  pSin: number[];
  pCos: number[];

  constructor() {
    this.init();
  }

  init() {
    this.pSin = [this.LENGTH];
    this.pCos = [this.LENGTH];
    let sv = 0;
    let cv = 1;
    const freq = 2 * Math.PI / this.LENGTH;
    for (let n = 0; n < this.LENGTH; n++) {
      this.pSin[n] = sv;
      this.pCos[n] = cv;
      cv -= sv * freq;
      sv += cv * freq;
    }
  }

  private toIndex(degrees: number): integer {
    return (Math.floor(degrees * this.FACTOR) + this.LENGTH) % this.LENGTH;
  }

  sin(degrees: number): number {
    return this.pSin[this.toIndex(degrees)];
  }

  cos(degrees: number): number {
    return this.pCos[this.toIndex(degrees)];
  }
}
