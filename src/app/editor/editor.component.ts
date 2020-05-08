import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DebugService } from '../debug.service';

declare var Blockly: any;

function movementCategory(workspace) {
  const xmlList = [];

  let bt = '<block type="forward"></block>';
  xmlList.push(Blockly.Xml.textToDom(bt));
  bt = '<block type="rotate"></block>';
  xmlList.push(Blockly.Xml.textToDom(bt));

  return xmlList;
}

function sensorCategory(workspace) {
  const xmlList = [];

  let bt = '<block type="sensor"></block>';
  xmlList.push(Blockly.Xml.textToDom(bt));
  bt = '<block type="bias"></block>';
  xmlList.push(Blockly.Xml.textToDom(bt));
  bt = '<block type="label"></block>';
  xmlList.push(Blockly.Xml.textToDom(bt));
  return xmlList;
}

function weaponsCategory(workspace) {
  const xmlList = [];

  const bt = '<block type="fire"></block>';
  xmlList.push(Blockly.Xml.textToDom(bt));
  return xmlList;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  workspace: any;

  @Output()
  compiledCode = new EventEmitter<string>();

  constructor(private http: HttpClient, private debugService: DebugService) { }

  ngOnInit() {

    // TODO: cache this somewhere so we only load it once
    this.http.get(
      'assets/toolbox.xml',
      {
        responseType: 'text'
      }
    ).subscribe(this.postInit.bind(this));
  }

  postInit(toolboxData: any) {
    this.workspace = Blockly.inject(
      document.getElementById('blocklyDiv'),
      {
        readOnly: false,
        media: 'media/',
        trashcan: true,
        move: {
          scrollbars: true,
          drag: true,
          wheel: true
        },
        toolbox: toolboxData
      // } as Blockly.BlocklyOptions
      } as any
    );
    this.workspace.registerToolboxCategoryCallback('ROBOT_MOVEMENT', movementCategory);
    this.workspace.registerToolboxCategoryCallback('ROBOT_SENSORS', sensorCategory);
    this.workspace.registerToolboxCategoryCallback('ROBOT_WEAPONS', weaponsCategory);

    // TODO: load or new
    // new
    const template = '<xml><block type="robot_base" deletable="false"></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(template), this.workspace);

    this.workspace.addChangeListener(this.codeUpdate.bind(this));
    this.workspace.addChangeListener(Blockly.Events.disableOrphans);

    this.debugService.highlightSubject.subscribe({
      next: blockId => this.highlightCode(blockId),
      error: err => console.error(`Error from debug service: ${err}`),
      complete: () => console.log('Debug service complete')
    });
  }

  highlightCode = (blockId: string) => {
    this.workspace.highlightBlock(blockId);
  }

  codeUpdate(event: any) {
    Blockly.JavaScript.STATEMENT_PREFIX = 'robot.debug(%1);\n';
    const code = Blockly.JavaScript.workspaceToCode(this.workspace);
    this.compiledCode.emit(code);
  }

  saveProgram(): void {
    // this.program.xmlData = Blockly.Xml.domToText(
    //   Blockly.Xml.workspaceToDom(this.workspace)
    // );
    // console.log('saving the program - ', JSON.stringify(this.program));
    // this.programService.upsertOne(this.program);
    // this.router.navigate(['listProgram']);
    console.log('Saving now');

    // TODO: temporarily create some code
    // TODO: seems to be guessing workspace...
    // console.log(Blockly.JavaScript.workspaceToCode(this.workspace));
  }
}
