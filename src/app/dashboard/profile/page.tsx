"use client";

import { useEffect, useState } from "react";
import { User, Key, Copy, Check, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: string;
  apiKey?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  async function generateApiKey() {
    setGeneratingKey(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generateApiKey: true }),
    });
    const data = await res.json();
    if (res.ok) {
      setProfile((p) => p ? { ...p, apiKey: data.apiKey } : p);
      toast("API key generated!", "success");
    } else {
      toast("Failed to generate API key", "error");
    }
    setGeneratingKey(false);
  }

  async function copyApiKey() {
    if (profile?.apiKey) {
      await navigator.clipboard.writeText(profile.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!pwForm.currentPassword)
      errors.currentPassword = "Current password is required";
    if (!pwForm.newPassword)
      errors.newPassword = "New password is required";
    if (pwForm.newPassword && pwForm.newPassword.length < 6)
      errors.newPassword = "Password must be at least 6 characters";
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length) {
      setPwErrors(errors);
      return;
    }

    setPwErrors({});
    setPwLoading(true);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast(data.error || "Failed to change password", "error");
    } else {
      toast("Password changed successfully!", "success");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
    setPwLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {profile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {profile?.name}
              </p>
              <p className="text-slate-500">{profile?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Role</span>
              <span className="text-sm font-medium text-slate-900">
                {profile?.role}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Balance</span>
              <span className="text-sm font-medium text-blue-600">
                ${profile?.balance?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-500">Member Since</span>
              <span className="text-sm font-medium text-slate-900">
                {profile?.createdAt && formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader>
            <CardTitle>API Key</CardTitle>
            <User className="h-5 w-5 text-slate-400" />
          </CardHeader>

          <p className="text-sm text-slate-600 mb-4">
            Use this key to integrate with the SMMP API. Keep it secret and do
            not share it publicly.
          </p>

          {profile?.apiKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-sm text-slate-700 truncate">
                  {showApiKey
                    ? profile.apiKey
                    : "••••••••••••••••••••••••••••••••"}
                </div>
                <button
                  onClick={() => setShowApiKey((s) => !s)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </button>
                <button
                  onClick={copyApiKey}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-500" />
                  )}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateApiKey}
                loading={generatingKey}
              >
                <Key className="h-3.5 w-3.5" />
                Regenerate Key
              </Button>
            </div>
          ) : (
            <Button onClick={generateApiKey} loading={generatingKey}>
              <Key className="h-4 w-4" />
              Generate API Key
            </Button>
          )}
        </Card>

        {/* Change Password */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>

          <form
            onSubmit={changePassword}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={pwForm.currentPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, currentPassword: e.target.value })
              }
              error={pwErrors.currentPassword}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={pwForm.newPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, newPassword: e.target.value })
              }
              error={pwErrors.newPassword}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={pwForm.confirmPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, confirmPassword: e.target.value })
              }
              error={pwErrors.confirmPassword}
            />
            <div className="sm:col-span-3">
              <Button type="submit" loading={pwLoading}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
