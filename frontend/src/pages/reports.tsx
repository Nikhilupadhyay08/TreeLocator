import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { useListReports } from "@/api";
import { ReportReportType, ReportStatus } from "@/api";

const REPORT_TYPES = [
  { value: "", label: "All Types" },
  { value: "plantation", label: "Plantation" },
  { value: "cutting", label: "Tree Cutting" },
  { value: "illegal_cutting", label: "Illegal Cutting" },
  { value: "survival_check", label: "Survival Check" },
];

const REPORT_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const STATES = [
  "", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

function ReportTypeBadge({ type }: { type: ReportReportType }) {
  const colors: Record<string, string> = {
    plantation: "bg-blue-100 text-blue-800 border-blue-200",
    cutting: "bg-orange-100 text-orange-800 border-orange-200",
    illegal_cutting: "bg-red-100 text-red-800 border-red-200",
    survival_check: "bg-purple-100 text-purple-800 border-purple-200",
  };
  const labels: Record<string, string> = {
    plantation: "Plantation",
    cutting: "Cutting",
    illegal_cutting: "Illegal Cutting",
    survival_check: "Survival Check",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${colors[type] ?? "bg-muted text-muted-foreground"}`}>
      {labels[type] || type}
    </span>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    verified: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function Reports() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  // Redirect non-admin users
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    setLocation("/");
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Access Denied. Redirecting...</p>
      </div>
    );
  }

  // Redirect admins to admin panel reports section
  setLocation("/admin?tab=reports");
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <p className="text-muted-foreground">Redirecting to Admin Panel...</p>
    </div>
  );
}
