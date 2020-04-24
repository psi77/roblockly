import { Component, OnInit } from '@angular/core';
import * as Blockly from 'blockly';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  workspace: any;

  constructor() { }

  ngOnInit() {
    this.workspace = Blockly.inject(
      document.getElementById('blocklyDiv'),
      {
        readOnly: false,
        // media: 'media/',
        trashcan: true,
        move: {
          scrollbars: true,
          drag: true,
          wheel: true
        },
        toolbox: document.getElementById('toolbox')
      } as Blockly.BlocklyOptions
    );
  }


  saveProgram(): void {
    // this.program.xmlData = Blockly.Xml.domToText(
    //   Blockly.Xml.workspaceToDom(this.workspace)
    // );
    // console.log('saving the program - ', JSON.stringify(this.program));
    // this.programService.upsertOne(this.program);
    // this.router.navigate(['listProgram']);
    console.log('Saving now');
  }
}
