Blockly.Blocks['robot_base'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Robot MI");
    this.appendStatementInput("NAME")
      .setCheck(null);
    this.setInputsInline(true);
    this.setColour(120);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.JavaScript['robot_base'] = function (block) {
  var statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
  // TODO: dunno if this works!
  var code = 'while (true) {\n';
  code = code + statements_name
  code = code + '};\n';
  return code;
};

Blockly.Blocks['sensor'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("sensor");
    this.setOutput(true, null);
    this.setColour(65);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.JavaScript['sensor'] = function (block) {
  var code = 'robot.sensor()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
}

Blockly.Blocks['forward'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Move Forward");
    this.appendValueInput("percentage")
      .setCheck("Number")
      .appendField("percentage");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.JavaScript['forward'] = function (block) {
  var value_percentage = Blockly.JavaScript.valueToCode(block, 'percentage', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'robot.forward(' + value_percentage +');\n';
  return code;
};

Blockly.Blocks['rotate'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Rotate");
    this.appendValueInput("velocity")
      .setCheck("Number")
      .appendField("velocity");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.JavaScript['rotate'] = function (block) {
  var value_velocity = Blockly.JavaScript.valueToCode(block, 'velocity', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'robot.rotate(' + value_velocity + ');\n';
  return code;
};

Blockly.Blocks['stop'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Stop");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
Blockly.JavaScript['stop'] = function (block) {
  var code = 'robot.accelerate(0, 0);\n';
  return code;
};
