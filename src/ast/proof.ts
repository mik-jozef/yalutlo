import { SyntaxTreeNode, IdentifierToken, Or, Match, Caten, Repeat } from "lr-parser-typescript";

import { token } from "./tokenizer.js";
import { Def } from "./def.js";


const equalsProofByFunction = new Match( false, 'value', null! );
const equalsBlock = new Match( false, 'value', null! );

export const proofsEqualsDefLadder = new Match( true, 'proofs', null! );

export type Proof =
  | IdentifierToken
  | ProofByFunction
  | Block
;

export class ProofLadder extends SyntaxTreeNode {
  static hidden = true;
  
  static rule = new Or(
    new Match( false, 'value', token('identifier') ),
    equalsProofByFunction,
    equalsBlock,
  );
}

// The end of the ladder section.

class Param extends SyntaxTreeNode {
  name!: IdentifierToken;
  
  static rule = new Caten(
    new Match( false, 'name', token('identifier') ),
    token(','),
  );
}

export class ProofByFunction extends SyntaxTreeNode {
  params!: Param[];
  
  static rule = new Caten(
    token('('),
    new Repeat(
      new Match( true, 'params', Param ),
    ),
    token(')'),
    token('=>'),
    new Match( true, 'body', ProofLadder ),
  );
}

export class Block extends SyntaxTreeNode {
  proofs!: Def[];
  
  static rule = new Caten(
    token('{'),
    new Repeat(
      new Caten(
        proofsEqualsDefLadder,
        token(';'),
      ),
    ),
    token('}'),
  );
}

equalsProofByFunction.match = ProofByFunction;
equalsBlock.match = Block;
