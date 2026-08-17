import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('uriel-snips.openToolkit', async () => {
      const choice = await vscode.window.showQuickPick(
        [
          { label: 'Writing snippets', language: 'uriel' },
          { label: 'AI session snippets', language: 'ais' },
          { label: 'Markdown authoring snippets', language: 'markdown' },
        ],
        { placeHolder: 'Choose the Uriel Snips toolkit' },
      );
      if (choice) await vscode.commands.executeCommand('workbench.action.quickOpen');
    }),
  );
}

export function deactivate(): void {}
