// @flow
/**
 * Copilot Chat Agent System
 * Based on VS Code Copilot Chat agent architecture
 * Provides intelligent code assistance and project-aware AI interactions
 */

export type CopilotAgent = {|
  id: string,
  name: string,
  description: string,
  iconPath?: string,
  isDefault?: boolean,
  supportedCommands: Array<string>,
  invoke: (request: AgentRequest) => Promise<AgentResponse>,
|};

export type AgentRequest = {|
  prompt: string,
  command?: string,
  context: AgentContext,
  variables: { [key: string]: any },
|};

export type AgentContext = {|
  projectPath?: string,
  currentFile?: string,
  selectedCode?: string,
  cursorPosition?: {| line: number, column: number |},
  openFiles?: Array<string>,
  recentFiles?: Array<string>,
|};

export type AgentResponse = {|
  success: boolean,
  content: string,
  suggestions?: Array<CodeSuggestion>,
  followUp?: Array<string>,
  error?: string,
|};

export type CodeSuggestion = {|
  code: string,
  description: string,
  language: string,
  insertAt?: {| line: number, column: number |},
|};

/**
 * Built-in Copilot Agents
 */

/**
 * Code Generation Agent
 * Generates code based on natural language descriptions
 */
const codeGenerationAgent: CopilotAgent = {
  id: 'code-gen',
  name: 'Code Generator',
  description: 'Generates code snippets and functions from natural language',
  isDefault: true,
  supportedCommands: ['/generate', '/create', '/write'],
  invoke: async (request: AgentRequest): Promise<AgentResponse> => {
    const { prompt, context } = request;

    // Build context-aware prompt
    let enhancedPrompt = prompt;

    if (context.currentFile) {
      enhancedPrompt = `In file ${context.currentFile}:\n${prompt}`;
    }

    if (context.selectedCode) {
      enhancedPrompt = `Given this code:\n\`\`\`\n${
        context.selectedCode
      }\n\`\`\`\n\n${prompt}`;
    }

    // This would connect to the AI backend
    return {
      success: true,
      content: `Generated code for: ${enhancedPrompt}`,
      suggestions: [
        {
          code: '// Generated code would appear here',
          description: 'Code suggestion based on prompt',
          language: 'javascript',
        },
      ],
      followUp: [
        'Would you like me to explain this code?',
        'Should I add error handling?',
        'Would you like tests for this?',
      ],
    };
  },
};

/**
 * Code Explanation Agent
 * Explains existing code in natural language
 */
const codeExplanationAgent: CopilotAgent = {
  id: 'code-explain',
  name: 'Code Explainer',
  description: 'Explains code functionality in clear language',
  supportedCommands: ['/explain', '/describe', '/what'],
  invoke: async (request: AgentRequest): Promise<AgentResponse> => {
    const { prompt, context } = request;

    if (!context.selectedCode) {
      return {
        success: false,
        error: 'Please select some code to explain',
        content: '',
      };
    }

    return {
      success: true,
      content: `Explanation of the selected code:\n\nThis code ${context.selectedCode.substring(
        0,
        50
      )}...`,
      followUp: [
        'Would you like a more detailed explanation?',
        'Should I explain any specific part?',
      ],
    };
  },
};

/**
 * Bug Detection Agent
 * Identifies potential bugs and issues
 */
const bugDetectionAgent: CopilotAgent = {
  id: 'bug-detector',
  name: 'Bug Detector',
  description: 'Finds potential bugs and suggests fixes',
  supportedCommands: ['/fix', '/debug', '/bugs'],
  invoke: async (request: AgentRequest): Promise<AgentResponse> => {
    const { context } = request;

    if (!context.selectedCode && !context.currentFile) {
      return {
        success: false,
        error: 'Please select code or open a file to analyze',
        content: '',
      };
    }

    // Analyze code for common issues
    const issues: Array<string> = [];

    const selectedCode = context.selectedCode;
    if (selectedCode) {
      // Simple pattern matching for common issues
      if (selectedCode.includes('==') && !selectedCode.includes('===')) {
        issues.push('Consider using === instead of == for strict equality');
      }

      if (selectedCode.includes('var ')) {
        issues.push('Consider using const or let instead of var');
      }

      if (selectedCode.match(/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/)) {
        issues.push('Empty catch block - consider adding error handling');
      }
    }

    return {
      success: true,
      content:
        issues.length > 0
          ? `Found ${issues.length} potential issue(s):\n\n${issues
              .map((i, idx) => `${idx + 1}. ${i}`)
              .join('\n')}`
          : 'No obvious issues detected. Code looks good!',
      suggestions:
        issues.length > 0
          ? [
              {
                code: '// Fixed code would appear here',
                description: 'Suggested fix',
                language: 'javascript',
              },
            ]
          : undefined,
      followUp:
        issues.length > 0
          ? [
              'Would you like me to fix these issues?',
              'Should I explain why these are problems?',
            ]
          : undefined,
    };
  },
};

/**
 * Test Generation Agent
 * Generates unit tests for code
 */
const testGenerationAgent: CopilotAgent = {
  id: 'test-gen',
  name: 'Test Generator',
  description: 'Generates unit tests for your code',
  supportedCommands: ['/test', '/tests', '/unittest'],
  invoke: async (request: AgentRequest): Promise<AgentResponse> => {
    const { context } = request;

    if (!context.selectedCode) {
      return {
        success: false,
        error: 'Please select a function or code block to test',
        content: '',
      };
    }

    return {
      success: true,
      content: 'Generated test suite for your code:',
      suggestions: [
        {
          code: `describe('Your Function', () => {
  it('should work correctly', () => {
    // Test case
    expect(yourFunction()).toBe(expected);
  });
  
  it('should handle edge cases', () => {
    // Edge case test
  });
});`,
          description: 'Unit test suite',
          language: 'javascript',
        },
      ],
      followUp: [
        'Would you like more test cases?',
        'Should I add edge case tests?',
      ],
    };
  },
};

/**
 * Refactoring Agent
 * Suggests code improvements and refactorings
 */
const refactoringAgent: CopilotAgent = {
  id: 'refactor',
  name: 'Code Refactorer',
  description: 'Suggests improvements and refactoring opportunities',
  supportedCommands: ['/refactor', '/improve', '/optimize'],
  invoke: async (request: AgentRequest): Promise<AgentResponse> => {
    const { context } = request;

    if (!context.selectedCode) {
      return {
        success: false,
        error: 'Please select code to refactor',
        content: '',
      };
    }

    const suggestions: Array<string> = [];

    // Analyze for refactoring opportunities
    if (context.selectedCode.length > 100) {
      suggestions.push('Consider extracting parts into smaller functions');
    }

    if ((context.selectedCode.match(/if\s*\(/g) || []).length > 3) {
      suggestions.push(
        'Complex conditional logic - consider using a switch or lookup table'
      );
    }

    return {
      success: true,
      content:
        suggestions.length > 0
          ? `Refactoring suggestions:\n\n${suggestions
              .map((s, idx) => `${idx + 1}. ${s}`)
              .join('\n')}`
          : 'Code looks well-structured!',
      suggestions:
        suggestions.length > 0
          ? [
              {
                code: '// Refactored code would appear here',
                description: 'Refactored version',
                language: 'javascript',
              },
            ]
          : undefined,
      followUp: [
        'Would you like me to show the refactored code?',
        'Should I explain the benefits?',
      ],
    };
  },
};

/**
 * Documentation Agent
 * Generates documentation for code
 */
const documentationAgent: CopilotAgent = {
  id: 'docs',
  name: 'Documentation Generator',
  description: 'Generates documentation and comments',
  supportedCommands: ['/doc', '/docs', '/comment'],
  invoke: async (request: AgentRequest): Promise<AgentResponse> => {
    const { context } = request;

    if (!context.selectedCode) {
      return {
        success: false,
        error: 'Please select code to document',
        content: '',
      };
    }

    return {
      success: true,
      content: 'Generated documentation:',
      suggestions: [
        {
          code: `/**
 * Function description
 * @param {type} paramName - Parameter description
 * @returns {type} Return value description
 */`,
          description: 'JSDoc documentation',
          language: 'javascript',
        },
      ],
      followUp: [
        'Would you like examples added?',
        'Should I document edge cases?',
      ],
    };
  },
};

/**
 * Registry of all available agents
 */
export const COPILOT_AGENTS: Array<CopilotAgent> = [
  codeGenerationAgent,
  codeExplanationAgent,
  bugDetectionAgent,
  testGenerationAgent,
  refactoringAgent,
  documentationAgent,
];

/**
 * Get agent by ID
 */
export const getAgentById = (id: string): ?CopilotAgent => {
  return COPILOT_AGENTS.find(agent => agent.id === id);
};

/**
 * Get agent by command
 */
export const getAgentByCommand = (command: string): ?CopilotAgent => {
  return COPILOT_AGENTS.find(agent =>
    agent.supportedCommands.some(cmd => command.startsWith(cmd))
  );
};

/**
 * Get default agent
 */
export const getDefaultAgent = (): CopilotAgent => {
  return COPILOT_AGENTS.find(agent => agent.isDefault) || COPILOT_AGENTS[0];
};

/**
 * Parse command from user input
 */
export const parseCommand = (
  input: string
): {| command: ?string, prompt: string |} => {
  const match = input.match(/^(\/\w+)\s+(.+)$/);

  if (match) {
    return {
      command: match[1],
      prompt: match[2],
    };
  }

  return {
    command: null,
    prompt: input,
  };
};
