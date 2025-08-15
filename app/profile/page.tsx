// Purpose: Profile management with simple storage
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";

export default function ProfilePage() {
  const { data, loading, updateProfile } = useAppData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const profile = data?.profile || {
    company_name: "Creative Currents",
    ein: "",
    tax_number: "",
    bank_name: "",
    account_number: "",
    routing_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    zip_code: "",
    logo_url: "",
  };

  // Form state
  const [formData, setFormData] = useState({
    company_name: profile.company_name,
    ein: profile.ein,
    tax_number: profile.tax_number,
    bank_name: profile.bank_name,
    account_number: profile.account_number,
    routing_number: profile.routing_number,
    address_line_1: profile.address_line_1,
    address_line_2: profile.address_line_2,
    city: profile.city,
    state: profile.state,
    zip_code: profile.zip_code,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Loading...</h3>
          <p className="text-muted-foreground">
            Please wait while we load your data.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let uploadedLogoUrl = logoUrl || profile.logo_url;

      // For now, we'll just use the file URL if a new logo was selected
      if (logoFile) {
        uploadedLogoUrl = URL.createObjectURL(logoFile);
      }

      await updateProfile({
        ...formData,
        logo_url: uploadedLogoUrl,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your business information and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ein">
                  EIN (Employer Identification Number)
                </Label>
                <Input
                  id="ein"
                  placeholder="XX-XXXXXXX"
                  value={formData.ein}
                  onChange={(e) =>
                    setFormData({ ...formData, ein: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your business tax identification number (appears on invoices)
                </p>
              </div>
              <div>
                <Label htmlFor="tax_number">State Tax ID (Optional)</Label>
                <Input
                  id="tax_number"
                  placeholder="State tax registration number"
                  value={formData.tax_number}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_number: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Banking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bank_name">Bank Name (Optional)</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_number">
                  Account Number (Optional)
                </Label>
                <Input
                  id="account_number"
                  type="password"
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="routing_number">
                  Routing Number (Optional)
                </Label>
                <Input
                  id="routing_number"
                  value={formData.routing_number}
                  onChange={(e) =>
                    setFormData({ ...formData, routing_number: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Address */}
        <Card>
          <CardHeader>
            <CardTitle>Business Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address_line_1">Address Line 1 (Optional)</Label>
              <Input
                id="address_line_1"
                value={formData.address_line_1}
                onChange={(e) =>
                  setFormData({ ...formData, address_line_1: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
              <Input
                id="address_line_2"
                value={formData.address_line_2}
                onChange={(e) =>
                  setFormData({ ...formData, address_line_2: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City (Optional)</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">State (Optional)</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="zip_code">ZIP Code (Optional)</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) =>
                    setFormData({ ...formData, zip_code: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo">Upload Logo (Optional)</Label>
              <div className="mt-2">
                {(logoUrl || profile.logo_url) && (
                  <img
                    src={logoUrl || profile.logo_url}
                    alt="Company Logo Preview"
                    className="mb-2 max-w-[220px] h-auto rounded border"
                  />
                )}
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("logo-input")?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  {logoFile && (
                    <span className="text-sm text-muted-foreground">
                      {logoFile.name}
                    </span>
                  )}
                </div>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 220px max width, PNG or JPG format
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
