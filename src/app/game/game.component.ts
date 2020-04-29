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
          debug: false
        }
      },
      scene: [ArenaScene]
    };

    this.phaserGame = new Phaser.Game(config);
    this.phaserGame.scene.start(
      'ArenaScene',
      {
        robotAdapters: this.robotAdapters
      }
    );
  }

  restart() {
    const arena = this.phaserGame.scene.getScene('ArenaScene') as ArenaScene;
    arena.scene.restart();
  }

  toggleDebug() {
    (this.phaserGame.scene.getScene('ArenaScene') as ArenaScene).toggleDebug();
  }
}
