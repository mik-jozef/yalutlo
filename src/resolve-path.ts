import { exit, Path, ProjectJson } from "./main.js";


export const extension = '.ytl';

function resolveLib(
  projectJson: ProjectJson,
  path: Path,
  pathArr: string[],
) {
  pathArr.length === 2 && exit('Cannot import `/lib`. Specify library to import.');
  
  projectJson.libs.has(pathArr[2]) || exit(`Library ${pathArr[2]} not installed.`);
  
  const lib = projectJson.libs.get(pathArr[2])!;
  
  if (pathArr.length === 3) {
    lib.defaultVersion === null
      && exit(`Library "${pathArr[2]}" does not have a default version.`);
    
    return path + '/' + lib.defaultVersion + '/-' + extension;
  }
  
  if (pathArr.length === 4) {
    lib.versions.includes(pathArr[3])
      || exit(`Library "${pathArr[2]}" version "${pathArr[3]}" not installed.`);
    
    return path + '/';
  }
  
  exit(`Cannot import internal library file "${path}".`);
}

// All paths are stored as absolute paths, eg `/aaaa/c/a.ytl`, or `/lib/foo.ytl`.
// (Or perhaps `/stlib/request.ytl`).
export function resolvePath(
  projectJson: ProjectJson,
  path: Path,
  at: Path,
  isAtFolder: boolean,
)
: Path
{
  console.log(`Resolving "${ path }" at "${ at }" (${ isAtFolder ? '' : 'not ' }a folder).`);
  
  const ret = resolvePathHelper(projectJson, path, at, isAtFolder);
  
  console.log(ret);
  
  return ret;
}

export function resolvePathHelper(
  projectJson: ProjectJson,
  path: Path,
  at: Path,
  isAtFolder: boolean,
)
: Path
{
  const atArr = at.split('/');
  const pathArr = path.split('/');
  
  if (pathArr[0] === '') {
    if (pathArr[1] === 'lib') return resolveLib(projectJson, path, pathArr);
    
    return at[1] === 'lib'
      ? '/lib/' + atArr[2] + '/' + atArr[3] + path
      : path;
  }
  
  isAtFolder || atArr.pop();
  
  pathArr.forEach(fsEntry => {
    if (fsEntry === '..') {
      atArr[1] === 'lib' && atArr.length === 4
        && exit(`Cannot escape library root. Tried to import "${path}" at "${at}"`);
      
      atArr.length === 0
        && exit(`Cannot escape project root. Tried to import "${path}" at "${at}"`)
      
      atArr.pop();
    }
    else atArr.push(fsEntry);
  });
  
  return atArr.join('/');
}
