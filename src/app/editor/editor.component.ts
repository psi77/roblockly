import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare var Blockly: any;

function movementCategory(workspace) {
  const xmlList = [];

  let bt = '<block type="forward"></block>';
  xmlList.push(Blockly.Xml.textToDom(bt));
  bt = '<block type="rotate"></block>';
  xmlList.push(Blockly.Xml.textToDom(bt));
  bt = '<block type="stop"></block>';
  xmlList.push(Blockly.Xml.textToDom(bt));

  return xmlList;
}

function sensorCategory(workspace) {
  const xmlList = [];

  const bt = '<block type="sensor"></block>';
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

  constructor(private http: HttpClient) { }

  ngOnInit() {

    // const xmlDoc = document.implementation.createDocument('', '', null);
    // const root = xmlDoc.createElement('xml');
    // const b1 = xmlDoc.createElement('block');
    // b1.setAttribute('type', 'controls_if');
    // root.appendChild(b1);
    // then use root.outerHTML

    // TODO: cache this somewhere so we only load it once
    this.http.get(
      'assets/toolbox.xml',
      {
        responseType: 'text'
      }
    ).subscribe(this.postInit);
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

    // TODO: load or new
    // new
    const template = '<xml><block type="robot_base" deletable="false"></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(template), this.workspace);

    this.workspace.addChangeListener(Blockly.Events.disableOrphans);
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
    console.log(Blockly.JavaScript.workspaceToCode(this.workspace));
  }
}
