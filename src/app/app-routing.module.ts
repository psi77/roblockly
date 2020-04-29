import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './game/game.component';
import { DevelopmentComponent } from './development/development.component';


const routes: Routes = [
  { path: 'editor', component: DevelopmentComponent },
  { path: 'game', component: GameComponent },
  { path: '', redirectTo: '/editor', pathMatch: 'full' },
  { path: '**', component: GameComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
