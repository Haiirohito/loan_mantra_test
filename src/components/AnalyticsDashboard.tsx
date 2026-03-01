import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Submission } from "@/lib/types";

// Colors for Pie Chart status
const STATUS_COLORS: Record<string, string> = {
    submitted: "#94a3b8", // gray
    assigned: "#3b82f6", // blue
    contacted: "#60a5fa", // lighter blue
    working: "#facc15", // yellow
    done: "#22c55e", // green
    rejected: "#ef4444", // red
    escalated: "#b91c1c", // dark red
    docs_requested: "#8b5cf6" // purple
};

const DEFAULT_COLOR = "#cbd5e1";

interface AnalyticsDashboardProps {
    submissions: Submission[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ submissions }) => {
    // 1. Status Distribution
    const statusCounts = submissions.reduce((acc, curr) => {
        const s = curr.status || "unknown";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
    }));

    // 2. Volume over Time (Last 7 days approx)
    // Simplified by grouping by date string
    const dateCounts = submissions.reduce((acc, curr) => {
        const d = new Date(curr.createdAt).toLocaleDateString();
        acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const volumeData = Object.entries(dateCounts)
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .slice(-7) // last 7 days with data
        .map(([date, count]) => ({ date, count }));

    // 3. Agent Performance (Assigned vs Done)
    // Group by assignedTo
    const agentPerf = submissions.reduce((acc, curr) => {
        const agent = curr.assignedTo || "Unassigned";
        if (!acc[agent]) acc[agent] = { name: agent, total: 0, done: 0 };
        acc[agent].total += 1;
        if (curr.status === "done" || curr.status === "approved") {
            acc[agent].done += 1;
        }
        return acc;
    }, {} as Record<string, any>);

    const agentData = Object.values(agentPerf).filter(a => a.name !== "Unassigned");

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Overview Cards */}
            <Card className="col-span-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Total Leads</CardTitle>
                    <CardDescription>All time volume</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{submissions.length}</div>
                    <p className="text-muted-foreground text-xs mt-2">
                        +{(statusCounts["submitted"] || 0)} new
                    </p>
                </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Conversion Rate</CardTitle>
                    <CardDescription>Leads marked as Done</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">
                        {submissions.length ? Math.round(((statusCounts["done"] || 0) / submissions.length) * 100) : 0}%
                    </div>
                    <p className="text-muted-foreground text-xs mt-2">
                        {(statusCounts["done"] || 0)} closed deals
                    </p>
                </CardContent>
            </Card>

            <div className="col-span-3 lg:col-span-3"></div>

            {/* Charts */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Leads by Status</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || DEFAULT_COLOR} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Agent Performance</CardTitle>
                    <CardDescription>Leads Assigned vs Closed</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={agentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={10} tickFormatter={(val) => val.substring(0, 8)} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#8884d8" name="Total Assigned" />
                                <Bar dataKey="done" fill="#82ca9d" name="Closed Won" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-7">
                <CardHeader>
                    <CardTitle>Volume Trend (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" name="New Submissions" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;
