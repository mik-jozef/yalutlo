import { Tokenizer } from 'lr-parser-typescript';


export const tokenizer = new Tokenizer(<const>[
  'identifier',
  'export',
  'import',
  'number',
  'prop',
  'text',
  'All',
  'let',
  '<->',
  '...',
  'as',
  'by',
  'Ex',
  'fn',
  'in',
  '=>',
  '->',
  '<-',
  '||',
  '&&',
  '(',')','[',']','{','}','<','>',',','.','!','@','#','$', '=', '_',
  '%','^','&','*',';',':','\'','\\','|','/','?','`','~', '+', '-',
]);

export const token = tokenizer.token.bind(tokenizer);
