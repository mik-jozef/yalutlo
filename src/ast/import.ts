import { SyntaxTreeNode, IdentifierToken, MergedTokens, Caten, Repeat, Match, Maybe, Or } from "lr-parser-typescript";

import { token } from './tokenizer.js';


export class Import extends SyntaxTreeNode {
  path!: MergedTokens;
  as!: IdentifierToken | null;
  
  static rule = new Caten(
    token('import'),
    new Match( false, 'path',
      new Caten(
        new Or(
          token('/'),
          new Repeat(
            new Caten(
              token('.'),
              token('.'),
              token('/'),
            ),
          ),
        ),
        token('identifier'),
        new Repeat(
          new Caten(
            token('/'),
            token('identifier'),
          ),
        ),
        new Match( false, 'name', token('identifier') ),
        token('.'),
        new Match( false, 'extension', token('identifier') ),
      ),
    ),
    new Maybe(
      new Caten(
        token('as'),
        new Match(false, 'as', token('identifier') ),
      ),
    ),
    token(';'),
  );
}
