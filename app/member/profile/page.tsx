"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ESS_PROFILE } from "@/lib/graphql/queries";
import { formatDate } from "@/lib/utils";
import { User, Phone, Mail, MapPin, Building2, Calendar, Hash, Briefcase } from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function MemberProfilePage() {
  const { data, loading, error } = useQuery(GET_ESS_PROFILE);
  const member = data?.essProfile;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" />;
  }

  if (!member) {
    return <ErrorDisplay variant="full-page" title="Not Found" message="Profile data is not available." />;
  }

  const fullName = [member.firstName, member.middleName, member.lastName].filter(Boolean).join(" ");

  const sections = [
    {
      title: "Personal Information",
      items: [
        { icon: User, label: "Full Name", value: fullName },
        { icon: Hash, label: "Member Number", value: member.memberNumber },
        { icon: Calendar, label: "Date of Birth", value: member.dateOfBirth ? formatDate(member.dateOfBirth) : "-" },
        { icon: User, label: "Gender", value: member.gender || "-" },
        { icon: Hash, label: "National ID", value: member.nationalId || "-" },
      ],
    },
    {
      title: "Contact Information",
      items: [
        { icon: Phone, label: "Phone Number", value: member.phoneNumber || "-" },
        { icon: Mail, label: "Email", value: member.email || "-" },
        { icon: MapPin, label: "Address", value: member.address || "-" },
      ],
    },
    {
      title: "Membership Details",
      items: [
        { icon: Calendar, label: "Membership Date", value: member.membershipDate ? formatDate(member.membershipDate) : "-" },
        { icon: Hash, label: "Shares", value: member.shares?.toString() || "0" },
        { icon: Building2, label: "Branch", value: member.branch?.branchName || "-" },
        { icon: User, label: "Status", value: member.status || "-" },
      ],
    },
    ...(member.employer ? [{
      title: "Employment Information",
      items: [
        { icon: Briefcase, label: "Employer", value: member.employer.employerName },
        { icon: Hash, label: "Employee Number", value: member.employeeNumber || "-" },
        { icon: Building2, label: "Department", value: member.department || "-" },
      ],
    }] : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {member.firstName?.[0]}{member.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <p className="text-sm opacity-90 mt-0.5">Member #{member.memberNumber}</p>
            {member.employer && (
              <p className="text-sm opacity-80">{member.employer.employerName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
