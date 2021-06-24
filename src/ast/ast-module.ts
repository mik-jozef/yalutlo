import { SyntaxTreeNode, Caten, Match, Or, Repeat, IdentifierToken, Maybe } from 'lr-parser-typescript';

import { token } from './tokenizer.js';
import { Import } from './import.js';
import { Term, TermLadder } from './term.js';
import { Prop, PropLadder } from './prop.js';


class PropVariable extends SyntaxTreeNode {
  name!: IdentifierToken;
  params!: IdentifierToken[];
  value!: Prop;
  
  static rule = new Caten(
    token('prop'),
    new Match( false, 'name', token('identifier') ),
    new Maybe(
      new Caten(
        token('('),
        new Repeat(
          new Caten(
            new Match( true, 'params', token('identifier') ),
            token(','),
          ),
        ),
        token(')'),
      ),
    ),
    token('='),
    new Match( false, 'value', PropLadder ),
    token(';'),
  );
}

class SetVariable extends SyntaxTreeNode {
  name!: IdentifierToken;
  params!: IdentifierToken[];
  value!: Term;
  
  static rule = new Caten(
    token('let'),
    new Match( false, 'name', token('identifier') ),
    new Maybe(
      new Caten(
        token('('),
        new Repeat(
          new Caten(
            new Match( true, 'params', token('identifier') ),
            token(','),
          ),
        ),
        token(')'),
      ),
    ),
    token('='),
    new Match( false, 'value', TermLadder ),
    token(';'),
  );
}

export class AstModule extends SyntaxTreeNode {
  imports!: Import[];
  defs!: (PropVariable | SetVariable)[];
  
  static rule = new Caten(
    new Repeat(
      new Match( true, 'imports', Import ),
    ),
    new Repeat(
      new Or(
        new Match( true, 'defs', PropVariable ),
        new Match( true, 'defs', SetVariable ),
      ),
    ),
  );
}
