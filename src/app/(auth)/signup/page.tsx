import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        <SignupForm />
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-gray-500">Or</span>
            </div>
          </div>
          <Link href="/app" className="block">
            <Button variant="outline" className="w-full">
              Continue without login
            </Button>
          </Link>
          <p className="text-center text-xs text-gray-500">
            You can browse places and reviews without an account
          </p>
        </div>
      </div>
    </div>
  );
}

