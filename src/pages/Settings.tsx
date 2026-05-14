import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import * as api from "../api";

interface SettingsProps {
  onToast?: (type: "success" | "error" | "warning" | "info", message: string) => void;
}

export function Settings({ onToast }: SettingsProps) {
  const [traeMachineId, setTraeMachineId] = useState<string>("");
  const [traeRefreshing, setTraeRefreshing] = useState(false);
  const [clearingTrae, setClearingTrae] = useState(false);
  const [traePath, setTraePath] = useState<string>("");
  const [traePathLoading, setTraePathLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  // 加载 Trae IDE 机器码
  const loadTraeMachineId = async () => {
    setTraeRefreshing(true);
    try {
      const id = await api.getTraeMachineId();
      setTraeMachineId(id);
    } catch (err: any) {
      console.error("Failed to get Trae IDE machine ID:", err);
      setTraeMachineId("Not found");
    } finally {
      setTraeRefreshing(false);
    }
  };

  // 加载 Trae IDE 路径
  const loadTraePath = async () => {
    setTraePathLoading(true);
    try {
      const path = await api.getTraePath();
      setTraePath(path);
    } catch (err: any) {
      console.error("Failed to get Trae IDE path:", err);
      setTraePath("");
    } finally {
      setTraePathLoading(false);
    }
  };

  useEffect(() => {
    loadTraeMachineId();
    loadTraePath();
  }, []);

  // 复制 Trae IDE 机器码
  const handleCopyTraeMachineId = async () => {
    try {
      await navigator.clipboard.writeText(traeMachineId);
      onToast?.("success", "Trae IDE machine ID copied to clipboard");
    } catch {
      onToast?.("error", "Copy failed");
    }
  };

  // 清除 Trae IDE 登录状态
  const handleClearTraeLoginState = async () => {
    if (!confirm("Are you sure you want to clear Trae IDE login state?\n\nThis will:\n• Reset Trae IDE machine ID\n• Clear all login information\n• Delete local cached data\n\nAfter operation, Trae IDE will become a fresh installation and require re-login.\n\nPlease ensure Trae IDE is closed!")) {
      return;
    }

    setClearingTrae(true);
    try {
      await api.clearTraeLoginState();
      await loadTraeMachineId(); // 重新加载新的机器码
      onToast?.("success", "Trae IDE login state cleared, please restart Trae IDE to login");
    } catch (err: any) {
      onToast?.("error", err.message || "Clear failed");
    } finally {
      setClearingTrae(false);
    }
  };

  // 自动扫描 Trae IDE 路径
  const handleScanTraePath = async () => {
    setScanning(true);
    try {
      const path = await api.scanTraePath();
      setTraePath(path);
      onToast?.("success", "Found Trae IDE: " + path);
    } catch (err: any) {
      onToast?.("error", err.message || "Trae IDE not found, please set path manually");
    } finally {
      setScanning(false);
    }
  };

  // 手动设置 Trae IDE 路径
  const handleSetTraePath = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: "Trae IDE",
          extensions: ["exe"]
        }],
        title: "Select Trae.exe file"
      });

      if (selected) {
        const path = selected as string;
        await api.setTraePath(path);
        setTraePath(path);
        onToast?.("success", "Trae IDE path saved");
      }
    } catch (err: any) {
      onToast?.("error", err.message || "Failed to select file");
    }
  };

  return (
    <div className="settings-page">
      {/* 机器码 */}
      <div className="settings-section">
        <h3>Machine ID</h3>
        <div className="machine-id-card trae-card">
          <div className="machine-id-header">
            <div className="machine-id-icon trae-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="machine-id-title">
              <span>MachineId</span>
              <span className="machine-id-subtitle">Client unique identifier</span>
            </div>
          </div>
          <div className="machine-id-value">
            <code>{traeRefreshing ? "Loading..." : traeMachineId}</code>
          </div>
          <div className="machine-id-actions">
            <button
              className="machine-id-btn"
              onClick={loadTraeMachineId}
              disabled={traeRefreshing}
              title="Refresh"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
            <button
              className="machine-id-btn"
              onClick={handleCopyTraeMachineId}
              disabled={!traeMachineId || traeRefreshing || traeMachineId === "Not found"}
              title="Copy"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
            <button
              className="machine-id-btn danger"
              onClick={handleClearTraeLoginState}
              disabled={clearingTrae || traeRefreshing}
              title="Clear Login State"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              {clearingTrae ? "Clearing..." : "Clear Login State"}
            </button>
          </div>
          <div className="machine-id-tip warning">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Clearing login state will reset the machine ID and delete all login info. The client will need to re-login. Please close the client first.</span>
          </div>
        </div>
      </div>

      {/* 路径设置 */}
      <div className="settings-section">
        <h3>Client Path</h3>
        <div className="machine-id-card trae-card">
          <div className="machine-id-header">
            <div className="machine-id-icon trae-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="machine-id-title">
              <span>Install Path</span>
              <span className="machine-id-subtitle">Used to automatically open the client</span>
            </div>
          </div>
          <div className="machine-id-value">
            <code>{traePathLoading ? "Loading..." : (traePath || "Not set")}</code>
          </div>
          <div className="machine-id-actions">
            <button
              className="machine-id-btn"
              onClick={handleScanTraePath}
              disabled={scanning}
              title="Auto Scan"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              {scanning ? "Scanning..." : "Auto Scan"}
            </button>
            <button
              className="machine-id-btn"
              onClick={handleSetTraePath}
              title="Manual Set"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Manual Set
            </button>
          </div>
          <div className="machine-id-tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span>The client will automatically open after switching accounts. If auto-scan cannot find it, please manually set the full path of Trae.exe.</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>General Settings</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Auto Refresh</div>
            <div className="setting-desc">Automatically refresh account usage data periodically</div>
          </div>
          <label className="toggle">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Refresh Interval</div>
            <div className="setting-desc">Time interval for auto-refresh (minutes)</div>
          </div>
          <select className="setting-select">
            <option value="5">5 Minutes</option>
            <option value="10">10 Minutes</option>
            <option value="30">30 Minutes</option>
            <option value="60">60 Minutes</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>Data Management</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Export Data</div>
            <div className="setting-desc">Export all account data as a JSON file</div>
          </div>
          <button className="setting-btn">Export</button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Import Data</div>
            <div className="setting-desc">Import account data from a JSON file</div>
          </div>
          <button className="setting-btn">Import</button>
        </div>

        <div className="setting-item danger">
          <div className="setting-info">
            <div className="setting-label">Clear Data</div>
            <div className="setting-desc">Delete all account data (irrecoverable)</div>
          </div>
          <button className="setting-btn danger">Clear</button>
        </div>
      </div>
    </div>
  );
}
