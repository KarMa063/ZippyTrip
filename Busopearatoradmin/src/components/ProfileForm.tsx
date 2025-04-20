
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Trash, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, uploadProfileImage, UserProfile } from "@/services/profile";

interface ProfileFormProps {
  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    bio: string;
    avatarUrl?: string;
  };
}

const ProfileForm = ({ initialData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  bio: '',
} }: ProfileFormProps) => {
  const [formData, setFormData] = useState(initialData);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(initialData.avatarUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          if (profile) {
            setFormData({
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              email: user.email || '',
              phone: profile.phone || '',
              jobTitle: '',
              bio: '',
              avatarUrl: profile.avatar_url
            });
            setAvatarPreview(profile.avatar_url);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('profile-', '')]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Upload avatar if selected
      let avatarUrl = avatarPreview;
      if (avatar) {
        const uploadedUrl = await uploadProfileImage(user.id, avatar);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }
      
      // Update profile data
      await updateUserProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        avatar_url: avatarUrl
      });

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      // Refresh the page to update the avatar in the header
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your profile.",
        variant: "destructive"
      });
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20 border-2 border-zippy-gray">
          {avatarPreview ? (
            <AvatarImage src={avatarPreview} alt="Profile" className="object-cover" />
          ) : (
            <AvatarFallback className="bg-zippy-purple text-white text-xl">
              {formData.firstName && formData.lastName 
                ? `${formData.firstName[0]}${formData.lastName[0]}`
                : 'OP'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              className="bg-zippy-gray border-zippy-lightGray relative"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </Button>
            {avatarPreview && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleRemoveAvatar}
                className="text-destructive bg-zippy-gray border-zippy-lightGray hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF. Max size 2MB.
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-firstName">First name</Label>
          <Input 
            id="profile-firstName" 
            value={formData.firstName} 
            onChange={handleInputChange} 
            placeholder="John" 
            className="bg-zippy-darkGray border-zippy-gray" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-lastName">Last name</Label>
          <Input 
            id="profile-lastName" 
            value={formData.lastName} 
            onChange={handleInputChange} 
            placeholder="Doe" 
            className="bg-zippy-darkGray border-zippy-gray" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profile-email">Email address</Label>
        <Input 
          id="profile-email" 
          type="email" 
          value={formData.email} 
          onChange={handleInputChange}
          placeholder="john.doe@example.com" 
          className="bg-zippy-darkGray border-zippy-gray" 
          disabled
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profile-phone">Phone number</Label>
        <Input 
          id="profile-phone" 
          type="tel" 
          value={formData.phone} 
          onChange={handleInputChange}
          placeholder="+1 (555) 000-0000" 
          className="bg-zippy-darkGray border-zippy-gray" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profile-jobTitle">Job title</Label>
        <Input 
          id="profile-jobTitle" 
          value={formData.jobTitle} 
          onChange={handleInputChange}
          placeholder="Fleet Manager" 
          className="bg-zippy-darkGray border-zippy-gray" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profile-bio">Bio</Label>
        <Textarea 
          id="profile-bio" 
          value={formData.bio} 
          onChange={handleInputChange}
          placeholder="I manage the fleet operations and route scheduling for ZippyTrip" 
          className="min-h-32 bg-zippy-darkGray border-zippy-gray"
        />
      </div>

      <Button 
        type="submit" 
        className="bg-zippy-purple hover:bg-zippy-darkPurple"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
        ) : (
          <span className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </span>
        )}
      </Button>
    </form>
  );
};

export default ProfileForm;
