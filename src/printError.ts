import { Token } from "lr-parser-typescript";
import chalk from "chalk";

import { Module } from "./yalutlo/module";


function isEmpty(str: string): boolean {
  return !!str.match(/\s*/);
}

function printToken(module: Module, token: Token<string>) {
  let startLine = Math.max(0, token.start.line - 1);
  let endLine = Math.min(module.lines.length, token.end.line + 2);
  
  function getLine(lineIndex: number) {
    const lineStart = module.lines[lineIndex];
    const lineEnd = module.lines[lineIndex + 1];
    const line = module.src.substring(lineStart, lineEnd - 1);
    
    return { lineStart, lineEnd, line };
  }
  
  if (isEmpty(getLine(startLine).line)) startLine += 1;
  if (isEmpty(getLine(endLine).line)) endLine -= 1;
  
  for (let lineIndex = startLine; lineIndex < endLine; lineIndex += 1) {
    const { lineStart, line } = getLine(lineIndex);
    const numSize = ('' + (endLine - 1)).length + 1;
    
    console.log(chalk.red('|'), chalk.yellow((lineIndex + ':').padStart(numSize)), line);
    
    console.log(
      chalk.red('|'),
      chalk.yellow(':'.padStart(numSize)),
      [ ...line ].map((_char, i) => {
      return token.start.i <= lineStart + i && lineStart + i < token.end.i ? chalk.red('^') : ' ';
    }).join('') );
  }
}

function printMsg(msg: string) {
  console.log(
    msg
      .split('\n')
      .map(line => chalk.red('| ') + line)
      .join('\n'),
  );
}

export function printError(module: Module, ...tokenOrMsgs: (Token<string> | string)[]) {
  console.log();
  console.log(chalk.red('Error in:'), module.path);
  
  tokenOrMsgs.forEach(tom => {
    console.log(chalk.red('|'));
    
    tom instanceof Token ? printToken(module, tom) : printMsg(tom);
  });
}
