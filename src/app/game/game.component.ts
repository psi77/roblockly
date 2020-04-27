import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import { ArenaScene } from './arena.scene';
import { RobotAdapter } from '../models/robot.adapter';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'main' });
  } create() {
    console.log('create method');
  } preload() {
    console.log('preload method');
  } update() {
    console.log('update method');
  }
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig; constructor() {
    this.config = {
      type: Phaser.AUTO,
      title: 'BattleArena',
      parent: 'game',
      width: 400,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          fps: 60,
          gravity: { y: 0 },
          debug: true
        }
      },
      scene: [ArenaScene]
    };
  }

  createRobot(turn: integer): RobotAdapter {
    let prog = '';
    prog += 'while(true) {';
    prog += '  var n = robot.sensor();';
    prog += '  if (n === 0) {';
    prog += '    robot.rotate(-300);';
    prog += '    robot.accelerate(2, 2);';
    prog += '  } else if (n < 100) {';
    prog += '    robot.rotate(' + turn + ' * n);';
    prog += '    robot.accelerate(0, 0);';
    prog += '  } else {';
    prog += '    robot.rotate(0);';
    prog += '    robot.forward(1.0);';
    prog += '  }';
    prog += '}';

    const ra = new RobotAdapter();
    ra.compile(prog);

    return ra;
  }

  ngOnInit() {

    this.phaserGame = new Phaser.Game(this.config);
    this.phaserGame.scene.start(
      'ArenaScene',
      {
        robotAdapters: [
          this.createRobot(-1),
          this.createRobot(1)
        ]
      }
    );
  }

  restart() {
    const as = this.phaserGame.scene.getScene('ArenaScene') as ArenaScene;
    as.init(
      {
        robotAdapters: [
          this.createRobot(-1),
          this.createRobot(1)
        ]
      }
    );
    as.scene.restart();
  }
}
