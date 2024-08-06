# MeetMan

MeetMan is a Chrome extension designed to enhance your Google Meet experience by providing seamless real-time chat and collaboration during meetings. The extension automatically collects captions from Google Meet, allows you to interact with an API for processing the captions, and offers a user-friendly interface for various functionalities.

## Features

- **Automatic Caption Collection**: Captures captions in real-time from Google Meet and organizes them by speaker.
- **Save Captions to Firebase**: Automatically save captured captions to a Firebase database.
- **Download Captions**: Download the collected captions as a `.txt` file for later reference.
- **API Integration**: Send captured captions to a specified API for further processing and display the response in the extension.
- **User Interface**: Provides a simple and intuitive UI within the Google Meet page for interacting with the extension.

## Installation

1. Clone the repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory where you downloaded or cloned the source code.
5. The MeetMan extension should now be visible in your extensions list.

## Usage

1. **Start a Google Meet session**: The extension will automatically activate when you visit a Google Meet URL with a valid pattern (e.g., `https://meet.google.com/xxx-xxxx-xxx`).
2. **Inject Main Script**: The extension checks the URL pattern and, if valid, injects the main script to start capturing captions.
3. **Enter API Key**: Upon first use, enter a valid API key to enable full functionality. The key will be stored securely for future sessions.
4. **Interact with the UI**: Use the provided UI to ask questions, save captions, or download the caption file. The extension will provide feedback and display responses as they come in.

## File Structure

- **manifest.json**: Defines the extension's permissions, content scripts, and other configurations.
- **link_checker.js**: Checks if the current URL is a valid Google Meet link and injects the main script if it is.
- **content.js**: The main script that handles caption collection, API interactions, and user interface management.
- **README.md**: This file, providing an overview of the project.

## Permissions

- **activeTab**: Allows the extension to access the currently active tab and interact with the content on it.
- **storage**: Enables the extension to store API keys and other data locally for persistent usage.

## Web Accessible Resources

- **content.js**: This script is injected into the Google Meet page to provide the core functionality of the extension.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
