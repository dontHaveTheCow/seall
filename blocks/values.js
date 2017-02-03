'use strict';

goog.provide('Blockly.Blocks.values');

goog.require('Blockly.Blocks');

Blockly.Blocks.values.HUE = 15;

Blockly.Blocks['seal_number'] = {
	category: "Values",
	init: function () {
		this.setHelpUrl('http://mansos.net/');
		this.setColour(230);
		this.appendDummyInput()
			.appendField(new Blockly.FieldTextInput('0', null), 'NUM');
		this.setOutput(true, Number);
		this.setTooltip('Number_constant');
	}
};

Blockly.Blocks['seal_sensors'] = {
	category: "Values",
	init: function () {
		this.setHelpUrl('http://mansos.net/');
		this.setColour(230);
		this.setOutput(true, String);
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(Blockly.Blocks.seal_read.RESOURCES), 'VALUE');
		this.setTooltip('Type_o_sensor');
	}
};


Blockly.Blocks['seal_struct'] = {
	category: 'Values',

	init: function () {
		this.setHelpUrl('http://mansos.net/');
		this.setColour(230);
		this.setOutput(true, String);

		var value = new Blockly.FieldTextInput('Structure name', function (text) {
			return String(text);
		});
		var dropdown = new Blockly.FieldDropdown(function () {
			return Blockly.Blocks.seal_struct.RESOURCES;
		});

		this.appendValueInput('ARGS', Blockly.INPUT_VALUE, 'ARGS')
			.appendField(dropdown, 'NAME')
			.appendField('.');
	}
};

Blockly.Blocks.seal_struct.RESOURCES =
	[["No struct found", "NSF"]];
