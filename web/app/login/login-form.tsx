import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { handleLogin, signIn, signUp } from "@/app/login/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";

// const formSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(8, "Password must be at least 8 characters"),
// });

// type LoginData = {
//   email: string;
//   password: string;
// };

const LoginForm = () => {
  //   const form = useForm<z.infer<typeof formSchema>>({
  //     resolver: zodResolver(formSchema),
  //     defaultValues: {
  //       email: "",
  //       password: "",
  //     },
  //   });

  //   const onSubmit = async (data: LoginData) => {
  //     try {
  //       await handleLogin(data);
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   };

  return (
    <form className="space-y-5 w-full">
      {/* <FormField
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Enter your email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}
      {/* <FormField
          control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type={"password"}
                placeholder="Enter your password"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}

      <div className="flex flex-col gap-2">
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-2"
          name="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="flex flex-col">
        <label className="text-md mb-1" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
      </div>

      <Button
        className="w-full bg-purple-500"
        type="submit"
        formAction={signIn}
      >
        Log in
      </Button>
      <Button
        className="border border-foreground/20 rounded-md px-4 py-2 mb-2 w-full"
        type="submit"
        formAction={signUp}
      >
        Sign up
      </Button>
    </form>
  );
};

export default LoginForm;
