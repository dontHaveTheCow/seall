'use strict';

goog.provide('Blockly.Seal.statements');

goog.require('Blockly.Seal');

Blockly.Seal['seal_use'] = function (block) {
	return 'Use ' + block.getFieldValue('USE') + Blockly.Seal.valueToCode(block, 'ARGS') + ';\n';
};


Blockly.Seal['seal_read'] = function (block) {
	return 'Read ' + block.getFieldValue('READ') + Blockly.Seal.valueToCode(block, 'ARGS') + ';\n';
};

Blockly.Seal['seal_output'] = function (block) {
	return 'Output ' + block.getFieldValue('OUTPUT') + Blockly.Seal.valueToCode(block, 'ARGS') + ';\n';
};

Blockly.Seal['lists_create_with'] = function (block) {
	// Create a list with any number of elements of any type.
	var code = new Array(block.itemCount_);
	for (var n = 0; n < block.itemCount_; n++) {
		code[n] = Blockly.Seal.valueToCode(block, 'ADD' + n,
			Blockly.Seal.ORDER_NONE) || 'None';
	}
	code = 'NetworkRead ' + block.getFieldValue('NAME') + '(' + code.join(', ') + ');\n';
	return [code, Blockly.Seal.ORDER_ATOMIC];
};