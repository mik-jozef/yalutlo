import { SyntaxTreeNode, Caten, Match, Repeat } from 'lr-parser-typescript';

import { Import } from './import.js';
import { AstPropFunction, AstPropVariable, AstSetVariable, Def, DefLadder } from './def.js';


// TODO delete?
export function getModule(stn: SyntaxTreeNode): AstModule {
  for (; !(stn instanceof AstModule); stn = stn.parent) {
    if (!(stn.parent)) throw new Error('impossible');
  }
  
  return stn;
}

export class AstModule extends SyntaxTreeNode {
  imports!: Import[];
  defs!: Def[];
  
  static rule = new Caten(
    new Repeat(
      new Match( true, 'imports', Import ),
    ),
    new Repeat(
      new Match( true, 'defs', DefLadder ),
    ),
  );
}
