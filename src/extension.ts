/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";

import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let previewUri = vscode.Uri.parse("caniuse-preview://authority/caniuse-preview");

  class TextDocumentContentProvider
    implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    public provideTextDocumentContent(uri: vscode.Uri): string {
      let editor = vscode.window.activeTextEditor;
      let document = editor.document;
      let selection = editor.selection;
      const selectedText = document.getText(selection).trim() ;
    
      return `
      <body style="margin:0px;padding:0px;overflow:hidden">
        <a target="_blank" href="https://caniuse.com/#search=${selectedText}">Open in browser</a>
				<iframe src="https://caniuse.com/#search=${selectedText}" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:50px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe>
			</body>`;
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
      return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
      this._onDidChange.fire(uri);
    }

  }

  let provider = new TextDocumentContentProvider();
  let registration = vscode.workspace.registerTextDocumentContentProvider(
    "caniuse-preview",
    provider
  );

  vscode.workspace.onDidChangeTextDocument(
    (e: vscode.TextDocumentChangeEvent) => {
      if (e.document === vscode.window.activeTextEditor.document) {
        provider.update(previewUri);
      }
    }
  );

  vscode.window.onDidChangeTextEditorSelection(
    (e: vscode.TextEditorSelectionChangeEvent) => {
      if (e.textEditor === vscode.window.activeTextEditor) {
        provider.update(previewUri);
      }
    }
  );

  let disposable = vscode.commands.registerCommand(
    "extension.caniusePreview",
    () => {
      return vscode.commands
        .executeCommand(
          "vscode.previewHtml",
          previewUri,
          vscode.ViewColumn.Two,
          "Can I Use ?"
        )
        .then(
          success => {},
          reason => {
            vscode.window.showErrorMessage(reason);
          }
        );
    }
  );

  let highlight = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(200,200,200,.35)"
  });

  context.subscriptions.push(disposable, registration);
}
