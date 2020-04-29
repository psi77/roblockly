import { Component, OnInit } from '@angular/core';
import { RobotAdapter } from '../models/robot.adapter';

@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrls: ['./development.component.css']
})
export class DevelopmentComponent implements OnInit {

  robotAdapter: RobotAdapter;

  constructor() {
    this.robotAdapter = new RobotAdapter();
  }

  ngOnInit(): void {
  }

  codeChanged(compiledCode: string) {
    // console.log(compiledCode);
    this.robotAdapter.compile(compiledCode);
  }

  getRobotAdapters() {
    return [this.robotAdapter];
  }
}
