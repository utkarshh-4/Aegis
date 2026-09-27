# World Monitor Security Toolkit

This is a separate tool that assesses a locally self-hosted copy of World Monitor.

## Getting Started

This project consists of a backend Express server and a frontend React dashboard.

### Running the Server
```bash
cd server
npm install
npm run dev
```

### Running the Client
```bash
cd client
npm install
npm run dev
```

The server runs on port 4000, and the client runs on port 5173 (or as configured by Vite).

## Demo Script

Follow this exact click-path to show judges during the live demo:

1. **Load Dashboard**: Open [http://localhost:5173](http://localhost:5173) in your browser.
2. **Click a Finding**: Click on a finding row in the table (e.g. `WM-API-001`) to open its detail modal.
3. **Show Steps to Reproduce**: Point out the numbered steps to reproduce the vulnerability within the modal.
4. **Click Run PoC Now**: Click the "Run PoC Now" button and accept the confirmation dialog (which clearly shows it targets `localhost`).
5. **Show Evidence Update**: Observe the loading spinner, the resulting success/warning toast, and point out the newly captured output in the "PoC Evidence" block.
6. **Click Export Report**: Close the modal (click the `✕` or background) and click the "Export Report" button at the top right of the dashboard.
7. **Show PDF**: A new tab will open with the formatted report. Use `Ctrl+P` (or `Cmd+P`) to open the browser's native Print-to-PDF dialog, demonstrating the styled, multi-page report.
