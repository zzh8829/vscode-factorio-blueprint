import * as vscode from "vscode";
import { reverseTransform, transformBlueprint } from "./blueprintUtils";

export function activate(context: vscode.ExtensionContext) {
  let importDisposable = vscode.commands.registerCommand(
    "factorio-blueprint.importBlueprint",
    async () => {
      try {
        // Get input from user
        const input = await vscode.window.showInputBox({
          prompt: "Enter blueprint string",
          placeHolder: "Paste your blueprint string here",
        });

        if (!input) {
          return;
        }

        // Transform the input
        const transformed = transformBlueprint(input);

        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          // Replace the entire content of the file
          const fullRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(editor.document.getText().length)
          );

          await editor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(fullRange, transformed);
          });
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to import blueprint: ${error}`);
      }
    }
  );

  let exportDisposable = vscode.commands.registerCommand(
    "factorio-blueprint.exportBlueprint",
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const text = editor.document.getText();
          const transformed = reverseTransform(text);

          // Copy to clipboard
          await vscode.env.clipboard.writeText(transformed);
          vscode.window.showInformationMessage(
            "Blueprint copied to clipboard!"
          );
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to export blueprint: ${error}`);
      }
    }
  );

  context.subscriptions.push(importDisposable, exportDisposable);
}

export function deactivate() {}
