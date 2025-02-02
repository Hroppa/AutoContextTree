import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let debounceTimer: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Auto Tree Generator is now active');

    // Register the save event handler
    const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
        const config = vscode.workspace.getConfiguration('autoTreeGenerator');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        // Debounce the tree generation
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            generateTree().catch(err => {
                vscode.window.showErrorMessage(`Failed to generate tree: ${err.message}`);
            });
        }, 1000); // Wait 1 second after the last save
    });

    context.subscriptions.push(disposable);
}

async function generateTree(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder is open');
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const config = vscode.workspace.getConfiguration('autoTreeGenerator');
    const outputFile = config.get<string>('outputFile', 'Context/tree.txt');
    const filterPatterns = config.get<string>('filterPatterns', '(vendor|public|seeds|migrate)');
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(path.join(workspaceRoot, outputFile));
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if git is available
    try {
        await executeCommand('git --version', workspaceRoot);
    } catch (error) {
        throw new Error('Git is not available in this workspace');
    }

    // Check if the workspace is a git repository
    try {
        await executeCommand('git rev-parse --git-dir', workspaceRoot);
    } catch (error) {
        throw new Error('This workspace is not a Git repository');
    }

    // Generate the tree based on the operating system
    const isWindows = process.platform === 'win32';
    const command = isWindows
        ? `git ls-tree -r --name-only HEAD | findstr /V /R "${filterPatterns}" > "${outputFile}"`
        : `git ls-tree -r --name-only HEAD | grep -vE "${filterPatterns}" > "${outputFile}"`;

    try {
        await executeCommand(command, workspaceRoot);
        console.log('Tree file generated successfully');
    } catch (error) {
        throw new Error(`Failed to generate tree: ${error}`);
    }
}

function executeCommand(command: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cp.exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
                return;
            }
            resolve(stdout);
        });
    });
}

export function deactivate() {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
} 