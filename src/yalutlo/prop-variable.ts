import { Def, AstSetVariable, AstPropVariable, AstPropFunction } from "../ast/def.js";
import { Module } from "./module.js";


class PropVarOverload {
  
}

export class PropVariable {
  overloads = new Map<number, PropVarOverload>();
  
  constructor(
    module: Module,
    ast: AstPropVariable | AstPropFunction,
  ) {}
  
  insert(def: Def) {
    if (def instanceof AstSetVariable) TODO;
  }
}
