import { AstSetVariable, Def } from "../ast/def.js";
import { printError } from "../printError.js";
import { Module } from "./module.js";


class SetVarOverload {
  constructor(
    public variable: SetVariable,
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
    
    this.insert(ast);
  }
  
  insert(def: Def) {
    if (!(def instanceof AstSetVariable)) {
      return printError(
        this.parentScope.getModule(),
        def.name,
        'A prop cannot have the same name as a set in the same scope.\nThe set is defined here:',
        [ ...this.overloads.values() ][0].ast.name,
      );
    }
    
    if (this.overloads.has(def.params.length)) {
      const s = def.params.length === 1 ? '' : 's';
      
      return printError(
        this.parentScope.getModule(),
        def.name,
        `A set with ${def.params.length} parameter${s} is already declared here:`,
        this.overloads.get(def.params.length)!.ast.name,
      );
    }
    
    this.overloads.set(def.params.length, new SetVarOverload(this, def));
  }
}
