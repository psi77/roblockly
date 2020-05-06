import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  private pHighlightSubject: BehaviorSubject<string>;

  constructor() {
    this.pHighlightSubject = new BehaviorSubject(null);
  }

  get highlightSubject(): Subject<string> {
    return this.pHighlightSubject;
  }

  highlight(blockId: string) {
    this.pHighlightSubject.next(blockId);
  }
}
