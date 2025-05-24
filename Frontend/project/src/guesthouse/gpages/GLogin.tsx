import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "../gcomponents/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../gcomponents/form";
import { Input } from "../gcomponents/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../gcomponents/card";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

// List of allowed guesthouse owner emails and passwords
const ALLOWED_CREDENTIALS = [
  { email: "zippytrip101@gmail.com", password: "zippy123" }
]

const GLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
  setIsLoading(true);
  setAuthError(null);

  try {
    const isValidUser = ALLOWED_CREDENTIALS.find(
      (cred) => cred.email === data.email && cred.password === data.password
    );

    if (!isValidUser) {
      setAuthError("Invalid email or password.");
      toast.error("Unauthorized access attempt");
      return;
    }

    setTimeout(() => {
      localStorage.setItem("guesthouseOwner", JSON.stringify({
        email: data.email,
        role: "guesthouse_owner",
      }));

      toast.success("Login successful. Welcome back!");
      navigate("/gdashboard");
    }, 1000);
  } catch (error) {
    toast.error("Login failed. Please check your credentials.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b bg-card shadow z-40">
        <div className="flex h-16 items-center px-6">
          <Link to="/home" className="flex items-center gap-2 font-bold text-lg">
            <div className="text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              ZippyTrip
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg border border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Guesthouse Login</CardTitle>
            <CardDescription className="text-center">
              Only for registered guesthouse owners
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {authError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {authError}
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your mail"
                            className="pl-10"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="******"
                            className="pl-10"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {isLoading ? "Logging in..." : "Log in"}
                  </span>
                </Button>
              </form>
            </Form>
          </CardContent>

        </Card>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          © {new Date().getFullYear()} ZippyTrip. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default GLogin;