import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ElementType;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = "No data found",
    description = "There are no items to display at this time.",
    actionLabel,
    onAction,
    icon: Icon = FolderOpen,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in-50">
            <div className="bg-muted/30 p-4 rounded-full mb-4">
                <Icon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button variant="outline" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
