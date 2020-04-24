import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import { WelcomeScene } from './welcomeScene';
import { GameScene } from './gameScene';
import { ScoreScene } from './scoreScene';

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
      title: 'Starfall',
      width: 800,
      height: 600,
      parent: 'game',
      scene: [WelcomeScene, GameScene, ScoreScene],
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
      backgroundColor: '#000033'
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
  }
}
