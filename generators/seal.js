/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
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
 * @fileoverview Helper functions for generating Seal for blocks.
 * @author fraser@google.com (Neil Fraser)
 * Due to the frequency of long strings, the 80-column wrap rule need not apply
 * to language files.
 */
 'use strict';

goog.provide('Blockly.Seal');

goog.require('Blockly.Generator');

Blockly.Seal = new Blockly.Generator('Seal');
/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Seal.addReservedWords(
    // import keywords
    //http://www.cs.columbia.edu/~sedwards/classes/2014/w4115-spring/lrms/SEAL.pdf
    //for reference
    'Use,RedLed,GreenLed,BlueLed,Led,Read,ADC,Light,Humidity,Temperature,'
    +'Output,Radio,Serial,NetworkRead,None,period,on,when,end,not,and'
    +'Bool,Bit,Byte,Double,Else,Float,False,For,If,Include,Int,Interrupt,'
    +'Lock,Long,main,Object,Return,Short,String,Thread,True,Type,Uint,Ulong,'
    +'Ushort,While'
);

Blockly.Seal.ORDER_ATOMIC = 0;            // 0 "" ...
Blockly.Seal.ORDER_COLLECTION = 1;        // tuples, lists, dictionaries
Blockly.Seal.ORDER_STRING_CONVERSION = 1; // `expression...`
Blockly.Seal.ORDER_MEMBER = 2;            // . []
Blockly.Seal.ORDER_FUNCTION_CALL = 2;     // ()
Blockly.Seal.ORDER_EXPONENTIATION = 3;    // **
Blockly.Seal.ORDER_UNARY_SIGN = 4;        // + -
Blockly.Seal.ORDER_BITWISE_NOT = 4;       // ~
Blockly.Seal.ORDER_MULTIPLICATIVE = 5;    // * / // %
Blockly.Seal.ORDER_ADDITIVE = 6;          // + -
Blockly.Seal.ORDER_BITWISE_SHIFT = 7;     // << >>
Blockly.Seal.ORDER_BITWISE_AND = 8;       // &
Blockly.Seal.ORDER_BITWISE_XOR = 9;       // ^
Blockly.Seal.ORDER_BITWISE_OR = 10;       // |
Blockly.Seal.ORDER_RELATIONAL = 11;       // in, not in, is, is not,
                                            //     <, <=, >, >=, <>, !=, ==
Blockly.Seal.ORDER_LOGICAL_NOT = 12;      // not
Blockly.Seal.ORDER_LOGICAL_AND = 13;      // and
Blockly.Seal.ORDER_LOGICAL_OR = 14;       // or
Blockly.Seal.ORDER_CONDITIONAL = 15;      // if else
Blockly.Seal.ORDER_LAMBDA = 16;           // lambda
Blockly.Seal.ORDER_NONE = 99;             // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
Blockly.Seal.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [Blockly.Seal.ORDER_FUNCTION_CALL, Blockly.Seal.ORDER_MEMBER],
  // (foo())() -> foo()()
  [Blockly.Seal.ORDER_FUNCTION_CALL, Blockly.Seal.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [Blockly.Seal.ORDER_MEMBER, Blockly.Seal.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [Blockly.Seal.ORDER_MEMBER, Blockly.Seal.ORDER_FUNCTION_CALL],

  // not (not foo) -> not not foo
  [Blockly.Seal.ORDER_LOGICAL_NOT, Blockly.Seal.ORDER_LOGICAL_NOT],
  // a and (b and c) -> a and b and c
  [Blockly.Seal.ORDER_LOGICAL_AND, Blockly.Seal.ORDER_LOGICAL_AND],
  // a or (b or c) -> a or b or c
  [Blockly.Seal.ORDER_LOGICAL_OR, Blockly.Seal.ORDER_LOGICAL_OR]
];

/**
 * Initialise the database of variable names.
 */
Blockly.Seal.init = function() {
    /**
   * Empty loops or conditionals are not allowed in Seal.
   */
  Blockly.Seal.PASS = this.INDENT + 'pass\n';
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Seal.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Seal.functionNames_ = Object.create(null);

/*
This is kinda optional...
Could replace Blockly.Names(Blockly.Seal.RESERVED_WORDS_);
With Blockly.Names("");
*/
  if (!Blockly.Seal.variableDB_) {
    Blockly.Seal.variableDB_ =
        new Blockly.Names(Blockly.Seal.RESERVED_WORDS_);
  } else {
    Blockly.Seal.variableDB_.reset();
  }

  var defvars = [];
  //previously - var variables = Blockly.Variables.allVariables();
  var variables = workspace.variableList;
  for (var x = 0; x < variables.length; x++) {
    //previously - Blockly.Seal.variableDB_.getDistinctName(variables[x]
    defvars[x] = Blockly.Seal.variableDB_.getName(variables[x],
        Blockly.Variables.NAME_TYPE) + ' = None';
  }
  Blockly.Seal.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Seal.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var imports = [];
  var definitions = [];
  for (var name in Blockly.Seal.definitions_) {
    var def = Blockly.Seal.definitions_[name];
    if (def.match(/^(from\s+\S+\s+)?import\s+\S+/)) {
      imports.push(def);
    } else {
      definitions.push(def);
    }
  }
  // Clean up temporary data.
  //Three lines below added
  delete Blockly.Seal.definitions_;
  delete Blockly.Seal.functionNames_;
  Blockly.Seal.variableDB_.reset();
  var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Seal.scrubNakedValue = function(line) {
  return line + '\n';
};

/**
 * Encode a string as a properly escaped Seal string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Seal string.
 * @private
 */
Blockly.Seal.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\%/g, '\\%')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating Seal from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Seal code created for this block.
 * @return {string} Seal code with comments and subsequent blocks added.
 * @this {Blockly.CodeGenerator}
 * @private
 */
Blockly.Seal.scrub_ = function(block, code) {
  //Old seal code - commented out below
/*  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }*/

  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      //block.getProcedureDef added
      if (block.getProcedureDef) {
        // Use a comment block for function comments.
        commentCode += '"""' + comment + '\n"""\n';
      } else {
        commentCode += Blockly.Generator.prefixLines(comment, '# ') + '\n';
      }
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Seal.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Generator.prefixLines(comment, '# ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/*
  Blockly.Seal.getAdjustedInt - also an update as everything else
*/
Blockly.Seal.getAdjustedInt = function(block, atId, opt_delta, opt_negate) {
  var delta = opt_delta || 0;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  var atOrder = delta ? Blockly.Seal.ORDER_ADDITIVE :
      Blockly.Seal.ORDER_NONE;
  var at = Blockly.Seal.valueToCode(block, atId, atOrder) || defaultAtIndex;

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = parseInt(at, 10) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = 'int(' + at + ' + ' + delta + ')';
    } else if (delta < 0) {
      at = 'int(' + at + ' - ' + -delta + ')';
    } else {
      at = 'int(' + at + ')';
    }
    if (opt_negate) {
      at = '-' + at;
    }
  }
  return at;
};