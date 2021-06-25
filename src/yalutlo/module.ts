import { AstModule } from "../ast/ast-module.js";
import { AstSetVariable } from "../ast/def.js";
import { Path } from "../main.js";
import { PropVariable } from "./prop-variable.js";
import { SetVariable } from "./set-variable.js";


type Variable = PropVariable | SetVariable;

class Import {
  folder: string;
  file: string;
  base: string;
  ext: string;
  
  constructor(
    public path: string,
    public as: string | null,
  ) {
    const fileStart = path.lastIndexOf('/') + 1;
    const dot = path.lastIndexOf('.');
    
    this.folder = path.substring(0, fileStart);
    this.file = path.substring(fileStart);
    this.base = path.substring(fileStart, dot);
    this.ext = path.substring(dot + 1);
  }
}

interface Scope {
  getModule(): Module;
}

export class Module implements Scope {
  imports: Import[];
  defs = new Map<string, Variable>();
  
  // Ith line starts at `src[lines[i]]`. Contains one more entry at the end.
  lines: number[] = [];
  
  getModule() { return this }
  
  constructor(
    public path: Path,
    public isFolder: boolean,
    public ast: AstModule,
    public src: string,
  ) {
    this.imports = ast.imports.map(imp => new Import(imp.path.value, imp.as?.value || null));
    
    const lines = src.split('\n');
    
    let i = 0;
    
    lines.forEach(line => {
      this.lines.push(i);
      
      i += line.length + 1;
    });
    
    ast.defs.forEach(def => {
      if (this.defs.has(def.name.value)) {
        this.defs.get(def.name.value)!.insert(def);
      } else {
        this.defs.set(
          def.name.value,
          def instanceof AstSetVariable ? new SetVariable(this, def) : new PropVariable(this, def),
        );
      }
    });
  }
}
