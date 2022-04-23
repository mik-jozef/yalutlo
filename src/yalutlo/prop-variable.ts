import { Def, AstSetVariable, AstPropVariable, AstPropFunction } from "../ast/def.js";
import { MacroCall } from "../ast/term.js";
import { printError } from "../printError.js";
import { Module } from "./module.js";


class PropVarOverload {
  constructor(
    public variable: PropVariable,
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
    
    const paramsLength = def instanceof AstPropFunction ? def.params.length : 0;
    
    if (this.overloads.has(paramsLength)) {
      const s = paramsLength === 1 ? '' : 's';
      
      return printError(
        this.parentScope.getModule(),
        def.name,
        `A prop with ${paramsLength} parameter${s} is already declared here:`,
        this.overloads.get(paramsLength)!.ast.name,
      );
    }
    
    this.overloads.set(paramsLength, new PropVarOverload(this, def));
    
    if (paramsLength === 0) {
      if (def instanceof AstPropFunction) throw new Error('impossible');
      
      if (def.value instanceof MacroCall && def.value.name.value == 'False') {
        return printError(
          this.parentScope.getModule(),
          def.name,
          'Cannot prove \`False`\. \`False\` is 🎉 false 🎉.',
        );
      }
      
      return printError(
        this.parentScope.getModule(),
        def.name,
        'Cannot prove this proposition. Cannot prove anything at this point.',
      );
    }
  }
}
