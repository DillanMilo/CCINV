// Purpose: Profile management with company info and logo upload
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { profileSchema, type Profile } from "@/types/schemas";
import { upsertProfile } from "@/lib/actions";
import { createClient } from "@/lib/supabase-browser";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ProfilePage() {
  useRequireAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = async (data: Profile) => {
    setIsSubmitting(true);
    try {
      let uploadedLogoUrl = logoUrl;
      if (logoFile) {
        const supabase = createClient();
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error("Not authenticated");
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("logos")
          .upload(`${user.data.user.id}/logo.png`, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("logos")
          .getPublicUrl(`${user.data.user.id}/logo.png`);
        uploadedLogoUrl = publicUrlData.publicUrl;
        setLogoUrl(uploadedLogoUrl);
      }
      // Call server action to upsert profile with logo_url
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });
      if (uploadedLogoUrl) formData.set("logo_url", uploadedLogoUrl);
      await upsertProfile(formData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" {...form.register("company_name")} />
              {form.formState.errors.company_name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.company_name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ein">
                  EIN (Employer Identification Number)
                </Label>
                <Input
                  id="ein"
                  placeholder="XX-XXXXXXX"
                  {...form.register("ein")}
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
                  {...form.register("tax_number")}
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
              <Input id="bank_name" {...form.register("bank_name")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_number">
                  Account Number (Optional)
                </Label>
                <Input
                  id="account_number"
                  type="password"
                  {...form.register("account_number")}
                />
              </div>
              <div>
                <Label htmlFor="routing_number">
                  Routing Number (Optional)
                </Label>
                <Input
                  id="routing_number"
                  {...form.register("routing_number")}
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
              <Input id="address_line_1" {...form.register("address_line_1")} />
            </div>
            <div>
              <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
              <Input id="address_line_2" {...form.register("address_line_2")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City (Optional)</Label>
                <Input id="city" {...form.register("city")} />
              </div>
              <div>
                <Label htmlFor="state">State (Optional)</Label>
                <Input id="state" {...form.register("state")} />
              </div>
              <div>
                <Label htmlFor="zip_code">ZIP Code (Optional)</Label>
                <Input id="zip_code" {...form.register("zip_code")} />
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
                {logoUrl && (
                  <img
                    src={logoUrl}
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
