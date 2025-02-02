# VS Code Auto Tree Generator Plugin Specification

This document outlines the requirements, design, and functionality of a VS Code extension that executes a Git-based command every time a file is saved. The command is intended to generate a list of files tracked by Git (while filtering out specific directories) and write this list to a file.

---

## 1. Overview

**Purpose**  
This extension will automatically run a shell command after every file save in the workspace. The command:
`git ls-tree -r --name-only HEAD | findstr /V /R "(vendor|public|seeds|migrate)" > Context/tree.txt`
generates a list of all files, filters out files and directories that match the provided patterns (i.e., vendor, public, seeds, migrate), and outputs the result to `Context/tree.txt`.

**Intended Users**  
Developers using Git who wish to maintain an up-to-date file list for additional tasks (e.g., code analysis, indexing, or caching) without manually running scripts. It is particularly useful for developers working with LLM coding assistants.

---

## 2. Functional Requirements

### 2.1. Activation and Trigger
- **Activation Event:**  
  The extension should activate on VS Code startup and whenever a file is saved. Use the `onDidSaveTextDocument` event to trigger the command.
  
- **Condition Check:**  
  Verify that the workspace is under Git version control before running the command.
  
### 2.2. Command Execution
- **Primary Command:**  
  Execute the following command within the workspace directory:
  ```
  git ls-tree -r --name-only HEAD | findstr /V /R "(vendor|public|seeds|migrate)" > Context/tree.txt
  ```
  
- **Execution Environment:**  
  - Use Node.js’s `child_process.exec` to run the command asynchronously.
  - Ensure the command is executed from the root of the current workspace.

### 2.3. Output Handling
- **File Output:**  
  Save the generated file list to `Context/tree.txt`.  
- **Customizable Output Path:**  
  Allow users to override the default output path through a configuration setting.

### 2.4. Filtering Patterns
- **Default Patterns:**  
  Filter out directories or files matching:
  - `vendor`
  - `public`
  - `seeds`
  - `migrate`
  
- **Custom Patterns:**  
  Provide a configuration option (`autoTreeGenerator.filterPatterns`) so users can adjust the patterns as needed.

### 2.5. Error Handling and Notifications
- **Error Capture:**  
  - Catch any errors during command execution.
  - Log errors to the VS Code output console for debugging.
  
- **User Notification:**  
  Display error messages using `window.showErrorMessage` if command execution fails.

### 2.6. Performance Considerations
- **Non-Blocking Execution:**  
  Ensure that the command runs asynchronously so that it does not freeze or slow down the editor.
  
- **Debouncing:**  
  If multiple file saves occur in rapid succession, consider debouncing the command execution to avoid queuing redundant tasks.

---

## 3. Non-Functional Requirements

- **Responsiveness:**  
  The extension should operate without noticeable delay during file saves.
  
- **Reliability:**  
  It should handle errors gracefully and not crash VS Code.
  
- **Configurability:**  
  Users must be able to enable/disable the feature and customize command parameters via the extension settings.
  
- **Portability:**  
  - By default, the command uses `findstr`, which is Windows-specific.  
  - If cross-platform support is desired, include conditional logic to use an alternative (e.g., `grep -vE` on Linux/macOS) or provide configuration documentation about the requirement.

---

## 4. Configuration Options

Add the following settings in the extension's `package.json`:

- **autoTreeGenerator.enabled** (boolean):  
  Enable or disable the automatic tree generation on file save (default: `true`).

- **autoTreeGenerator.outputFile** (string):  
  Define the file path to which the output should be written (default: `"Context/tree.txt"`).

- **autoTreeGenerator.filterPatterns** (string):  
  Patterns to filter out from the file list (default: `"(vendor|public|seeds|migrate)"`).

---

## 5. Architecture Overview

### 5.1. Main Components

1. **Activation Module (extension.ts)**  
   - Responsible for activating the extension and setting up event listeners (e.g., `onDidSaveTextDocument`).

2. **Command Executor**  
   - Uses Node’s `child_process.exec` to execute the shell command.
   - Handles passing the correct working directory.

3. **Configuration Manager**  
   - Reads and applies configuration values from VS Code settings.
   
4. **Output Handler**  
   - Writes the command output to the specified file.
   - Validates the existence of the output directory (`Context/`) or creates it if necessary.

5. **Logger and Notifier**  
   - Logs errors and status messages to the console.
   - Notifies the user through VS Code notifications.

### 5.2. Integration with VS Code API

- **Event Listeners:**  
  Use VS Code’s Workspace API to listen to document save events.
  
- **Configuration API:**  
  Use VS Code’s workspace configuration to retrieve user settings.
  
- **Notification API:**  
  Use `window.showInformationMessage` or `window.showErrorMessage` for success/error notifications.

---

## 6. Workflow Summary

1. **Initialization:**  
   - The extension activates upon startup.
   - Listens for file save events.

2. **On File Save:**  
   - The event handler checks if auto tree generation is enabled.
   - Reads configuration for command customization and output path.
   - Executes the shell command from the workspace root.
   
3. **Post Execution:**  
   - If the command runs successfully, the file `Context/tree.txt` is updated.
   - If an error occurs, it is logged and an error message is provided to the user.

4. **Debounce/Rate Limit:**  
   - Implement debounce logic to prevent overlapping executions during rapid file saves.

---

## 7. Testing Strategy

- **Unit Tests:**  
  - Test individual modules such as configuration parsing, command execution logic, and file writing functions.
  
- **Integration Tests:**  
  - Simulate file save events and check that `Context/tree.txt` is updated correctly.
  - Test behavior when errors occur (e.g., when Git is not available or the command fails).

- **Cross-Platform Tests:**  
  - On Windows, verify that `findstr` is used.
  - If alternative commands are offered for non-Windows platforms, verify those paths as well.

---

## 8. Documentation and Deployment

- **README Documentation:**  
  Provide detailed installation instructions, configuration options, troubleshooting tips, and usage examples.
  
- **Changelog:**  
  Keep an updated changelog to document new features and bug fixes.

- **Marketplace Listing:**  
  Prepare the extension for submission to the VS Code Marketplace following VS Code’s extension submission guidelines.

---

## 9. Future Enhancements

- **Manual Trigger Command:**  
  Add a command palette option to manually trigger the tree generation.
  
- **Cross-Platform Support:**  
  Automatically detect the OS and choose the appropriate filtering command.
  
- **Enhanced UI:**  
  Improve user notification, progress indication, and logging verbosity optionally through a custom status bar item.

- **Customization UI:**  
  Consider a settings UI that makes it easier for users to update patterns, output file paths, etc.

---

By following this specification, developers will have a clear roadmap for building an efficient and configurable VS Code plugin that generates a filtered tree of Git files upon every file save.

Happy coding!
