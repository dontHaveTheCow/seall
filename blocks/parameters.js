/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/google-blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview SEAL blocks for Blockly.
 * @author leo@selavo.com	(Leo Selavo)
 */

'use strict';

goog.provide('Blockly.Blocks.parameters');

goog.require('Blockly.Blocks');

Blockly.Blocks.parameters.HUE = 210;

Blockly.Blocks['seal_period'] = {
  //Might have to remove this category bbbbshit
  category: 'Parameters',
  init: function () {
    this.setHelpUrl('http://mansos.net/');
  	this.setColour(Blockly.Blocks.parameters.HUE);
    //Set output might need second parameter e.g. 'Number'
  	this.setOutput(true);

    var dropdown = new Blockly.FieldDropdown(function() {
      return Blockly.Blocks.seal_period.TIME;
    });
    dropdown.setValue("s");
    var value = new Blockly.FieldTextInput('1', function(text) {
      var n = window.parseFloat(text || 0);
      return window.isNaN(n) ? null : String(n);
    });

    this.appendValueInput('ARGS', Blockly.INPUT_VALUE, 'ARGS')
        .appendField('period')
        .appendField(value, 'NUM')
  		.appendField(dropdown, 'PERIOD');
  }
};

Blockly.Blocks.seal_period.TIME =
    [['ms', 'ms'],
     ['s', 's']];
 
Blockly.Blocks.seal_state = {
	// Boolean data type: true and false.
	category: "Parameters",
	init: function () {
    this.setHelpUrl('http://mansos.net/');
		this.setColour(Blockly.Blocks.parameters.HUE);
		this.setOutput(true, String);
		this.appendValueInput('ARGS', Blockly.INPUT_VALUE, 'ARGS')
			.appendField(new Blockly.FieldDropdown(this.OPERATORS), 'BOOL');
      //Might have to change to Blockly.LANG_LOGIC_BOOLEAN_TOOLTIP_1
		this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
	}
};

Blockly.Blocks.seal_state.OPERATORS =
    [['On', 'On'],
     ['Off', 'Off']];