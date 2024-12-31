declare namespace bondage {
  export class Runner {
    yarnNodes: any;
    variables: any;
    functions: any;
    visited: any;
    load(data: any[]): void;
    setVariableStorage(storage: any): void;
    registerFunction(name: string, func): void;
    run(startNode: string): any;
    evalNodes(nodes: any[], yarnNodeData: any): any;
    handleSelections(selections: any[]): any;
    evaluateAssignment(node: any): any;
    evaluateConditional(node: any): any;
    evaluateExpressionOrLiteral(node): any;
  }

  export class Result {}

  export class TextResult extends Result {
    text: string;
    data: any;
    lineNum: number;
  }

  export class CommandResult extends Result {
    text: string;
    data: any;
    lineNum: number;
  }

  export class OptionsResult extends Result {
    options: string[];
    lineNum: number[];
    selected: number;

    select(index: number): void;
  }
}
