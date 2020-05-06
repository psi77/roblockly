import { Component, OnInit, ViewChild } from '@angular/core';
import { RobotAdapter } from '../models/robot.adapter';
import { GameComponent } from '../game/game.component';
import { DebugService } from '../debug.service';

@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrls: ['./development.component.css']
})
export class DevelopmentComponent implements OnInit {

  @ViewChild(GameComponent)
  gameComponent: GameComponent;

  robotAdapter: RobotAdapter;

  constructor(private debugService: DebugService) {
    this.robotAdapter = new RobotAdapter(debugService);
  }

  ngOnInit(): void {
  }

  codeChanged(compiledCode: string) {
    // console.log(compiledCode);
    this.robotAdapter.compile(compiledCode);
  }

  getRobotAdapters() {
    return [this.robotAdapter, new RobotAdapter(this.debugService)];
  }

  restart() {
    this.gameComponent.restart();
  }

  toggleDebug() {
    this.gameComponent.toggleDebug();
  }
}
