import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { AccountCard } from "./components/AccountCard";
import { AccountListItem } from "./components/AccountListItem";
import { AddAccountModal } from "./components/AddAccountModal";
import { ContextMenu } from "./components/ContextMenu";
import { DetailModal } from "./components/DetailModal";
import { Toast } from "./components/Toast";
import { ConfirmModal } from "./components/ConfirmModal";
import { InfoModal } from "./components/InfoModal";
import { UpdateTokenModal } from "./components/UpdateTokenModal";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { About } from "./pages/About";
import { useToast } from "./hooks/useToast";
import * as api from "./api";
import type { AccountBrief, UsageSummary } from "./types";
import "./App.css";

interface AccountWithUsage extends AccountBrief {
  usage?: UsageSummary | null;
}

type ViewMode = "grid" | "list";

function App() {
  const [accounts, setAccounts] = useState<AccountWithUsage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // 使用自定义 Toast hook
  const { toasts, addToast, removeToast } = useToast();

  // 确认弹窗状态
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void;
  } | null>(null);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    accountId: string;
  } | null>(null);

  // 详情弹窗状态
  const [detailAccount, setDetailAccount] = useState<AccountWithUsage | null>(null);

  // 刷新中的账号 ID
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

  // 更新 Token 弹窗状态
  const [updateTokenModal, setUpdateTokenModal] = useState<{
    accountId: string;
    accountName: string;
  } | null>(null);

  // 信息展示弹窗状态
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    icon: string;
    sections: Array<{
      title?: string;
      content: string;
      type?: "text" | "code" | "list";
    }>;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  // 加载账号列表（先显示列表，再后台加载使用量）
  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.getAccounts();

      // 先立即显示账号列表（不等待使用量加载）
      setAccounts(list.map((account) => ({ ...account, usage: undefined })));
      setLoading(false);

      // 后台并行加载使用量
      if (list.length > 0) {
        const usageResults = await Promise.allSettled(
          list.map((account) => api.getAccountUsage(account.id))
        );

        setAccounts((prev) =>
          prev.map((account, index) => {
            const result = usageResults[index];
            return {
              ...account,
              usage: result.status === 'fulfilled' ? result.value : null
            };
          })
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to load accounts");
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // 自动刷新即将过期的 Token
  useEffect(() => {
    // 启动时刷新
    api.refreshAllTokens().then((refreshed) => {
      if (refreshed.length > 0) {
        console.log(`[INFO] Automatically refreshed ${refreshed.length} tokens on startup`);
        loadAccounts();
      }
    }).catch(console.error);

    // 每30分钟刷新一次
    const interval = setInterval(() => {
      api.refreshAllTokens().then((refreshed) => {
        if (refreshed.length > 0) {
          console.log(`[INFO] Automatically refreshed ${refreshed.length} tokens periodically`);
          loadAccounts();
        }
      }).catch(console.error);
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadAccounts]);

  // 添加账号
  const handleAddAccount = async (token: string, cookies?: string) => {
    await api.addAccountByToken(token, cookies);
    addToast("success", "Account added successfully");
    await loadAccounts();
  };

  // 删除账号
  const handleDeleteAccount = async (accountId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Account",
      message: "Are you sure you want to delete this account? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        try {
          await api.removeAccount(accountId);
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(accountId);
            return next;
          });
          addToast("success", "Account deleted");
          await loadAccounts();
        } catch (err: any) {
          addToast("error", err.message || "Failed to delete account");
        }
        setConfirmModal(null);
      },
    });
  };

  // 刷新单个账号
  const handleRefreshAccount = async (accountId: string) => {
    // 防止重复刷新
    if (refreshingIds.has(accountId)) {
      return;
    }

    setRefreshingIds((prev) => new Set(prev).add(accountId));

    try {
      const usage = await api.getAccountUsage(accountId);
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, usage } : a))
      );
      addToast("success", "Data refreshed successfully");
    } catch (err: any) {
      addToast("error", err.message || "Refresh failed");
    } finally {
      setRefreshingIds((prev) => {
        const next = new Set(prev);
        next.delete(accountId);
        return next;
      });
    }
  };

  // 选择账号
  const handleSelectAccount = (accountId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.size === accounts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(accounts.map((a) => a.id)));
    }
  };

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent, accountId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, accountId });
  };

  // 复制 Token
  const handleCopyToken = async (accountId: string) => {
    try {
      const account = await api.getAccount(accountId);
      if (account.jwt_token) {
        await navigator.clipboard.writeText(account.jwt_token);
        addToast("success", "Token copied to clipboard");
      } else {
        addToast("warning", "This account has no valid Token");
      }
    } catch (err: any) {
      addToast("error", err.message || "Failed to get Token");
    }
  };

  // 切换账号
  const handleSwitchAccount = async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;

    setConfirmModal({
      isOpen: true,
      title: "Switch Account",
      message: `Are you sure you want to switch to account "${account.email || account.name}"?\n\nThe system will automatically close Trae IDE and switch login information.`,
      type: "warning",
      onConfirm: async () => {
        setConfirmModal(null);
        addToast("info", "Switching account, please wait...");
        try {
          await api.switchAccount(accountId);
          await loadAccounts();
          addToast("success", "Account switched successfully, please reopen Trae IDE");
        } catch (err: any) {
          addToast("error", err.message || "Failed to switch account");
        }
      },
    });
  };

  // 查看详情
  const handleViewDetail = async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (account) {
      try {
        // 获取完整的账号信息（包含 token 和 cookies）
        const fullAccount = await api.getAccount(accountId);
        setDetailAccount({ ...account, ...fullAccount });
      } catch (err: any) {
        addToast("error", "Failed to get account details");
        console.error("Failed to get account details:", err);
      }
    }
  };

  // 更新 Token
  const handleUpdateToken = async (accountId: string, token: string) => {
    try {
      const usage = await api.updateAccountToken(accountId, token);
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, usage } : a))
      );
      addToast("success", "Token updated successfully, data refreshed");
    } catch (err: any) {
      throw err; // 让弹窗显示错误
    }
  };

  // 打开更新 Token 弹窗
  const handleOpenUpdateToken = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (account) {
      setUpdateTokenModal({
        accountId,
        accountName: account.email || account.name,
      });
    }
  };

  // 获取礼包
  const handleClaimGift = async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;

    setConfirmModal({
      isOpen: true,
      title: "Claim Gift",
      message: `Are you sure you want to claim the anniversary gift for account "${account.email || account.name}"?\n\nAccount quota will be automatically refreshed after claiming.`,
      type: "info",
      onConfirm: async () => {
        setConfirmModal(null);
        addToast("info", "Claiming gift, please wait...");
        try {
          await api.claimGift(accountId);
          // 刷新账号数据
          await handleRefreshAccount(accountId);
          addToast("success", "Gift claimed successfully! Quota updated");
        } catch (err: any) {
          addToast("error", err.message || "Failed to claim gift");
        }
      },
    });
  };

  // 显示导出说明
  const handleShowExportInfo = () => {
    if (accounts.length === 0) {
      addToast("warning", "No accounts to export");
      return;
    }

    setInfoModal({
      isOpen: true,
      title: "Export Accounts Info",
      icon: "📤",
      sections: [
        {
          title: "📄 Export Format",
          content: "JSON file (.json)",
          type: "text"
        },
        {
          title: "📁 Save Location",
          content: "Browser default downloads folder\nFile name format: trae-accounts-YYYY-MM-DD.json",
          type: "text"
        },
        {
          title: "📋 File Content",
          content: `<ul>
<li>Complete information for all accounts</li>
<li>Token and Cookies data</li>
<li>Usage statistics</li>
<li>Account creation and update times</li>
</ul>`,
          type: "list"
        },
        {
          title: "✅ After export, you can",
          content: `<ul>
<li>Backup account data</li>
<li>Migrate to other devices</li>
<li>Restore accidentally deleted accounts</li>
<li>Share for use on other devices</li>
</ul>`,
          type: "list"
        },
        {
          title: "⚠️ Security Tip",
          content: `<ul>
<li><strong>Export file contains sensitive information</strong></li>
<li><strong>Please keep the exported file safe</strong></li>
<li><strong>Do not share with others</strong></li>
<li>Recommended to store exported files encrypted</li>
</ul>`,
          type: "list"
        },
        {
          content: `Exporting ${accounts.length} accounts`,
          type: "text"
        }
      ],
      confirmText: "Start Export",
      onConfirm: () => {
        setInfoModal(null);
        handleExportAccounts();
      }
    });
  };

  // 导出账号
  const handleExportAccounts = async () => {
    try {
      const data = await api.exportAccounts();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `trae-accounts-${new Date().toISOString().split("T")[0]}.json`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("success", `Exported ${accounts.length} accounts to downloads folder: ${fileName}`);
    } catch (err: any) {
      addToast("error", err.message || "Export failed");
    }
  };

  // 显示导入说明
  const handleShowImportInfo = () => {
    setInfoModal({
      isOpen: true,
      title: "Import Accounts Info",
      icon: "📥",
      sections: [
        {
          title: "📄 File Format",
          content: "JSON file (.json)",
          type: "text"
        },
        {
          title: "📋 File Structure Example",
          content: `{
  "accounts": [
    {
      "id": "AccountID",
      "name": "Username",
      "email": "EmailAddress",
      "jwt_token": "TokenString",
      "cookies": "CookiesString",
      "plan_type": "PlanType",
      "created_at": Timestamp,
      "is_active": true,
      ...
    }
  ],
  "active_account_id": "ActiveAccountID",
  "current_account_id": "CurrentAccountID"
}`,
          type: "code"
        },
        {
          title: "✅ Import Steps",
          content: `<ul>
<li>Select JSON file after confirming</li>
<li>System automatically validates format</li>
<li>Import all valid accounts</li>
</ul>`,
          type: "list"
        },
        {
          title: "⚠️ Note",
          content: `<ul>
<li>Only supports format exported by this app</li>
<li>Duplicate accounts will be skipped automatically</li>
<li>Recommended to backup account data regularly</li>
</ul>`,
          type: "list"
        }
      ],
      confirmText: "Select File",
      onConfirm: () => {
        setInfoModal(null);
        handleImportAccounts();
      }
    });
  };

  // 导入账号
  const handleImportAccounts = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const count = await api.importAccounts(text);
        addToast("success", `Successfully imported ${count} accounts`);
        await loadAccounts();
      } catch (err: any) {
        addToast("error", err.message || "Import failed");
      }
    };
    input.click();
  };

  // 批量刷新选中账号（优化：并行处理，添加进度反馈）
  const handleBatchRefresh = async () => {
    if (selectedIds.size === 0) {
      addToast("warning", "Please select accounts to refresh first");
      return;
    }

    const ids = Array.from(selectedIds);
    addToast("info", `Refreshing ${ids.length} accounts...`);

    // 并行刷新所有选中的账号
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        try {
          const usage = await api.getAccountUsage(id);
          setAccounts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, usage } : a))
          );
          return { id, success: true };
        } catch (err: any) {
          return { id, success: false, error: err.message };
        }
      })
    );

    // 统计结果
    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    const failCount = ids.length - successCount;

    if (failCount === 0) {
      addToast("success", `Successfully refreshed ${successCount} accounts`);
    } else {
      addToast("warning", `Refresh complete: ${successCount} success, ${failCount} failed`);
    }
  };

  // 批量删除选中账号（优化：改进错误处理和反馈）
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      addToast("warning", "Please select accounts to delete first");
      return;
    }

    const ids = Array.from(selectedIds);
    setConfirmModal({
      isOpen: true,
      title: "Batch Delete",
      message: `Are you sure you want to delete the selected ${ids.length} accounts? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        setConfirmModal(null);
        addToast("info", `Deleting ${ids.length} accounts...`);

        // 并行删除所有选中的账号
        const results = await Promise.allSettled(
          ids.map((id) => api.removeAccount(id))
        );

        // 统计结果
        const successCount = results.filter((r) => r.status === 'fulfilled').length;
        const failCount = ids.length - successCount;

        setSelectedIds(new Set());
        await loadAccounts();

        if (failCount === 0) {
          addToast("success", `Successfully deleted ${successCount} accounts`);
        } else {
          addToast("warning", `Delete complete: ${successCount} success, ${failCount} failed`);
        }
      },
    });
  };

  // 删除过期/失效账号
  const handleDeleteExpiredAccounts = () => {
    // 筛选出过期或失效的账号
    const expiredAccounts = accounts.filter((account) => {
      if (!account.token_expired_at) return false;
      const expiry = new Date(account.token_expired_at).getTime();
      if (isNaN(expiry)) return false;
      return expiry < Date.now(); // Token 已过期
    });

    if (expiredAccounts.length === 0) {
      addToast("info", "No expired or invalid accounts found");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Expired Accounts",
      message: `Detected ${expiredAccounts.length} expired accounts. Are you sure you want to delete them? This action cannot be undone.`,
      type: "warning",
      onConfirm: async () => {
        setConfirmModal(null);
        addToast("info", `Deleting ${expiredAccounts.length} expired accounts...`);

        // 并行删除所有过期账号
        const results = await Promise.allSettled(
          expiredAccounts.map((account) => api.removeAccount(account.id))
        );

        // 统计结果
        const successCount = results.filter((r) => r.status === 'fulfilled').length;
        const failCount = expiredAccounts.length - successCount;

        setSelectedIds(new Set());
        await loadAccounts();

        if (failCount === 0) {
          addToast("success", `Successfully deleted ${successCount} expired accounts`);
        } else {
          addToast("warning", `Delete complete: ${successCount} success, ${failCount} failed`);
        }
      },
    });
  };

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="app-content">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {currentPage === "dashboard" && (
          <Dashboard accounts={accounts} />
        )}

        {currentPage === "accounts" && (
          <>
            <header className="page-header">
              <div className="header-left">
                <h2 className="page-title">Accounts</h2>
                <p>Manage your accounts</p>
              </div>
              <div className="header-right">
                <span className="account-count">Total {accounts.length} accounts</span>
                <button
                  className="header-btn danger"
                  onClick={handleDeleteExpiredAccounts}
                  title="Delete all expired accounts"
                  disabled={accounts.length === 0}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                  Delete Expired
                  {(() => {
                    const expiredCount = accounts.filter((account) => {
                      if (!account.token_expired_at) return false;
                      const expiry = new Date(account.token_expired_at).getTime();
                      if (isNaN(expiry)) return false;
                      return expiry < Date.now();
                    }).length;
                    return expiredCount > 0 ? <span className="badge-count">{expiredCount}</span> : null;
                  })()}
                </button>
                <button className="header-btn" onClick={handleShowImportInfo} title="Import Accounts">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  Import
                </button>
                <button className="header-btn" onClick={handleShowExportInfo} title="Export Accounts" disabled={accounts.length === 0}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  Export
                </button>
                <button className="add-btn" onClick={() => setShowAddModal(true)}>
                  <span>+</span> Add Account
                </button>
              </div>
            </header>

            <main className="app-main">
              {accounts.length > 0 && (
                <div className="toolbar">
                  <div className="toolbar-left">
                    <label className="select-all">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === accounts.length && accounts.length > 0}
                        onChange={handleSelectAll}
                      />
                      Select All ({selectedIds.size}/{accounts.length})
                    </label>
                    {selectedIds.size > 0 && (
                      <div className="batch-actions">
                        <button className="batch-btn" onClick={handleBatchRefresh}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                          </svg>
                          Refresh
                        </button>
                        <button className="batch-btn danger" onClick={handleBatchDelete}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="toolbar-right">
                    <div className="view-toggle">
                      <button
                        className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                        onClick={() => setViewMode("grid")}
                        title="Grid View"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <rect x="3" y="3" width="7" height="7"/>
                          <rect x="14" y="3" width="7" height="7"/>
                          <rect x="3" y="14" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/>
                        </svg>
                      </button>
                      <button
                        className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                        title="List View"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <line x1="8" y1="6" x2="21" y2="6"/>
                          <line x1="8" y1="12" x2="21" y2="12"/>
                          <line x1="8" y1="18" x2="21" y2="18"/>
                          <line x1="3" y1="6" x2="3.01" y2="6"/>
                          <line x1="3" y1="12" x2="3.01" y2="12"/>
                          <line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading...</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Accounts</h3>
                  <p>Click the button above to add an account, or import existing accounts</p>
                  <div className="empty-actions">
                    <button className="empty-btn primary" onClick={() => setShowAddModal(true)}>
                      Add Account
                    </button>
                    <button className="empty-btn" onClick={handleImportAccounts}>
                      Import Accounts
                    </button>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="account-grid">
                  {accounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      usage={account.usage || null}
                      selected={selectedIds.has(account.id)}
                      onSelect={handleSelectAccount}
                      onContextMenu={handleContextMenu}
                    />
                  ))}
                </div>
              ) : (
                <div className="account-list">
                  <div className="list-header">
                    <div className="list-col checkbox"></div>
                    <div className="list-col avatar"></div>
                    <div className="list-col info">Account Info</div>
                    <div className="list-col plan">Plan</div>
                    <div className="list-col usage">Usage</div>
                    <div className="list-col reset">Reset Time</div>
                    <div className="list-col status">Status</div>
                    <div className="list-col actions"></div>
                  </div>
                  {accounts.map((account) => (
                    <AccountListItem
                      key={account.id}
                      account={account}
                      usage={account.usage || null}
                      selected={selectedIds.has(account.id)}
                      onSelect={handleSelectAccount}
                      onContextMenu={handleContextMenu}
                    />
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        {currentPage === "settings" && (
          <>
            <header className="page-header">
              <div className="header-left">
                <h2 className="page-title">Settings</h2>
                <p>Configure application options</p>
              </div>
            </header>
            <Settings onToast={addToast} />
          </>
        )}

        {currentPage === "about" && (
          <>
            <header className="page-header">
              <div className="header-left">
                <h2 className="page-title">About</h2>
                <p>Application Information</p>
              </div>
            </header>
            <About />
          </>
        )}
      </div>

      {/* Toast 通知 */}
      <Toast messages={toasts} onRemove={removeToast} />

      {/* 确认弹窗 */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmText="Confirm"
          cancelText="Cancel"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* 信息展示弹窗 */}
      {infoModal && (
        <InfoModal
          isOpen={infoModal.isOpen}
          title={infoModal.title}
          icon={infoModal.icon}
          sections={infoModal.sections}
          confirmText={infoModal.confirmText}
          onConfirm={infoModal.onConfirm}
          onCancel={() => setInfoModal(null)}
        />
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onViewDetail={() => {
            handleViewDetail(contextMenu.accountId);
            setContextMenu(null);
          }}
          onRefresh={() => {
            handleRefreshAccount(contextMenu.accountId);
            setContextMenu(null);
          }}
          onUpdateToken={() => {
            handleOpenUpdateToken(contextMenu.accountId);
            setContextMenu(null);
          }}
          onCopyToken={() => {
            handleCopyToken(contextMenu.accountId);
            setContextMenu(null);
          }}
          onSwitchAccount={() => {
            handleSwitchAccount(contextMenu.accountId);
            setContextMenu(null);
          }}
          onClaimGift={() => {
            handleClaimGift(contextMenu.accountId);
            setContextMenu(null);
          }}
          onDelete={() => {
            handleDeleteAccount(contextMenu.accountId);
            setContextMenu(null);
          }}
          isCurrent={accounts.find(a => a.id === contextMenu.accountId)?.is_current || false}
        />
      )}

      {/* 添加账号弹窗 */}
      <AddAccountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAccount}
        onToast={addToast}
        onAccountAdded={loadAccounts}
      />

      {/* 详情弹窗 */}
      <DetailModal
        isOpen={!!detailAccount}
        onClose={() => setDetailAccount(null)}
        account={detailAccount}
        usage={detailAccount?.usage || null}
      />

      {/* 更新 Token 弹窗 */}
      <UpdateTokenModal
        isOpen={!!updateTokenModal}
        accountId={updateTokenModal?.accountId || ""}
        accountName={updateTokenModal?.accountName || ""}
        onClose={() => setUpdateTokenModal(null)}
        onUpdate={handleUpdateToken}
      />
    </div>
  );
}

export default App;
