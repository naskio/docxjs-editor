/**
 * The worker receives a message with the user's code and returns a message with the Blob or an error.
 * We use a Web Worker to run the user's code in a separate thread and avoid blocking the main thread.
 */

import * as docx from 'docx';

async function buildDocx(code: string): Promise<Blob> {
  // we expect code that contains a single function: function generateDocument(): docx.Document { ... }
  const trimmedCode = code.trim();
  const codeWithoutImportAndExportStatements = trimmedCode
    .split('\n')
    .filter((line) => !line.startsWith('import '))
    .filter((line) => !line.startsWith('export '))
    .join('\n');
  const codeStrictMode = `"use strict";\n${codeWithoutImportAndExportStatements}`;
  const codeWithReturnFunctionInvocation = `${codeStrictMode}\nreturn generateDocument();\n`;
  const userFunction = new Function('docx', codeWithReturnFunctionInvocation);
  const doc = userFunction(docx);
  if (!(doc instanceof docx.Document)) {
    throw new Error(
      'The function generateDocument should return a docx.Document instance'
    );
  }
  return await docx.Packer.toBlob(doc);
}

self.onmessage = (event: MessageEvent<{ name: string; text: string }>) => {
  const { name, text } = event.data;
  buildDocx(text)
    .then((blob) => {
      self.postMessage({ status: 'success', name, payload: blob });
    })
    .catch((error) => {
      self.postMessage({ status: 'error', name, payload: error });
    });
};
