import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import { ArenaScene } from './arena.scene';

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

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
    this.phaserGame.scene.start('ArenaScene', { test: 'hello' });
  }
}
