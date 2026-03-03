export interface Submission {
    submissionId: string;
    formName: string;
    createdAt: string;
    status: string;
    slaDeadline?: string;
    slaHours?: number;
    priority?: "normal" | "high" | "urgent";
    type?: "loan" | "contact";
    loanType?: string;
    payload: any;
    comments?: {
        id: string;
        text: string;
        authorId: string;
        authorName: string;
        createdAt: string;
    }[];
}
