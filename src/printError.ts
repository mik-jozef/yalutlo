import { Token } from "lr-parser-typescript";
import chalk from "chalk";

import { Module } from "./yalutlo/module";


function printToken(module: Module, token: Token<string>) {
  for (let lineIndex = token.start.line; lineIndex < token.end.line + 1; lineIndex += 1) {
    const lineStart = module.lines[lineIndex];
    const lineEnd = module.lines[lineIndex + 1];
    const line = module.src.substring(lineStart, lineEnd - 1);
  
    const numSize = ('' + token.end.line).length + 1;
    
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
