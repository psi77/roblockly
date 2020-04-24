import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './game/game.component';


const routes: Routes = [
  { path: 'game', component: GameComponent },
  { path: '', redirectTo: '/game', pathMatch: 'full' },
  { path: '**', component: GameComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
