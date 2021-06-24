import { SyntaxTreeNode, Caten, Match, Repeat } from 'lr-parser-typescript';

import { Import } from './import.js';
import { Def, DefLadder } from './def.js';


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
