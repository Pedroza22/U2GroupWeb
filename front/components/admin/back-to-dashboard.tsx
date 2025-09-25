"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackToDashboardProps {
  className?: string;
}

export default function BackToDashboard({ className = "" }: BackToDashboardProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push('/admin/dashboard')}
      className={`flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${className}`}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Dashboard
    </Button>
  );
}
