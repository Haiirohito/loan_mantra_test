export interface Submission {
    submissionId: string;
    formName: string;
    createdAt: string;
    status: string;
    assignedTo?: string | null;
    assignedAt?: string | null;
    slaDeadline?: string;
    slaHours?: number;
    priority?: "normal" | "high" | "urgent";
    type?: "loan" | "contact";
    loanType?: string;
    payload: any;
    tasks?: any[];
    lastModifiedAt?: string;
    lastModifiedBy?: string | null;
    escalated?: boolean;
    comments?: {
        id: string;
        text: string;
        authorId: string;
        authorName: string;
        createdAt: string;
    }[];
}
