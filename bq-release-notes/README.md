# BigQuery Release Notes Web Application

A premium, modern web dashboard for tracking real-time Google Cloud BigQuery release updates. Built using Python Flask and Vanilla HTML/CSS/JS.

## Features
- **Real-time Feed Integration**: Fetches and parses the official BigQuery release notes XML feed dynamically.
- **Structured Grouping**: Automatically groups updates by date and parses individual items into Features, Issues, and standard updates.
- **Glassmorphism UI**: High-end visual styling with customizable indicator borders, type badges, stats bar, and micro-animations.
- **Interactive Share Modal**: Seamlessly draft, trim, and preview tweets of any update and share directly on X/Twitter via Web Intent.
- **Responsive Layout**: Designed for mobile, tablet, and desktop viewports.

## Tech Stack
- **Backend**: Python 3, Flask, XML ElementTree Parser
- **Frontend**: Plain HTML5, CSS3 Custom Properties, Vanilla JavaScript (DOM APIs)

## Local Setup

1. **Navigate to project directory**:
   ```bash
   cd bq-release-notes
   ```

2. **Create a Python Virtual Environment**:
   ```bash
   python -m venv .venv
   ```

3. **Activate the Environment**:
   - Windows PowerShell:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - Linux/macOS:
     ```bash
     source .venv/bin/activate
     ```

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the Application**:
   ```bash
   python app.py
   ```

6. **Open in Browser**: Open `http://127.0.0.1:5000` in your web browser.

## License
Licensed under the Apache 2.0 License.
