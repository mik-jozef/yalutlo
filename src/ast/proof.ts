import { SyntaxTreeNode, Or } from "lr-parser-typescript";


export type Proof = never;

export class ProofLadder extends SyntaxTreeNode {
  static rule = new Or();
}
