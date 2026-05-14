# 🚀 Trae Account Manager

<div align="center">

![Trae Account Manager](https://img.shields.io/badge/Trae-Account%20Manager-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**A powerful multi-account management tool for Trae IDE**

[Features](#-features) • [Quick Start](#-quick-start) • [User Guide](#-user-guide) • [FAQ](#-faq) • [Contribution](#-contribution)

</div>

---

## ⭐ Star this repository ⭐

> If this project helps you, please don't hesitate to give it a Star ⭐
> Your support is my greatest motivation for continuous updates! 💪

<div align="center">

### 👆 Click the Star button in the top right corner to support! 👆

</div>

---

## 📖 Introduction

Trae Account Manager is a multi-account management tool specially built for Trae IDE users. Through this tool, you can easily manage multiple Trae accounts, switch accounts with one click, and view usage in real-time, making your Trae IDE experience more convenient and efficient!

### 🎯 Why choose Trae Account Manager?

- 🔄 **One-click account switching** - Automatically closes Trae IDE, switches accounts, and restarts it
- 📊 **Real-time usage monitoring** - Check Token usage for each account at any time
- 🎨 **Modern interface** - Clean and beautiful UI with smooth operation
- 🔒 **Safe and reliable** - Local storage ensures data security
- ⚡ **Efficient and convenient** - Supports batch import/export for quick management
- 🛠️ **Rich features** - Machine ID management, usage record queries, and account details

---

## ⚠️ Disclaimer

<div align="center">

### 📢 Important Notice: Please read carefully

</div>

> **This tool is for learning and technical research purposes only. Please understand the following before use:**

- ⚠️ **Risk Assumption**: Users assume all risks, including but not limited to system damage, data loss, account anomalies, etc.
- ⚖️ **Legal Risk**: This tool may violate software usage agreements. Please assess legal risks yourself.
- 🚫 **Liability Waiver**: The author assumes no responsibility for any direct or indirect losses.
- 📚 **Usage Restrictions**: Personal research only, strictly prohibited for commercial use.
- 🔒 **Authorization Statement**: Must not be used to bypass software authorization mechanisms.
- ✅ **Agreement to Terms**: Continued use indicates you understand and agree to assume the corresponding risks.

<div align="center">

**⚠️ If you do not agree to the above terms, please stop using this tool immediately ⚠️**

</div>

---

## ✨ Features

### 🎭 Account Management

- ✅ **Add Account**
  - Add accounts via Token
  - Automatically fetch account info (Email, Username, Avatar, etc.)
  - Automatically bind Machine ID

- ✅ **Account Switching**
  - Switch to a specific account with one click
  - Automatically closes Trae IDE
  - Clears old login status
  - Writes new account info
  - Automatically restarts Trae IDE
  - Confirmation dialog before switching

- ✅ **Account Information**
  - Displays Email and Username
  - Displays account status (Normal/Abnormal)
  - Displays account type (Gift/Regular)
  - Shows the currently active account
  - Shows when the account was added

- ✅ **Account Operations**
  - View detailed account info
  - Update account Token
  - Delete account
  - Copy account info

### 📊 Usage Monitoring

- ✅ **Real-time Usage**
  - Displays today's usage
  - Displays total usage
  - Displays remaining quota
  - Visual progress bar for usage

- ✅ **Usage Records**
  - View detailed usage events
  - Filter by time range
  - Displays Token count for each use
  - Displays usage time and model info

### 🔧 Machine ID Management

- ✅ **Trae IDE Machine ID**
  - View current Trae IDE Machine ID
  - Copy Machine ID to clipboard
  - Refresh Machine ID
  - Clear Trae IDE login status
  - Reset Machine ID

- ✅ **Account Machine ID Binding**
  - Each account has an independent bound Machine ID
  - Automatically updates Machine ID when switching accounts
  - Supports manual binding of Machine ID

### ⚙️ System Settings

- ✅ **Trae IDE Path Configuration**
  - Automatically scan Trae IDE installation path
  - Manually select `Trae.exe` file
  - Save path configuration
  - Automatically open Trae IDE after switching

- ✅ **Data Management**
  - Export all account data as JSON
  - Import accounts from JSON files
  - Clear all account data

### 🎨 Interface Features

- ✅ **Modern Design**
  - Clean and beautiful card-based layout
  - Smooth animation effects
  - Responsive design

- ✅ **Interaction Experience**
  - Toast message notifications
  - Confirmation dialogs
  - Loading state indicators
  - Context menu support

---

## 🚀 Quick Start

### 📋 System Requirements

- Windows 10/11
- Trae IDE installed
- Node.js 16+ (Development environment)

### 📥 Download and Install

1. Go to the [Releases](https://github.com/Yang-505/Trae-Account-Manager/releases) page
2. Download the latest installer
3. Run the installer
4. Launch Trae Account Manager

### 🔨 Build from Source

```bash
# Clone the repository
git clone https://github.com/Yang-505/Trae-Account-Manager.git
cd Trae-Account-Manager

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build production version
npm run tauri build
```

---

## 📚 User Guide

### 1️⃣ First Time Use

#### Configure Trae IDE Path

1. Open the app and click **Settings** in the left menu.
2. In the "Trae IDE Path" section:
   - Click **Auto Scan**, the system will automatically find Trae IDE.
   - Or click **Manual Set** to choose the `Trae.exe` file location.
3. Once configured, the full path will be displayed.

### 2️⃣ Adding an Account

#### Method 1: Add via Token

1. Click the **Add Account** button in the top right.
2. Enter your Trae IDE Token.
3. Click **Add**.
4. The system will fetch and save account info automatically.

#### How to get the Token

1. Open Trae IDE.
2. Press `F12` to open Developer Tools.
3. Switch to the `Application` tab.
4. On the left, find `Local Storage` → `vscode-webview://xxx`.
5. Find the key containing `iCubeAuthInfo`.
6. Copy the `token` value.

### 3️⃣ Switching Accounts

1. Find the account you want to switch to in the list.
2. Click the **Switch** button on the account card.
3. Click **OK** in the confirmation dialog.
4. The system will automatically:
   - Close the running Trae IDE
   - Clear old login status
   - Write new login info
   - Restart Trae IDE

> ⚠️ **Note**: Please save your work in Trae IDE before switching.

### 4️⃣ Viewing Usage

#### Overview

- View usage overviews for all accounts on the dashboard.
- Each account card shows:
  - Today's usage
  - Total usage
  - Usage progress bar

#### Detailed Records

1. Click the **Details** button on an account card.
2. Switch to the **Usage Records** tab.
3. You can see:
   - Time of each use
   - Tokens used
   - Model used
   - Request type

### 5️⃣ Managing Machine ID

#### View Trae IDE Machine ID

1. Go to the **Settings** page.
2. See the current Machine ID in the "Trae IDE Machine ID" section.
3. Click **Copy** to copy it to the clipboard.

#### Clear Login Status

1. Click **Clear Login Status** in the settings page.
2. Confirm the operation.
3. The system will:
   - Reset Trae IDE Machine ID
   - Clear all login info
   - Delete local cache data

> ⚠️ **Note**: After clearing, Trae IDE will be in a fresh state and require re-login.

### 6️⃣ Data Import/Export

#### Export Account Data

1. Go to the **Settings** page.
2. Click **Export** in the "Data Management" section.
3. Choose a save location.
4. All data will be exported as a JSON file.

#### Import Account Data

1. Go to the **Settings** page.
2. Click **Import** in the "Data Management" section.
3. Select a previously exported JSON file.
4. Account data will be imported into the application.

---

## 🎯 Use Cases

### Scenario 1: Multi-account Rotation

If you have multiple Trae accounts, use this tool to switch quickly and maximize your daily quotas.

### Scenario 2: Team Collaboration

Team members can export their account configurations to share with others for quick environment setup.

### Scenario 3: Usage Monitoring

Monitor usage for each account in real-time to allocate quotas reasonably and avoid overages.

### Scenario 4: Testing Different Accounts

Developers can quickly switch between accounts to test features under different permissions.

---

## ❓ FAQ

### Q1: Trae IDE didn't open automatically after switching?

**A:** Please check:
1. Ensure the correct Trae IDE path is configured in settings.
2. Confirm `Trae.exe` exists and is executable.
3. Check application logs for error messages.

### Q2: Token invalid when adding an account?

**A:** Please confirm:
1. The Token was copied correctly (no extra spaces/newlines).
2. The Token hasn't expired.
3. Your network connection is stable.

### Q3: Trae IDE still shows the old account after switching?

**A:** This is rare. Try:
1. Manually closing Trae IDE.
2. Clicking "Clear Login Status" in settings.
3. Switching accounts again.

### Q4: How do I back up my account data?

**A:**
1. Go to settings.
2. Click "Export Data".
3. Save the JSON file securely.
4. Use "Import Data" to restore.

### Q5: Where is application data stored?

**A:**
- Windows: `%APPDATA%\com.sauce.trae-auto\`
- Contains account info, configurations, etc.

### Q6: Is macOS supported?

**A:**
Currently Windows only. macOS version is under development!

> Note: Trae IDE officially supports Windows and macOS, but not Linux.

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **CSS3** - Styling

### Backend

- **Tauri 2** - Desktop App Framework
- **Rust** - Backend Logic
- **Tokio** - Async Runtime
- **Reqwest** - HTTP Client
- **Serde** - Serialization/Deserialization

### Functional Modules

- **Account Management** - Storage and switching
- **API Client** - Interaction with Trae API
- **Machine ID Management** - Windows Registry operations
- **File System** - Trae IDE config file operations
- **Process Management** - Trae IDE process control

---

## 📁 Project Structure

```
Trae-Account-Manager/
├── src/                      # Frontend Source
│   ├── components/          # React Components
│   │   ├── AccountCard.tsx      # Account Card
│   │   ├── AddAccountModal.tsx  # Add Account Modal
│   │   ├── ConfirmModal.tsx     # Confirmation Dialog
│   │   ├── DetailModal.tsx      # Details Modal
│   │   └── ...
│   ├── pages/               # Page Components
│   │   ├── Dashboard.tsx        # Dashboard
│   │   ├── Settings.tsx         # Settings Page
│   │   └── About.tsx            # About Page
│   ├── api.ts               # API Interface
│   ├── types/               # TS Type Definitions
│   └── App.tsx              # Main App Component
├── src-tauri/               # Tauri Backend
│   ├── src/
│   │   ├── account/         # Account Management
│   │   │   ├── account_manager.rs  # Account Manager
│   │   │   └── types.rs            # Account Types
│   │   ├── api/             # API Client
│   │   │   ├── trae_api.rs         # Trae API Client
│   │   │   └── types.rs            # API Types
│   │   ├── machine.rs       # Machine ID Management
│   │   ├── lib.rs           # Tauri Command Registration
│   │   └── main.rs          # Entry Point
│   ├── Cargo.toml           # Rust Dependencies
│   └── tauri.conf.json      # Tauri Config
├── package.json             # Node.js Dependencies
└── README.md                # Project Documentation
```

---

## 🤝 Contribution

Contributions, issues, and feature requests are welcome!

### How to Contribute

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

### Reporting Issues

If you find a bug or have suggestions:

1. Go to the [Issues](https://github.com/Yang-505/Trae-Account-Manager/issues) page.
2. Click "New Issue".
3. Choose a template.
4. Describe the issue or suggestion in detail.

---

## 📝 Roadmap

### 🎯 Short-term Plans

- [ ] Support account group management
- [ ] Add account usage statistical charts
- [ ] Support adding account notes
- [ ] Support theme switching (Dark/Light)

### 🚀 Long-term Plans

- [ ] Support macOS platform
- [ ] Add account usage reminders
- [ ] Multi-language support (English, Japanese, etc.)
- [ ] Export account usage reports

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💖 Acknowledgements

Thanks to all developers who contributed to this project!

Special thanks to:
- [Tauri](https://tauri.app/) - Excellent desktop app framework
- [React](https://react.dev/) - Powerful UI framework
- [Rust](https://www.rust-lang.org/) - Safe and efficient systems language

---

## 📞 Contact

- GitHub: [@Yang-505](https://github.com/Yang-505)
- Issues: [Project Issues](https://github.com/Yang-505/Trae-Account-Manager/issues)

---

<div align="center">

## ⭐ Reminder: Don't forget to Star! ⭐

**If you like this project, please give it a Star!**

**Your Star is the motivation for continuous updates! 💪**

Made with ❤️ by Yang-505

</div>

---

## 🎉 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Yang-505/Trae-Account-Manager&type=date&legend=top-left)](https://www.star-history.com/#Yang-505/Trae-Account-Manager&type=date&legend=top-left)
