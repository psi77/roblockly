import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import Phaser from 'phaser';
import { ArenaScene } from './arena.scene';
import { RobotAdapter } from '../models/robot.adapter';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, AfterViewInit {

  @ViewChild('gameCanvasDiv')
  gameCanvasDivElementRef: ElementRef;

  @Input()
  robotAdapters: RobotAdapter[];

  phaserGame: Phaser.Game;

  // createRobot(turn: integer): RobotAdapter {
  //   let prog = '';
  //   prog += 'while(true) {';
  //   prog += '  var n = robot.sensor();';
  //   prog += '  if (n < 100) {';
  //   prog += '    robot.rotate(' + turn + ' * n);';
  //   prog += '    robot.accelerate(0, 0);';
  //   prog += '  } else {';
  //   prog += '    robot.rotate(0);';
  //   prog += '    robot.forward(100.0);';
  //   prog += '  }';
  //   prog += '}';

  //   const ra = new RobotAdapter();
  //   ra.compile(prog);

  //   return ra;
  // }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const canvasDivElement = this.gameCanvasDivElementRef.nativeElement;
    const config = {
      type: Phaser.AUTO,
      title: 'BattleArena',
      parent: canvasDivElement,
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

    this.phaserGame = new Phaser.Game(config);
    this.phaserGame.scene.start(
      'ArenaScene',
      {
        // robotAdapters: [
        //   this.createRobot(-1),
        //   this.createRobot(1)
        // ]
        robotAdapters: this.robotAdapters
      }
    );
  }

  restart() {
    const arena = this.phaserGame.scene.getScene('ArenaScene') as ArenaScene;
    // arena.init(
    //   {
    //     robotAdapters: [
    //       this.createRobot(-1),
    //       this.createRobot(1)
    //     ]
    //   }
    // );
    arena.scene.restart();
  }
}
