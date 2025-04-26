
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileForm } from "./ProfileForm";
import { DeleteAccount } from "./DeleteAccount";

interface ProfileFormState {
  name: string;
  email: string;
  bio: string;
  language: string;
}

export function ProfileTab() {
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: "",
    email: "",
    bio: "",
    language: "vietnamese"
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setProfileForm(prev => ({
          ...prev,
          name: user.user_metadata?.name || user.email?.split('@')[0] || "",
          email: user.email || "",
          bio: user.user_metadata?.bio || ""
        }));
      }
    };

    fetchUserDetails();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileLanguageChange = (value: string) => {
    setProfileForm(prev => ({ ...prev, language: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profileForm.name,
          bio: profileForm.bio
        }
      });

      if (error) throw error;

      toast({
        title: "Thông tin cá nhân đã được cập nhật",
        description: "Thông tin của bạn đã được lưu thành công."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <ProfileForm
        profileForm={profileForm}
        onSubmit={handleProfileSubmit}
        onChange={handleProfileChange}
        onLanguageChange={handleProfileLanguageChange}
      />
      <DeleteAccount />
    </div>
  );
}
