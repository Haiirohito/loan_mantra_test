import React from "react";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    FileText,
    Briefcase,
    PlayCircle,
    Send
} from "lucide-react";

interface StatusBadgeProps {
    status?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status = "received" }) => {
    const getStyle = (s: string) => {
        switch (s) {
            case "received":
            case "submitted":
                return { variant: "secondary" as const, icon: Send, label: "Received" };
            case "contacted":
                return { variant: "outline" as const, icon: PhoneIcon, label: "Contacted" };
            case "assigned":
                return { variant: "default" as const, icon: Briefcase, label: "Assigned" };
            case "in_progress":
            case "working":
                return { variant: "warning" as const, icon: PlayCircle, label: "In Progress", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200" };
            case "docs_requested":
                return { variant: "outline" as const, icon: FileText, label: "Docs Requested", className: "border-blue-200 text-blue-700 bg-blue-50" };
            case "done":
            case "approved":
            case "closed":
                return { variant: "success" as const, icon: CheckCircle2, label: "Done", className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" };
            case "rejected":
            case "escalated":
                return { variant: "destructive" as const, icon: XCircle, label: "Rejected" };
            default:
                return { variant: "outline" as const, icon: AlertCircle, label: s };
        }
    };

    // Helper workaround for lucide icons that might not be imported or special handling
    const PhoneIcon = ({ className }: { className?: string }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );

    const style = getStyle(status);
    const Icon = style.icon === PhoneIcon ? PhoneIcon : style.icon;

    return (
        <Badge
            variant={style.variant === "success" || style.variant === "warning" ? "outline" : style.variant}
            className={`gap-1.5 pr-2.5 ${style.className || ""}`}
        >
            <Icon className="h-3.5 w-3.5" />
            <span className="capitalize">{style.label || status}</span>
        </Badge>
    );
};

export default StatusBadge;
