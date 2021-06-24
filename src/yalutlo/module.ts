import { AstModule } from "../ast/ast-module.js";
import { Path } from "../main.js";


type Nameable = never; // TODO prop or set.

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

export class Module {
  imports: Import[];
  defs = new Map<string, Nameable>();
  
  constructor(
    public path: Path,
    public isFolder: boolean,
    astModule: AstModule,
  ) {
    this.imports = astModule.imports.map(imp => new Import(imp.path.value, imp.as?.value || null));
    
    astModule.defs.forEach(def => {
      // TODO.
    });
  }
  
  importPaths(): string[] {
    return [];
  }
}
