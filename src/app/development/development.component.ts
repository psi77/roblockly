import { Component, OnInit, ViewChild } from '@angular/core';
import { RobotAdapter } from '../models/robot.adapter';
import { GameComponent } from '../game/game.component';

@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrls: ['./development.component.css']
})
export class DevelopmentComponent implements OnInit {

  @ViewChild(GameComponent)
  gameComponent: GameComponent;

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

  restart() {
    this.gameComponent.restart();
  }

  toggleDebug() {
    this.gameComponent.toggleDebug();
  }
}
