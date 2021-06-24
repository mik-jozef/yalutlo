import { SyntaxTreeNode, Caten, Or, Match, Repeat, Token, IdentifierToken } from "lr-parser-typescript";

import { token } from "./tokenizer.js";
import { Term, TermLadder, MacroCall, equalsMacroCall, equalsParenthesizedMacroCall } from "./term.js";


const equalsQuantifierProp = new Match( false, 'value', null! );
const equalsInProp = new Match( false, 'value', null! );
const equalsEqProp = new Match( false, 'value', null! );
const equalsNegationProp = new Match( false, 'value', null! );
const equalsAndProp = new Match( false, 'value', null! );
const equalsOrProp = new Match( false, 'value', null! );
const equalsImplicationProp = new Match( false, 'value', null! );

const equalsPropLadder = new Match( false, 'value', null! );

export type Prop =
  | QuantifierProp
  | MacroCall
  | InProp
  | EqProp
  | NegationProp
  | AndProp
  | OrProp
  | ImplicationProp
;

export class BottomOfPropLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    equalsMacroCall,
    equalsQuantifierProp,
    equalsInProp,
    equalsEqProp,
    new Caten(
      token('('),
      new Or(
        equalsQuantifierProp,
        equalsInProp,
        equalsEqProp,
        equalsNegationProp,
        equalsAndProp,
        equalsOrProp,
        equalsImplicationProp,
      ),
      token(')'),
    ),
    equalsParenthesizedMacroCall,
  );
}

export class NegationPropLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    equalsNegationProp,
    new Match( false, 'value', BottomOfPropLadder ),
  );
}

export class AndPropLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    equalsAndProp,
    new Match( false, 'value', NegationPropLadder ),
  );
}

export class OrPropLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    equalsOrProp,
    new Match( false, 'value', AndPropLadder ),
  );
}

export class PropLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    equalsImplicationProp,
    new Match( false, 'value', OrPropLadder ),
  );
}

// The end of the ladder section.

class QuantifierParam extends SyntaxTreeNode {
  kind!: Token<'All'> | Token<'Ex'>;
  name!: IdentifierToken;
  
  static rule = new Caten(
    new Or(
      new Match( false, 'kind', token('All') ),
      new Match( false, 'kind', token('Ex') ),
    ),
    new Match( false, 'name', token('identifier') ),
    token(','),
  );
}

export class QuantifierProp extends SyntaxTreeNode {
  params!: QuantifierParam[];
  props!: Prop[];
  
  static rule = new Caten(
    new Repeat(
      new Match( true, 'params', QuantifierParam ),
      new Caten(),
      1
    ),
    token('{'),
    new Repeat(
      new Caten(
        new Match( true, 'props', PropLadder ),
        token(';'),
      ),
    ),
    token('}'),
  );
}

export class InProp extends SyntaxTreeNode {
  left!: Term;
  right!: Term;
  
  static rule = new Caten(
    new Match( false, 'left', TermLadder ),
    token('in'),
    new Match( false, 'right', TermLadder ),
  );
}

export class EqProp extends SyntaxTreeNode {
  left!: Term;
  right!: Term;
  
  static rule = new Caten(
    new Match( false, 'left', TermLadder ),
    token('='),
    new Match( false, 'right', TermLadder ),
  );
}

export class NegationProp extends SyntaxTreeNode {
  prop!: Prop;
  
  static rule = new Caten(
    token('!'),
    new Match( false, 'prop', NegationPropLadder ),
  );
}

export class AndProp extends SyntaxTreeNode {
  left!: Prop;
  right!: Prop;
  
  static rule = new Caten(
    new Match( false, 'left', AndPropLadder ),
    token('&&'),
    new Match( false, 'right', NegationPropLadder ),
  );
}

export class OrProp extends SyntaxTreeNode {
  left!: Prop;
  right!: Prop;
  
  static rule = new Caten(
    new Match( false, 'left', OrPropLadder ),
    token('||'),
    new Match( false, 'right', AndPropLadder ),
  );
}

export class ImplicationProp extends SyntaxTreeNode {
  props!: Prop[];
  ops!: Token<'->'> | Token<'<-'> | Token<'<->'>;
  
  static rule = new Repeat(
    new Match( true, 'props', OrPropLadder ),
    new Or(
      new Match( true, 'ops', token('->') ),
      new Match( true, 'ops', token('<-') ),
      new Match( true, 'ops', token('<->') ),
    ),
    2
  );
}

equalsQuantifierProp.match = QuantifierProp;
equalsInProp.match = InProp;
equalsEqProp.match = EqProp;
equalsNegationProp.match = NegationProp;
equalsAndProp.match = AndProp;
equalsOrProp.match = OrProp;
equalsImplicationProp.match = ImplicationProp;

equalsPropLadder.match = PropLadder;
