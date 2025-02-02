# VS Code Auto Context Tree Generator

A VS Code extension that automatically generates a list of Git-tracked files in your workspace, excluding specified patterns. The list is updated every time you save a file.

## Features

- Automatically generates a tree of Git-tracked files after each commit
- Filters out specified directories and files (configurable)
- Cross-platform support (Windows and Unix-like systems)
- Debounced execution to prevent performance issues during rapid saves
- Configurable output file location

## Requirements

- Visual Studio Code 1.85.0 or higher
- Git must be installed and available in the system PATH
- The workspace must be a Git repository

## Installation

1. Download the VSIX file from the releases page
2. Open VS Code
3. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac) to open the Extensions view
4. In the Extensions view, click on the three dots menu (⋮) at the top-right
5. Select "Install from VSIX..." from the dropdown menu
6. Browse to and select the downloaded .vsix file

Alternatively, you can also install the extension by:
1. Opening VS Code
2. Opening the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Typing "Install from VSIX" and selecting that command
4. Browsing to and selecting the downloaded .vsix file

## Extension Settings

This extension contributes the following settings:

* `autoTreeGenerator.enabled`: Enable/disable automatic tree generation on file save (default: `true`)
* `autoTreeGenerator.outputFile`: Output file path for the generated tree (default: `"Context/tree.txt"`)
* `autoTreeGenerator.filterPatterns`: Patterns to filter out from the file list (default: `"(vendor|public|seeds|migrate)"`)

## Usage

1. Open a Git repository in VS Code
2. The extension will automatically activate
3. Every time you make a commit, it will generate/update the tree file
4. The tree file will be created at the configured location (default: `Context/tree.txt`)

On Windows, the `findstr` command is used for filtering. On Unix-like systems, `grep` is used instead.

## Known Issues

- The extension currently only supports the first workspace folder in multi-root workspaces.

## Release Notes

### 1.0.0

Initial release of VS Code Auto Tree Generator

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 