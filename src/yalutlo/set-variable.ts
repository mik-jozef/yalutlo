import { AstSetVariable, Def } from "../ast/def.js";
import { printError } from "../printError.js";
import { Module } from "./module.js";


class SetVarOverload {
  constructor(
    public ast: AstSetVariable,
  ) {}
}

export class SetVariable {
  name: string;
  overloads = new Map<number, SetVarOverload>();
  
  constructor(
    public parentScope: Module,
    ast: AstSetVariable,
  ) {
    this.name = ast.name.value;
    
    this.overloads.set(ast.params.length, new SetVarOverload(ast));
  }
  
  insert(def: Def) {
    if (!(def instanceof AstSetVariable)) {
      printError(
        this.parentScope.getModule(),
        def.name,
        'A prop cannot have the same name as a set in the same scope.\nThe set is defined here:',
        [ ...this.overloads.values() ][0].ast.name,
      );
    }
  }
}
