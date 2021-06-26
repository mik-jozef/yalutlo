import { promises } from 'fs';
import { exit as processExit } from "process";
import { Parser } from 'lr-parser-typescript';

import { extension, resolvePath } from './resolve-path.js';
import { AstModule } from './ast/ast-module.js';
import { tokenizer } from './ast/tokenizer.js';
import { Module } from './yalutlo/module.js';


const parser = new Parser(tokenizer, AstModule);

export function exit(msg: string, ...rest: unknown[]): never {
  console.log(msg, ...rest);
  processExit();
}

export type Path = string;

class Library {
  constructor(
    public name: string,
    public versions: string[],
    public defaultVersion: string | null,
  ) {}
}

export class ProjectJson {
  libs = new Map<string, Library>([
    [ 'stlib', new Library( 'stlib', [ '0.0.0' ], '0.0.0' ) ],
  ]);
  
  constructor(obj: Record<string, any>) {
    if (!obj.libs || typeof obj.libs !== 'object' || Array.isArray(obj.libs)) {
      exit(`In \`project.json\`, property \`libs\` is missing, or is not an object.`);
    }
    
    Object.keys(obj.libs).forEach(key => {
      this.libs.set(
        key,
        new Library(
          key,
          obj.libs[key].versions,
          obj.libs[key].defaultVersion,
        ),
      );
    });
  }
}

class Main {
  projectJson: ProjectJson | null = null;
  modules = new Map<Path, Module>();
  
  filePromises = new Map<Path, Promise<void>>();
  
  constructor(
    public outFile: string,
    public projectRoot: string,
    public mainPath: string,
  ) {
    console.log(`Project root: \`${this.projectRoot}\`.`);
    
    this.run();
  }
  
  async run() {
    await this.loadProjectJson();
    await this.load('', true, '/lib/stlib');
    await this.load('', true, this.mainPath);
    
    await this.compile();
  }
  
  async loadProjectJson(): Promise<void> {
    let obj;
    
    try {
      const file = await promises.readFile(this.projectRoot + '/project.json', 'utf8');
      
      try {
        obj = JSON.parse(file);
      } catch (e) {
        exit('Cannot parse `project.json`.');
      }
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      
      obj = {
        libs: {},
      };
    }
    
    this.projectJson = new ProjectJson(obj);
  }
  
  async load(at: Path, isAtFolder: boolean, path: Path): Promise<void> {
    path = resolvePath(this.projectJson!, path, at, isAtFolder);
    
    if (this.filePromises.has(path)) return this.filePromises.get(path);
    
    const fsPath = path.startsWith('/lib/') ? '/local' + path : path;
    
    let fulfillFn!: () => any;
    
    this.filePromises.set(path, new Promise((fulfill, _reject) => fulfillFn = fulfill));
    
    const [ moduleSource, isFolderModule ] = await (async(): Promise<[ string, boolean ]> => {
      try {
        const src = await promises.readFile(this.projectRoot + fsPath, 'utf8');
        
        fulfillFn();
        
        return [ src, false ];
      } catch (e) {
        if ( e.code === 'ENOENT' ) exit(`File \`${fsPath}\` does not exist.`);
        
        if ( e.code !== 'EISDIR' ) throw e;
        
        let src;
        
        try {
          src = await promises.readFile(this.projectRoot + fsPath + '/-.maslo', 'utf8');
        } catch (e) {console.log('asdf')
          if (e.code !== 'ENOENT') throw e;
          
          exit(`File \`${fsPath}/-.maslo\` does not exist.`);
        }
        
        fulfillFn();
        
        return [ src, true ];
      }
    })();
    
    const astModule = parser.parse(moduleSource);
    
    if (!(astModule instanceof AstModule)) {
      exit('Parse error in "' + path + '" at:', astModule);
    }
    
    const module = new Module(path, isFolderModule, astModule, moduleSource);
    
    this.modules.set(path, module);
    
    await Promise.all(module.imports.map(impt => this.load(path, isFolderModule, impt.path)));
  }
  
  async compile() {
    const out: string[] = [];
    
    console.log();
    console.log('Writing to:', this.outFile);
    await promises.writeFile(this.outFile, out.join(''));
  }
}

const defaultMain = '/main' + extension;

if ( 4 <= process.argv.length && process.argv.length < 6 ) {
  new Main( process.argv[2], process.argv[3], process.argv[4] || defaultMain );
} else {
  console.log( "Usage: `node main.js outFilePath, projectRootDir, ?mainModulePath = '" + defaultMain + "'`" );
}
