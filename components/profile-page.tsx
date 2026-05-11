"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import ValidationFeedback, {
  ValidationStatus,
} from "@/components/admin/validation-feedback";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "TEACHER" | "ADMIN";
  joinDate: string;
}

interface ProfilePageProps {
  admin: Admin;
  setAdmin: (admin: Admin) => void;
}

interface PasswordValidation {
  strength: "weak" | "fair" | "good" | "strong";
  isValid: boolean;
  errors: string[];
}

export default function ProfilePage({ admin, setAdmin }: ProfilePageProps) {
  const { updateAdmin } = useAuth();
  const { toast } = useToast();

  //validation feedback state
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>(null);
  const [validationMessage, setValidationMessage] = useState("");

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(admin);

  // Password management
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      strength: "weak",
      isValid: false,
      errors: [],
    });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSubmitError, setPasswordSubmitError] = useState("");

  // 2FA management
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const [twoFASecret, setTwoFASecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");

  useEffect(() => {
    async function fetch2fauser() {
      try {
        const response = await fetch(`/api/users/${admin.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setTwoFAEnabled(data.data.twoFAEnabled);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetch2fauser();

    // Refresh every 5 minutes
    const interval = setInterval(fetch2fauser, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Validate password strength
  const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("One special character (!@#$%^&*)");
    }

    let strength: "weak" | "fair" | "good" | "strong" = "weak";
    if (errors.length === 0) {
      strength = "strong";
    } else if (errors.length <= 2) {
      strength = "good";
    } else if (errors.length <= 3) {
      strength = "fair";
    }

    return {
      strength,
      isValid: errors.length === 0,
      errors,
    };
  };

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    setPasswordValidation(validatePassword(password));
    setPasswordSubmitError("");
  };

  const handleUpdatePassword = async () => {
    setPasswordSubmitError("");

    if (!currentPassword) {
      setPasswordSubmitError("Current password is required");
      return;
    }

    if (!passwordValidation.isValid) {
      setPasswordSubmitError("Password does not meet all requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordSubmitError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`/api/users/${admin.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update password");
      }

      toast({
        title: "Success",
        description: "Your password has been updated successfully",
        duration: 3000,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Password update error:", error);
      setPasswordSubmitError(
        error instanceof Error ? error.message : "Failed to update password",
      );
    }
  };

  const handleCancel2FA = () => {
    setVerificationCode("");
    setTwoFAError("");
    setShow2FASetup(false);
    setTwoFASecret("");
  };

  const handleToggle2FA = async () => {
    if (!twoFAEnabled) {
      try {
        const response = await fetch(`/api/users/${admin.id}/2fa`);
        if (!response.ok) throw new Error("Failed to generate 2FA secret");

        const data = await response.json();

        setTwoFASecret(data.data.secret);
        setOtpauthUrl(data.data.qrCodeUrl);
        setShow2FASetup(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate 2FA secret",
          variant: "destructive",
          duration: 3000,
        });
      }
    } else {
      try {
        const response = await fetch(`/api/users/${admin.id}/2fa`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to disable 2FA");

        setTwoFAEnabled(false);
        toast({
          title: "Success",
          description: "Two-factor authentication has been disabled",
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to disable 2FA",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleVerify2FA = async () => {
    setTwoFAError("");
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setTwoFAError("Please enter a valid 6-digit code");
      return;
    }

    try {
      const response = await fetch(`/api/users/${admin.id}/2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: verificationCode,
          secret: twoFASecret,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid verification code");
      }

      setTwoFAEnabled(true);
      setShow2FASetup(false);
      setVerificationCode("");
      setTwoFASecret("");
      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled",
        duration: 3000,
      });
    } catch (error) {
      setTwoFAError(
        error instanceof Error ? error.message : "Invalid verification code",
      );
    }
  };

  const handleSave = async () => {
    try {
      const requestBody: any = {
        name: editData.name,
        email: editData.email,
        role: editData.role,
      };

      const response = await fetch(`/api/users/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      updateAdmin(editData);
      setAdmin(editData);
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
        duration: 3000,
      });
      /* setValidationStatus("success");
      setValidationMessage("Update profile successfully!");
      setTimeout(() => setValidationStatus(null), 3000); */
    } catch (error) {
      console.error("Save error:", error);
      alert(error instanceof Error ? error.message : "Failed to save");
    }
  };

  const handleCancel = () => {
    setEditData(admin);
    setIsEditing(false);
    setValidationStatus(null);
    setValidationMessage("");
  };

  return (
    <div className="px-6 py-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground font-heading">
          Admin Profile
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage your administrator account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{admin.name}</h3>
            <p className="text-muted-foreground text-sm mt-1">{admin.role}</p>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-foreground font-medium mt-1">
                {admin.joinDate}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role
                  </label>
                  <select
                    value={editData.role}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        role: e.target.value as "TEACHER" | "ADMIN",
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option>TEACHER</option>
                    <option>ADMIN</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="text-foreground font-medium mt-1">
                    {admin.name}
                  </p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium mt-1">
                    {admin.email}
                  </p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="text-foreground font-medium mt-1">
                    {admin.role}
                  </p>
                </div>
                {validationStatus && (
                  <div>
                    <ValidationFeedback
                      status={validationStatus}
                      message={validationMessage}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Update Password Section */}
            <div className="py-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Last changed 3 months ago
                  </p>
                </div>
                {!showPasswordForm && (
                  <Button
                    onClick={() => setShowPasswordForm(true)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    Change Password
                  </Button>
                )}
              </div>

              {showPasswordForm && (
                <div className="space-y-4 pt-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPasswordSubmitError("");
                        }}
                        placeholder="Enter current password"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                passwordValidation.strength === "weak"
                                  ? "w-1/4 bg-red-500"
                                  : passwordValidation.strength === "fair"
                                    ? "w-2/4 bg-orange-500"
                                    : passwordValidation.strength === "good"
                                      ? "w-3/4 bg-yellow-500"
                                      : "w-full bg-green-500"
                              }`}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground capitalize">
                            {passwordValidation.strength}
                          </span>
                        </div>

                        {passwordValidation.errors.length > 0 && (
                          <div className="space-y-1">
                            {passwordValidation.errors.map((error, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-sm text-orange-600"
                              >
                                <AlertCircle
                                  size={16}
                                  className="mt-0.5 flex-shrink-0"
                                />
                                <span>Missing: {error}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {passwordValidation.isValid && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Check size={16} />
                            <span>Password meets all requirements</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordSubmitError("");
                        }}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={14} /> Passwords do not match
                      </p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check size={14} /> Passwords match
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {passwordSubmitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle
                        size={16}
                        className="text-red-600 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-sm text-red-600">
                        {passwordSubmitError}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={
                        !currentPassword ||
                        !passwordValidation.isValid ||
                        newPassword !== confirmPassword
                      }
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      Update Password
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordSubmitError("");
                      }}
                      className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Two-Factor Authentication Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-foreground">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {twoFAEnabled
                      ? "Enabled - Your account is protected"
                      : "Disabled - Strengthen your security"}
                  </p>
                </div>
                {!show2FASetup && (
                  <Button
                    onClick={handleToggle2FA}
                    className={
                      twoFAEnabled
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }
                  >
                    {twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                )}
              </div>

              {show2FASetup && !twoFAEnabled && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Setup Instructions
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>
                        Download an authenticator app (Google Authenticator,
                        Authy, Microsoft Authenticator)
                      </li>
                      <li>
                        Scan the QR code below or enter the setup key manually
                      </li>
                      <li>
                        Enter the 6-digit code from your authenticator app
                      </li>
                      <li>Save backup codes in a secure location</li>
                    </ol>
                  </div>

                  <div className="bg-muted rounded-2xl p-6 flex justify-center">
                    <div className="text-center">
                      <div className="w-44 h-44 bg-white border-2 border-border rounded-xl mb-4 p-3 flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`}
                          alt="2FA QR Code"
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                      <div className="w-44 flex items-center justify-center">
                        <p>Scan the QR code to generate 2FA setup</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Enter 6-digit verification code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        );
                        setTwoFAError("");
                      }}
                      placeholder="000000"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-center text-2xl tracking-widest"
                    />
                  </div>

                  {twoFAError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle
                        size={16}
                        className="text-red-600 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-sm text-red-600">{twoFAError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleVerify2FA}
                      disabled={verificationCode.length !== 6}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      Verify & Enable
                    </Button>
                    <Button
                      onClick={handleCancel2FA}
                      className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
