import { Def, AstSetVariable, AstPropVariable, AstPropFunction } from "../ast/def.js";
import { printError } from "../printError.js";
import { Module } from "./module.js";


class PropVarOverload {
  constructor(
    public ast: AstPropFunction | AstPropVariable,
  ) {}
}

export class PropVariable {
  name: string;
  overloads = new Map<number, PropVarOverload>();
  
  constructor(
    public parentScope: Module,
    ast: AstPropVariable | AstPropFunction,
  ) {
    this.name = ast.name.value;
    
    const params = ast instanceof AstPropFunction ? ast.params.length : 0;
    
    this.overloads.set(params, new PropVarOverload(ast));
  }
  
  insert(def: Def) {
    if (def instanceof AstSetVariable) {
      printError(
        this.parentScope.getModule(),
        def.name,
        'A set cannot have the same name as a prop in the same scope.\nThe prop is defined here:',
        [ ...this.overloads.values() ][0].ast.name,
      );
    }
  }
}
