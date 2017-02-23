/**
 * Visual Blocks Blocks
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
 * See the License for the specific Blocks governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview SEAL blocks for Blockly.
 * @author leo@selavo.com	(Leo Selavo)
 */
'use strict';

goog.provide('Blockly.Blocks.statements');

goog.require('Blockly.Blocks');

Blockly.Blocks.statements.HUE = 15;

Blockly.Blocks['seal_use'] = {
  category: 'Statements',
  init: function() {
  	this.setHelpUrl('http://mansos.net/');
    this.setColour(Blockly.Blocks.statements.HUE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);

    var dropdown = new Blockly.FieldDropdown(function() {
      return Blockly.Blocks.seal_use.RESOURCES;
    });
    
    this.appendValueInput('ARGS', Blockly.INPUT_VALUE, 'ARGS')
  		.appendField('Use')
        .appendField(dropdown, 'USE');
      
    this.setTooltip('Use or enable a resource.');
  }
};

Blockly.Blocks.seal_use.RESOURCES =
    [['RedLed', 'RedLed'],
     ['GreenLed', 'GreenLed'],
     ['BlueLed', 'BlueLed'],
     ['Led', 'Led']];

// SEAL: read <id> <param_list> ;
//-------------------------------------
Blockly.Blocks['seal_read'] = {
  category: 'Statements',
  init: function() {
  	this.setHelpUrl('http://mansos.net/');
  	this.setColour(Blockly.Blocks.statements.HUE);
  	this.setPreviousStatement(true);
  	this.setNextStatement(true);

  	var dropdown = new Blockly.FieldDropdown(function () {
  		return Blockly.Blocks.seal_read.RESOURCES;
  	});

  	this.appendValueInput('ARGS', Blockly.INPUT_VALUE, 'ARGS')
        .appendField('read')
        .appendField(dropdown, 'READ');

  	this.setTooltip('Read a resource.');
  }
};

Blockly.Blocks.seal_read.RESOURCES =
    [['ADC', 'ADC'],
     ['Light', 'Light'],
     ['Humidity', 'Humidity'],
     ['Temperature', 'Temperature']];

		 
// SEAL: output <id> <param_list> ;
//-------------------------------------
Blockly.Blocks.seal_output = {
  category: 'Statements',
  init: function () {
  	this.setHelpUrl('http://mansos.net/');
  	this.setColour(Blockly.Blocks.statements.HUE);
  	this.setPreviousStatement(true);
  	this.setNextStatement(true);

  	var dropdown = new Blockly.FieldDropdown(function () {
  		return Blockly.Blocks.seal_output.RESOURCES;
  	});

  	this.appendValueInput('ARGS', Blockly.INPUT_VALUE, 'ARGS')
        .appendField('output')
        .appendField(dropdown, 'OUTPUT');

  	this.setTooltip('Send output.');
  }
};

Blockly.Blocks.seal_output.RESOURCES =
    [['Radio', 'Radio'],
     ['Serial', 'Serial']];


Blockly.Blocks.lists_create_with = {
	category: 'Statements',
	init: function () {
		this.setHelpUrl('http://mansos.net/');
		this.setColour(Blockly.Blocks.statements.HUE);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		var value = new Blockly.FieldTextInput('Structure name', function (text) {
			Blockly.Blocks.seal_struct.RESOURCES[0] =
			[String(text), String(text)];
			return String(text);
		});
		this.appendDummyInput()
			.appendField('NetworkRead')
			.appendField(value, 'NAME');

		this.appendValueInput('ADD0');
		this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
		this.itemCount_ = 1;
	},
	mutationToDom: function (workspace) {
		var container = document.createElement('mutation');
		container.setAttribute('items', this.itemCount_);
		return container;
	},
	domToMutation: function (container) {
		for (var x = 0; x < this.itemCount_; x++) {
			this.removeInput('ADD' + x);
		}
		this.itemCount_ = window.parseInt(container.getAttribute('items'), 10);
		for (var x = 0; x < this.itemCount_; x++) {
			var input = this.appendValueInput('ADD' + x);
			if (x == 0) {
				input.appendField("");
			}
		}
		if (this.itemCount_ == 0) {
			this.appendDummyInput('EMPTY')
				.appendField("");
		}
	},
	decompose: function (workspace) {
		var containerBlock = workspace.newBlock('lists_create_with_container');
		containerBlock.initSvg();
		var connection = containerBlock.getInput('STACK').connection;
		for (var x = 0; x < this.itemCount_; x++) {
			var itemBlock = workspace.newBlock('lists_create_with_item');
			itemBlock.initSvg();
			connection.connect(itemBlock.previousConnection);
			connection = itemBlock.nextConnection;
		}
		return containerBlock;
	},
	compose: function (containerBlock) {
		// Disconnect all input blocks and remove all inputs.
		if (this.itemCount_ == 0) {
			this.removeInput('EMPTY');
		} else {
			for (var x = this.itemCount_ - 1; x >= 0; x--) {
				this.removeInput('ADD' + x);
			}
		}
		this.itemCount_ = 0;
		// Rebuild the block's inputs.
		var itemBlock = containerBlock.getInputTargetBlock('STACK');
		while (itemBlock) {
			var input = this.appendValueInput('ADD' + this.itemCount_);
			if (this.itemCount_ == 0) {
				input.appendField("");
			}
			// Reconnect any child blocks.
			if (itemBlock.valueConnection_) {
				input.connection.connect(itemBlock.valueConnection_);
			}
			this.itemCount_++;
			itemBlock = itemBlock.nextConnection &&
				itemBlock.nextConnection.targetBlock();
		}
		if (this.itemCount_ == 0) {
			this.appendDummyInput('EMPTY')
				.appendField("");
		}
	},
	saveConnections: function (containerBlock) {
		// Store a pointer to any connected child blocks.
		var itemBlock = containerBlock.getInputTargetBlock('STACK');
		var x = 0;
		while (itemBlock) {
			var input = this.getInput('ADD' + x);
			itemBlock.valueConnection_ = input && input.connection.targetConnection;
			x++;
			itemBlock = itemBlock.nextConnection &&
				itemBlock.nextConnection.targetBlock();
		}
	}
};
  
Blockly.Blocks.lists_create_with_container = {
	// Container.
	init: function () {
		this.setColour(210);
		this.appendDummyInput()
			.appendField(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TITLE_ADD);
		this.appendStatementInput('STACK');
		this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TOOLTIP);
		this.contextMenu = false;
	}
};

Blockly.Blocks.lists_create_with_item = {
	// Add items.
	init: function () {
		this.setColour(210);
		this.appendDummyInput()
			.appendField(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TITLE);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TOOLTIP);
		this.contextMenu = false;
	}
};