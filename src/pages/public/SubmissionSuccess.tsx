import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

const SubmissionSuccess = () => {
    const location = useLocation();
    const state = location.state as {
        id: string;
        formName: string;
        slaDeadline: string;
        type: string;
    } | undefined;

    if (!state) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="container max-w-lg py-16 px-4 mx-auto min-h-[60vh] flex flex-col justify-center items-center pt-32">
            <Card className="w-full text-center border-2 border-primary/10 shadow-lg">
                <CardHeader className="items-center pb-2">
                    <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-500">
                        Submission Successful!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <p className="text-muted-foreground">
                        Thank you for your request. We have received your details for <strong>{state.formName}</strong>.
                    </p>

                    <div className="text-sm space-y-1">
                        <span className="text-muted-foreground">Expected Response:</span>
                        <div className="font-medium text-foreground">In a week</div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-2">
                    <Link to="/" className="w-full">
                        <Button variant="ghost" className="w-full text-muted-foreground">
                            Back to Home
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SubmissionSuccess;
