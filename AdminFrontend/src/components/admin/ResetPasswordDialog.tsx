
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ResetPasswordDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Form validation schema
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(6, "Password must be at least 6 characters long")
    .max(72, "Password cannot exceed 72 characters"),
  confirmPassword: z.string()
});

const resetPasswordFormSchema = resetPasswordSchema.refine(
  (data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export function ResetPasswordDialog({ userId, userName, open, onOpenChange }: ResetPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof resetPasswordFormSchema>) {
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.functions.invoke("admin-reset-password", {
        body: {
          userId,
          newPassword: data.newPassword,
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to reset password");
      }
      
      toast.success(`Password for ${userName} has been reset successfully`);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Set a new password for <span className="font-medium">{userName}</span>.
            The user will need to use this password for their next login.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        {...field} 
                        placeholder="Enter new password"
                        className="pr-10"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        {...field} 
                        placeholder="Confirm new password" 
                        className="pr-10"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-zippy-blue hover:bg-zippy-blue/90"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
