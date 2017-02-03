'use strict';

goog.provide('Blockly.Seal.values');

goog.require('Blockly.Seal');

Blockly.Seal['seal_number'] = function (block) {
	// Numeric value.
	var code = window.parseFloat(block.getFieldValue('NUM'));
	return [code, Blockly.Seal.ORDER_UNARY_SIGN];
};

Blockly.Seal['seal_sensors'] = function (block) {
	return [block.getFieldValue('VALUE')];
};

Blockly.Seal['seal_struct'] = function (block) {
	return [block.getFieldValue('NAME') + "." + Blockly.Seal.valueToCode(block, 'ARGS')];
};
