import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Plus } from "lucide-react";
import CalculatorInput from "@/components/CalculatorInput";

interface YearlyBreakdown {
  year: number;
  investedAmount: number;
  wealthGained: number;
  expectedAmount: number;
}

const SIPCalculator = () => {
  const navigate = useNavigate();
  const [investmentType, setInvestmentType] = useState<"monthly" | "lumpsum">("monthly");
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [timePeriod, setTimePeriod] = useState(10);
  const [expectedROI, setExpectedROI] = useState(12);
  const [yearlyBreakdown, setYearlyBreakdown] = useState<YearlyBreakdown[]>([]);

  // Calculate results using useMemo to avoid re-renders
  const results = useMemo(() => {
    const monthlyRate = expectedROI / 12 / 100;
    const months = timePeriod * 12;

    if (investmentType === "monthly") {
      const futureValue = monthlyInvestment *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);

      const totalInvestment = monthlyInvestment * months;
      const wealthGained = futureValue - totalInvestment;

      return {
        totalInvestment: Math.round(totalInvestment),
        wealthGained: Math.round(wealthGained),
        currentValue: Math.round(futureValue),
      };
    } else {
      const futureValue = lumpsumAmount * Math.pow(1 + monthlyRate, months);
      const wealthGained = futureValue - lumpsumAmount;

      return {
        totalInvestment: lumpsumAmount,
        wealthGained: Math.round(wealthGained),
        currentValue: Math.round(futureValue),
      };
    }
  }, [monthlyInvestment, lumpsumAmount, timePeriod, expectedROI, investmentType]);

  // Calculate yearly breakdown separately
  useEffect(() => {
    const monthlyRate = expectedROI / 12 / 100;
    const breakdown: YearlyBreakdown[] = [];

    if (investmentType === "monthly") {
      for (let year = 1; year <= timePeriod; year++) {
        const monthsElapsed = year * 12;
        const yearFutureValue = monthlyInvestment *
          ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate) *
          (1 + monthlyRate);
        const yearInvestedAmount = monthlyInvestment * monthsElapsed;
        const yearWealthGained = yearFutureValue - yearInvestedAmount;

        breakdown.push({
          year: 2024 + year,
          investedAmount: Math.round(yearInvestedAmount),
          wealthGained: Math.round(yearWealthGained),
          expectedAmount: Math.round(yearFutureValue),
        });
      }
    } else {
      for (let year = 1; year <= timePeriod; year++) {
        const monthsElapsed = year * 12;
        const yearFutureValue = lumpsumAmount * Math.pow(1 + monthlyRate, monthsElapsed);
        const yearWealthGained = yearFutureValue - lumpsumAmount;

        breakdown.push({
          year: 2024 + year,
          investedAmount: lumpsumAmount,
          wealthGained: Math.round(yearWealthGained),
          expectedAmount: Math.round(yearFutureValue),
        });
      }
    }

    setYearlyBreakdown(breakdown);
  }, [monthlyInvestment, lumpsumAmount, timePeriod, expectedROI, investmentType]);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              SIP <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-4xl mx-auto">
              This SIP Calculator helps you estimate the future value of your mutual fund investments based on your monthly SIP or lumpsum contributions. By adjusting tenure and expected returns, you can understand how much wealth you may accumulate and how much of your corpus comes from disciplined investing versus market growth.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Calculator */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Tabs value={investmentType} onValueChange={(value) => setInvestmentType(value as "monthly" | "lumpsum")}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="monthly">Monthly Investment</TabsTrigger>
                      <TabsTrigger value="lumpsum">Lumpsum</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="space-y-8">
                  {investmentType === "monthly" ? (
                    <CalculatorInput
                      label="Monthly Investment"
                      value={monthlyInvestment}
                      onValueChange={setMonthlyInvestment}
                      min={500}
                      max={100000}
                      step={500}
                      type="currency"
                    />
                  ) : (
                    <CalculatorInput
                      label="Lumpsum Amount"
                      value={lumpsumAmount}
                      onValueChange={setLumpsumAmount}
                      min={10000}
                      max={10000000}
                      step={10000}
                      type="currency"
                    />
                  )}

                  <CalculatorInput
                    label="Time Period"
                    value={timePeriod}
                    onValueChange={setTimePeriod}
                    min={1}
                    max={30}
                    step={1}
                    type="years"
                  />

                  <CalculatorInput
                    label="Expected ROI"
                    value={expectedROI}
                    onValueChange={setExpectedROI}
                    min={1}
                    max={30}
                    step={0.5}
                    type="percent"
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
                      <p className="text-xl font-bold text-secondary">₹ {results.wealthGained.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary mb-1">
                      ₹ {results.currentValue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground">Current value of investment</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>
                      Your investment will grow by{" "}
                      <span className="font-semibold text-foreground">
                        {((results.wealthGained / results.totalInvestment) * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Yearly Breakdown Table */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Year-by-Year Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Year</TableHead>
                      <TableHead className="text-right">Invested Amount(₹)</TableHead>
                      <TableHead className="text-right">Wealth Gained(₹)</TableHead>
                      <TableHead className="text-right">Expected Amount(₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyBreakdown.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell className="font-medium">{row.year}</TableCell>
                        <TableCell className="text-right">₹ {row.investedAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-secondary">₹ {row.wealthGained.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-semibold">₹ {row.expectedAmount.toLocaleString('en-IN')}</TableCell>
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
              Systematic Investment Plans (SIPs) are designed to help investors build long-term wealth through consistent contributions and the benefit of compounding. This calculator provides a clear breakdown of how your investments grow over time and how market returns impact your overall portfolio.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">What This Calculator Helps You See</h3>
            <ul className="text-muted-foreground space-y-2 list-disc px-4">
              <li>Total amount you invest versus total wealth created.</li>
              <li>Year-by-year growth to help set realistic long-term expectations.</li>
              <li>Impact of tenure and return assumptions on your maturity amount.</li>
              <li>Difference between SIP investing and lumpsum investing behaviour.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-2">Key Insights for Investors</h3>
            <ul className="text-muted-foreground space-y-2 list-disc px-4">
              <li>Longer investment horizons significantly increase compounding benefits.</li>
              <li>Consistent SIPs help reduce the impact of market volatility.</li>
              <li>Even small increases in ROI or tenure can meaningfully change outcomes.</li>
              <li>Reviewing projections regularly helps in goal-based planning.</li>
            </ul>

            <p className="text-xs text-muted-foreground mt-6">
              <strong>Disclaimer:</strong> These projections are estimates based on assumed return rates and do not guarantee future performance. Actual results may vary.
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

export default SIPCalculator;
