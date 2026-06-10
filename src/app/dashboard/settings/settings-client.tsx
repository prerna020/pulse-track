"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Link2, Loader2, Mail, Send, Settings, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface UserInfo {
  name: string | null;
  email: string | null;
  image: string | null;
}

interface UserPrefs {
  emailDigestEnabled: boolean;
  digestFrequency: string;
  slackWebhookUrl: string | null;
}

const SECTION_CLASS =
  "glass-card divide-y divide-[rgba(26,18,8,0.08)] overflow-hidden";
const SECTION_HEADER_CLASS =
  "flex items-center gap-2.5 px-6 py-4 bg-[rgba(26,18,8,0.02)]";
const ROW_CLASS = "flex items-center justify-between gap-6 px-6 py-4";
const LABEL_CLASS = "text-sm font-medium text-[#1a1208]";
const SUBLABEL_CLASS = "mt-0.5 text-xs text-[#9c8570]";

export function SettingsClient({
  user,
  prefs: initialPrefs,
}: {
  user: UserInfo;
  prefs: UserPrefs;
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPrefs>(initialPrefs);
  const [slackInput, setSlackInput] = useState(initialPrefs.slackWebhookUrl ?? "");
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "?";

  async function patchSetting(
    key: string,
    update: Partial<UserPrefs>
  ) {
    setIsSaving(key);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });

      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setPrefs((p) => ({ ...p, ...data }));
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(null);
    }
  }

  async function handleDigestToggle(enabled: boolean) {
    setPrefs((p) => ({ ...p, emailDigestEnabled: enabled }));
    await patchSetting("emailDigest", { emailDigestEnabled: enabled });
  }

  async function handleFrequencyChange(freq: string) {
    setPrefs((p) => ({ ...p, digestFrequency: freq }));
    await patchSetting("digestFrequency", { digestFrequency: freq });
  }

  async function handleSlackSave() {
    await patchSetting("slackWebhook", {
      slackWebhookUrl: slackInput.trim() || null,
    });
  }

  async function handleSendTestDigest() {
    setIsSendingDigest(true);
    try {
      const res = await fetch("/api/digest/test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message ?? "Test digest sent!");
      } else {
        toast.error(data.error ?? "Failed to send digest");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSendingDigest(false);
    }
  }

  async function handleDeleteAll() {
    const confirmed = window.confirm(
      "Are you sure? This will permanently delete ALL competitors and their tracking data. This cannot be undone."
    );
    if (!confirmed) return;

    setIsDeletingAll(true);
    try {
      const res = await fetch("/api/competitors/all", { method: "DELETE" });
      if (res.ok) {
        toast.success("All competitors deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete competitors");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeletingAll(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1208]">Settings</h1>
        <p className="mt-1 text-sm text-[#5c4a32]">
          Manage your profile and notification preferences
        </p>
      </div>

      {/* ─── Profile ─────────────────────────────────────────── */}
      <div className={SECTION_CLASS}>
        <div className={SECTION_HEADER_CLASS}>
          <User className="size-4 text-[#5c4a32]" />
          <span className="text-sm font-semibold text-[#1a1208]">Profile</span>
        </div>

        <div className={ROW_CLASS}>
          <div className="flex items-center gap-4">
            <Avatar className="size-14 rounded-xl">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
              <AvatarFallback className="rounded-xl bg-[rgba(26,18,8,0.05)] text-lg font-medium text-[#1a1208]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-[#1a1208]">
                {user.name ?? "—"}
              </p>
              <p className="text-sm text-[#9c8570]">{user.email ?? "—"}</p>
            </div>
          </div>
          <span className="rounded-md bg-[rgba(26,18,8,0.05)] px-2.5 py-1 text-xs text-[#5c4a32]">
            Read-only
          </span>
        </div>
      </div>

      {/* ─── Notifications ───────────────────────────────────── */}
      <div className={SECTION_CLASS}>
        <div className={SECTION_HEADER_CLASS}>
          <Settings className="size-4 text-[#5c4a32]" />
          <span className="text-sm font-semibold text-[#1a1208]">
            Notifications
          </span>
        </div>

        {/* Email digest toggle */}
        <div className={ROW_CLASS}>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[rgba(26,18,8,0.05)]">
              <Mail className="size-4 text-[#5c4a32]" />
            </div>
            <div>
              <p className={LABEL_CLASS}>Email digest</p>
              <p className={SUBLABEL_CLASS}>
                Receive a summary of competitor changes in your inbox
              </p>
            </div>
          </div>
          <Switch
            id="email-digest-toggle"
            checked={prefs.emailDigestEnabled}
            onCheckedChange={handleDigestToggle}
            disabled={isSaving === "emailDigest"}
          />
        </div>

        {/* Frequency selector */}
        {prefs.emailDigestEnabled && (
          <div className={ROW_CLASS}>
            <div>
              <Label
                htmlFor="digest-frequency"
                className={LABEL_CLASS}
              >
                Digest frequency
              </Label>
              <p className={SUBLABEL_CLASS}>How often to receive the digest</p>
            </div>
            <select
              id="digest-frequency"
              value={prefs.digestFrequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              disabled={isSaving === "digestFrequency"}
              className="rounded-lg border border-[rgba(26,18,8,0.1)] bg-white px-3 py-1.5 text-sm text-[#1a1208] focus:outline-none focus:ring-2 focus:ring-[rgba(26,18,8,0.1)]"
            >
              <option value="weekly">Weekly (Mondays)</option>
              <option value="daily">Daily (9am)</option>
            </select>
          </div>
        )}

        {/* Slack webhook */}
        <div className={ROW_CLASS}>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[rgba(26,18,8,0.05)]">
              <Link2 className="size-4 text-[#5c4a32]" />
            </div>
            <div>
              <p className={LABEL_CLASS}>Slack webhook URL</p>
              <p className={SUBLABEL_CLASS}>
                Post change alerts to a Slack channel (optional)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 pb-4">
          <Input
            id="slack-webhook"
            placeholder="https://hooks.slack.com/services/…"
            value={slackInput}
            onChange={(e) => setSlackInput(e.target.value)}
            className="border-[rgba(26,18,8,0.1)] bg-white/80 text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-[rgba(26,18,8,0.1)] text-[#1a1208] hover:bg-[rgba(26,18,8,0.05)]"
            onClick={handleSlackSave}
            disabled={isSaving === "slackWebhook"}
          >
            {isSaving === "slackWebhook" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>

        {/* Test digest */}
        <div className={ROW_CLASS}>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[rgba(26,18,8,0.05)]">
              <Send className="size-4 text-[#5c4a32]" />
            </div>
            <div>
              <p className={LABEL_CLASS}>Send test digest</p>
              <p className={SUBLABEL_CLASS}>
                Immediately send a digest email to your inbox
              </p>
            </div>
          </div>
          <Button
            id="send-test-digest-btn"
            variant="outline"
            size="sm"
            className="shrink-0 border-[rgba(26,18,8,0.1)] text-[#1a1208] hover:bg-[rgba(26,18,8,0.05)]"
            onClick={handleSendTestDigest}
            disabled={isSendingDigest}
          >
            {isSendingDigest ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              "Send now"
            )}
          </Button>
        </div>
      </div>

      {/* ─── Danger Zone ─────────────────────────────────────── */}
      <div className="glass-card overflow-hidden border border-[#a63d2f]/20">
        <div className="flex items-center gap-2.5 border-b border-[#a63d2f]/20 bg-[#fdf0ee] px-6 py-4">
          <Trash2 className="size-4 text-[#a63d2f]" />
          <span className="text-sm font-semibold text-[#a63d2f]">
            Danger Zone
          </span>
        </div>

        <div className={ROW_CLASS}>
          <div>
            <p className="text-sm font-medium text-[#1a1208]">
              Delete all competitors
            </p>
            <p className="mt-0.5 text-xs text-[#9c8570]">
              Permanently removes all competitors and their tracking history.
              This cannot be undone.
            </p>
          </div>
          <Button
            id="delete-all-competitors-btn"
            variant="outline"
            size="sm"
            className="shrink-0 border-[#a63d2f]/20 text-[#a63d2f] hover:bg-[#fdf0ee] hover:text-[#a63d2f]"
            onClick={handleDeleteAll}
            disabled={isDeletingAll}
          >
            {isDeletingAll ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                <Trash2 className="size-3.5" />
                Delete all
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
