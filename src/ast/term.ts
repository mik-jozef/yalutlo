import { SyntaxTreeNode, MergedTokens, Caten, Or, Match, Repeat, Token, IdentifierToken, Maybe } from "lr-parser-typescript";

import { token } from "./tokenizer.js";


export const equalsMacroCall = new Match( false, 'value', null! );
export const equalsParenthesizedMacroCall = new Match( false, 'value', null! );

const equalsSetLiteral = new Match( false, 'value', null! );
const equalsSubstractionOp = new Match( false, 'value', null! );
const equalsIntersectionOp = new Match( false, 'value', null! );
const equalsUnionOp = new Match( false, 'value', null! );

const equalsTermLadder = new Match( false, 'value', null! );


export type Term =
  | SetLiteral
  | MacroCall
  | SubstractionOp
  | IntersectionOp
  | UnionOp
;

export class BottomOfTermLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    equalsSetLiteral,
    equalsMacroCall,
    new Caten(
      token('('),
      new Or(
        equalsSetLiteral,
        equalsSubstractionOp,
        equalsIntersectionOp,
        equalsUnionOp,
      ),
      token(')'),
    ),
    equalsParenthesizedMacroCall,
  );
}

export class IntersectionOpLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    equalsIntersectionOp,
    new Match( false, 'value', BottomOfTermLadder ),
  );
}

export class UnionOpLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    equalsUnionOp,
    new Match( false, 'value', IntersectionOpLadder ),
  );
}

export class TermLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    equalsSubstractionOp,
    new Match( false, 'value', UnionOpLadder ),
  );
}

// The end of the ladder section.

// A macro can also be a prop. I'd make a separate symbol for a prop macro
// if it didn't create a grammar conflict.
export class MacroCall extends SyntaxTreeNode {
  name!: IdentifierToken;
  args!: Term[];
  
  static rule = new Caten(
    new Match( false, 'name', token('identifier') ),
    new Maybe(
      new Caten(
        token('('),
        new Repeat(
          new Caten(
            new Match( true, 'args', TermLadder ),
            token(','),
          ),
        ),
        token(')'),
      ),
    ),
  );
}

export class ParenthesizedMacroCall extends SyntaxTreeNode {
  name!: IdentifierToken;
  args!: Term[];
  
  static rule = new Caten(
    token('('),
    new Match( false, 'value', MacroCall ),
    token(')'),
  );
}

export class SetLiteral extends SyntaxTreeNode {
  expanded!: (Token<'...'> | MergedTokens)[];
  elements!: Term[];
  
  static rule = new Caten(
    token('{'),
    new Repeat(
      new Caten(
        new Or(
          new Match( true, 'expanded', token('...') ),
          new Match( true, 'expanded', new Caten() ),
        ),
        new Match( true, 'elements', TermLadder ),
      ),
      token(','),
    ),
    token('}'),
  );
}

export class SubstractionOp extends SyntaxTreeNode {
  left!: Term;
  right!: Term;
  
  static rule = new Caten(
    new Match( false, 'left', BottomOfTermLadder ),
    token('-'),
    new Match( false, 'right', BottomOfTermLadder ),
  );
}

export class IntersectionOp extends SyntaxTreeNode {
  left!: Term;
  right!: Term;
  
  static rule = new Caten(
    new Match( false, 'left', IntersectionOpLadder ),
    token('&'),
    new Match( false, 'right', BottomOfTermLadder ),
  );
}

export class UnionOp extends SyntaxTreeNode {
  left!: Term;
  right!: Term;
  
  static rule = new Caten(
    new Match( false, 'left', UnionOpLadder ),
    token('|'),
    new Match( false, 'right', IntersectionOpLadder ),
  );
}

// The end of the ladder section.

equalsMacroCall.match = MacroCall;
equalsParenthesizedMacroCall.match = ParenthesizedMacroCall;

equalsSetLiteral.match = SetLiteral;
equalsSubstractionOp.match = SubstractionOp;
equalsIntersectionOp.match = IntersectionOp;
equalsUnionOp.match = UnionOp;

equalsTermLadder.match = TermLadder;
