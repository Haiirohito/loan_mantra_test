import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Plus, Download } from "lucide-react";
import CalculatorInput from "@/components/CalculatorInput";


interface YearlyBreakdown {
  year: number;
  investedAmount: number;
  interestEarned: number;
  totalAmount: number;
}

type CompoundingFrequency = "annually" | "quarterly" | "monthly" | "daily";

const CompoundInterestCalculator = () => {
  const navigate = useNavigate();
  const [totalInvestment, setTotalInvestment] = useState(25000);
  const [expectedROI, setExpectedROI] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>("annually");
  const [yearlyBreakdown, setYearlyBreakdown] = useState<YearlyBreakdown[]>([]);

  // Get compounding periods per year
  const getCompoundingPeriodsPerYear = (frequency: CompoundingFrequency) => {
    switch (frequency) {
      case "annually": return 1;
      case "quarterly": return 4;
      case "monthly": return 12;
      case "daily": return 365;
      default: return 1;
    }
  };

  // Calculate compound interest
  const results = useMemo(() => {
    const principal = totalInvestment;
    const rate = expectedROI / 100;
    const time = timePeriod;
    const n = getCompoundingPeriodsPerYear(compoundingFrequency);

    // Compound Interest Formula: A = P(1 + r/n)^(nt)
    const amount = principal * Math.pow(1 + rate / n, n * time);
    const interestEarned = amount - principal;

    return {
      totalInvestment: principal,
      interestEarned: Math.round(interestEarned),
      maturityAmount: Math.round(amount),
    };
  }, [totalInvestment, expectedROI, timePeriod, compoundingFrequency]);

  // Calculate yearly breakdown
  useEffect(() => {
    const principal = totalInvestment;
    const rate = expectedROI / 100;
    const n = getCompoundingPeriodsPerYear(compoundingFrequency);
    const breakdown: YearlyBreakdown[] = [];

    for (let year = 1; year <= timePeriod; year++) {
      const amount = principal * Math.pow(1 + rate / n, n * year);
      const interest = amount - principal;

      breakdown.push({
        year: 2024 + year,
        investedAmount: principal,
        interestEarned: Math.round(interest),
        totalAmount: Math.round(amount),
      });
    }

    setYearlyBreakdown(breakdown);
  }, [totalInvestment, expectedROI, timePeriod, compoundingFrequency]);

  const downloadYearlyCsv = () => {
    if (!yearlyBreakdown || yearlyBreakdown.length === 0) return;

    // CSV header
    const header = ["Year", "Principal (₹)", "Interest Earned (₹)", "Total Amount (₹)"];

    // Rows: use raw numbers (rounded) without commas so CSV parses cleanly
    const rows = yearlyBreakdown.map(r => [
      r.year,
      Math.round(r.investedAmount),
      Math.round(r.interestEarned),
      Math.round(r.totalAmount),
    ]);

    const csvLines = [header, ...rows].map(cols => cols.join(",")).join("\n");
    const blob = new Blob([csvLines], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compound-yearly-breakdown.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Compound Interest <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-4xl mx-auto">
              Calculate the future value of your investment with compound interest.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Calculator */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Tabs value={compoundingFrequency} onValueChange={(value) => setCompoundingFrequency(value as CompoundingFrequency)}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="annually">Annually</TabsTrigger>
                      <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="daily">Daily</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CalculatorInput
                    label="Total Investment"
                    value={totalInvestment}
                    onValueChange={setTotalInvestment}
                    min={500}
                    max={10000000}
                    step={500}
                    type="currency"
                  />

                  <CalculatorInput
                    label="Expected ROI (p.a)"
                    value={expectedROI}
                    onValueChange={setExpectedROI}
                    min={1}
                    max={30}
                    step={0.5}
                    type="percent"
                  />

                  <CalculatorInput
                    label="Time Period"
                    value={timePeriod}
                    onValueChange={setTimePeriod}
                    min={1}
                    max={30}
                    step={1}
                    type="years"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-accent/20">
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Total investment</p>
                      <p className="text-xl font-bold">₹ {results.totalInvestment.toLocaleString('en-IN')}</p>
                    </div>
                    <Plus className="w-6 h-6 text-muted-foreground flex-shrink-0 mx-4" />
                    <div className="text-center flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Profit</p>
                      <p className="text-xl font-bold text-secondary">₹ {results.interestEarned.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary mb-1">
                      ₹ {results.maturityAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground">Maturity Amount</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>
                      Your investment will grow by{" "}
                      <span className="font-semibold text-foreground">
                        {((results.interestEarned / results.totalInvestment) * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Yearly Breakdown Table */}
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Year-by-Year Breakdown</CardTitle>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadYearlyCsv}
                aria-label="Export Yearly Breakdown as CSV"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Year</TableHead>
                      <TableHead className="text-right">Principal Amount(₹)</TableHead>
                      <TableHead className="text-right">Interest Earned(₹)</TableHead>
                      <TableHead className="text-right">Total Amount(₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyBreakdown.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell className="font-medium">{row.year}</TableCell>
                        <TableCell className="text-right">₹ {row.investedAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-secondary">₹ {row.interestEarned.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-semibold">₹ {row.totalAmount.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card className="mt-8 p-6 bg-accent/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              About this calculator
            </h2>

            <p className="text-muted-foreground">
              Compound interest represents the growth of an investment when the returns generated each period are added back to the principal. This creates a “snowball effect,” where both the original amount and previous interest earn additional returns.
            </p>

            <p className="text-muted-foreground mt-4">
              The key factors influencing compounding are the interest rate, the compounding frequency, and the investment duration. Even small differences in these inputs can significantly change the maturity value, making compound interest one of the most effective long-term wealth-building mechanisms.
            </p>

            <p className="text-muted-foreground mt-4">
              This calculator helps you compare different compounding frequencies, assess the impact of return rates, and understand how your investment grows year by year using effective annual yield (APY) and detailed balance progression.
            </p>
          </Card>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground text-sm">
          <p>© 2025 LoanMantrra. All rights reserved.</p>
          <p className="mt-2">Connecting you with trusted financial institutions across India.</p>
        </div>
      </footer>
    </div>
  );
};

export default CompoundInterestCalculator;
