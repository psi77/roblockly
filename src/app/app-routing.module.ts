import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './game/game.component';
import { EditorComponent } from './editor/editor.component';


const routes: Routes = [
  { path: 'game', component: GameComponent },
  { path: 'editor', component: EditorComponent },
  { path: '', redirectTo: '/game', pathMatch: 'full' },
  { path: '**', component: GameComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
