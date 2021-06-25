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
    
    this.insert(ast);
  }
  
  insert(def: Def) {
    if (def instanceof AstSetVariable) {
      return printError(
        this.parentScope.getModule(),
        def.name,
        'A set cannot have the same name as a prop in the same scope.\nThe prop is defined here:',
        [ ...this.overloads.values() ][0].ast.name,
      );
    }
    
    const params = def instanceof AstPropFunction ? def.params.length : 0;
    
    if (this.overloads.has(params)) {
      return printError(
        this.parentScope.getModule(),
        def.name,
        `A prop with ${params} parameters is already declared here:`,
        this.overloads.get(params)!.ast.name,
      );
    }
    
    this.overloads.set(params, new PropVarOverload(def));
  }
}
