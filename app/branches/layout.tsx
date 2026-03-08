import AuthLayout from "@/components/AuthLayout";
import { ReactNode } from "react";

export default function BranchesLayout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
