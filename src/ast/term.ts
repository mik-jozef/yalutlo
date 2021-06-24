import { SyntaxTreeNode, MergedTokens, Caten, Or, Match, Repeat, Token, IdentifierToken } from "lr-parser-typescript";

import { token } from "./tokenizer.js";


export const equalsMacroCallOp = new Match( false, 'value', null! );

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
    equalsMacroCallOp,
    /*new Caten(
      token('('),
      equalsTermLadder,
      token(')'),
    ),*/// TODO
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
    new Repeat(
      new Caten(
        new Match( true, 'args', TermLadder ),
        token(','),
      ),
    ),
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

equalsMacroCallOp.match = MacroCall;
equalsSetLiteral.match = SetLiteral;
equalsSubstractionOp.match = SubstractionOp;
equalsIntersectionOp.match = IntersectionOp;
equalsUnionOp.match = UnionOp;

equalsTermLadder.match = TermLadder;
