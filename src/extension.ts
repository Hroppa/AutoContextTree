import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let lastKnownCommit: string | null = null;

export function activate(context: vscode.ExtensionContext) {
    console.log('Auto Tree Generator is now active');

    // Set up a periodic check for new commits
    const disposable = setInterval(async () => {
        const config = vscode.workspace.getConfiguration('autoTreeGenerator');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        try {
            await checkForNewCommit();
        } catch (err) {
            console.error('Failed to check for new commit:', err);
        }
    }, 5000); // Check every 5 seconds

    // Clean up interval on deactivation
    context.subscriptions.push({
        dispose: () => clearInterval(disposable)
    });
}

async function checkForNewCommit(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    try {
        const currentCommit = await executeCommand('git rev-parse HEAD', workspaceRoot);
        
        // If this is our first check, store the commit hash and return
        if (lastKnownCommit === null) {
            lastKnownCommit = currentCommit.trim();
            return;
        }

        // If the commit has changed, update the tree
        if (currentCommit.trim() !== lastKnownCommit) {
            lastKnownCommit = currentCommit.trim();
            await generateTree();
        }
    } catch (error) {
        // Handle error silently - workspace might not be a git repo
        console.log('Error checking commit:', error);
    }
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
    // No need for debounceTimer cleanup anymore
} 