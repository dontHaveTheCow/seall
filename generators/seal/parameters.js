'use strict';

goog.provide('Blockly.Seal.parameters');
goog.require('Blockly.Seal');

Blockly.Seal['seal_period'] = function (block) {
	return [', period ' + block.getFieldValue('NUM').toLowerCase() + block.getFieldValue('PERIOD') + Blockly.Seal.valueToCode(block, 'ARGS')];
};

Blockly.Seal['seal_state'] = function (block) {
	return [', ' + block.getFieldValue('BOOL').toLowerCase() +  Blockly.Seal.valueToCode(block, 'ARGS')];
};