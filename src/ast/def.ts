import { SyntaxTreeNode, IdentifierToken, Token, Caten, Match, Or, Repeat, Maybe } from 'lr-parser-typescript';

import { token } from './tokenizer.js';
import { Term, TermLadder } from './term.js';
import { Prop, PropLadder } from './prop.js';
import { Proof, ProofLadder, proofsEqualsDefLadder } from './proof.js';


class MaybeExport extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Maybe(
    new Match( false, 'isExported', token('export') ),
  );
}

const matchMaybeExport = new Match( false, 'isExported', MaybeExport );

export class AstPropVariable extends SyntaxTreeNode {
  isExported!: Token<'export'> | null;
  name!: IdentifierToken;
  value!: Prop;
  proof!: Proof;
  
  by!: Token<'by'> | null;
  sc!: Token<';'>;
  
  static rule = new Caten(
    matchMaybeExport,
    token('prop'),
    new Match( false, 'name', token('identifier') ),
    token('='),
    new Match( false, 'value', PropLadder ),
    new Maybe(
      new Caten(
        new Match( false, 'by', token('by') ),
        new Match( false, 'proof', ProofLadder ),
      ),
    ),
    new Match( false, 'sc', token(';') ),
  );
}

export class AstPropFunction extends SyntaxTreeNode {
  isExported!: Token<'export'> | null;
  name!: IdentifierToken;
  params!: IdentifierToken[];
  value!: Prop;
  
  static rule = new Caten(
    matchMaybeExport,
    token('prop'),
    new Match( false, 'name', token('identifier') ),
    token('('),
    new Repeat(
      new Caten(
        new Match( true, 'params', token('identifier') ),
        token(','),
      ),
      new Caten(),
      1,
    ),
    token(')'),
    token('='),
    new Match( false, 'value', PropLadder ),
    token(';'),
  );
}

export class AstSetVariable extends SyntaxTreeNode {
  isExported!: Token<'export'> | null;
  name!: IdentifierToken;
  params!: IdentifierToken[];
  value!: Term;
  
  static rule = new Caten(
    matchMaybeExport,
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

export type Def = AstPropVariable | AstPropFunction | AstSetVariable;

export class DefLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    new Match( false, 'value', AstPropVariable ),
    new Match( false, 'value', AstPropFunction ),
    new Match( false, 'value', AstSetVariable ),
  );
}

proofsEqualsDefLadder.match = DefLadder;
