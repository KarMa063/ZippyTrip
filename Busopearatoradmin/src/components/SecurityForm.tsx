
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SecurityForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('password-', '')]: value
    }));

    // Clear error when typing
    if (errors[id.replace('password-', '')]) {
      setErrors(prev => ({
        ...prev,
        [id.replace('password-', '')]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Here we'd typically submit the form data to an API
      // For this example, we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset the form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your password.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password-currentPassword">Current password</Label>
        <Input 
          id="password-currentPassword" 
          type="password" 
          value={formData.currentPassword}
          onChange={handleInputChange}
          className={`bg-zippy-darkGray border-zippy-gray ${errors.currentPassword ? 'border-red-500' : ''}`}
        />
        {errors.currentPassword && (
          <p className="text-sm text-red-500">{errors.currentPassword}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-newPassword">New password</Label>
        <Input 
          id="password-newPassword" 
          type="password" 
          value={formData.newPassword}
          onChange={handleInputChange}
          className={`bg-zippy-darkGray border-zippy-gray ${errors.newPassword ? 'border-red-500' : ''}`}
        />
        {errors.newPassword && (
          <p className="text-sm text-red-500">{errors.newPassword}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-confirmPassword">Confirm password</Label>
        <Input 
          id="password-confirmPassword" 
          type="password" 
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className={`bg-zippy-darkGray border-zippy-gray ${errors.confirmPassword ? 'border-red-500' : ''}`}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword}</p>
        )}
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
            Updating...
          </span>
        ) : (
          <span className="flex items-center">
            <Key className="mr-2 h-4 w-4" />
            Update Password
          </span>
        )}
      </Button>
    </form>
  );
};

export default SecurityForm;
