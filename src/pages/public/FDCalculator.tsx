import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import CalculatorInput from "@/components/CalculatorInput";

type CompoundingFrequency = "monthly" | "quarterly" | "half-yearly" | "yearly";

const FDCalculator = () => {
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState(100000);
  const [tenure, setTenure] = useState(5);
  const [interestRate, setInterestRate] = useState(7);
  const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>("quarterly");

  const getCompoundingPeriodsPerYear = (frequency: CompoundingFrequency): number => {
    switch (frequency) {
      case "monthly": return 12;
      case "quarterly": return 4;
      case "half-yearly": return 2;
      case "yearly": return 1;
    }
  };

  const calculateFD = useMemo(() => {
    const principal = depositAmount;
    const rate = interestRate / 100;
    const time = tenure;
    const n = getCompoundingPeriodsPerYear(compoundingFrequency);

    // Formula: A = P(1 + r/n)^(nt)
    const maturityAmount = principal * Math.pow(1 + rate / n, n * time);
    const interestEarned = maturityAmount - principal;

    return {
      maturityAmount: Math.round(maturityAmount),
      investedAmount: principal,
      interestEarned: Math.round(interestEarned),
    };
  }, [depositAmount, tenure, interestRate, compoundingFrequency]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Fixed Deposit <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-4xl mx-auto">
              Estimate FD maturity and returns quickly. Enter amount, tenure, rate and compounding frequency to view a concise breakdown.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            {/* Left Section - Inputs */}
            <div className="lg:col-span-2 flex flex-col gap-6">


              <Card className="border-border h-full flex flex-col">
                <CardContent className="pt-6 space-y-8 flex-1">
                  <CalculatorInput
                    label="Deposit Amount"
                    value={depositAmount}
                    onValueChange={setDepositAmount}
                    min={5000}
                    max={10000000}
                    step={5000}
                    type="currency"
                  />

                  <CalculatorInput
                    label="Tenure"
                    value={tenure}
                    onValueChange={setTenure}
                    min={1}
                    max={25}
                    step={1}
                    type="years"
                  />

                  <CalculatorInput
                    label="Rate of Interest"
                    value={interestRate}
                    onValueChange={setInterestRate}
                    min={1}
                    max={15}
                    step={0.1}
                    type="percent"
                  />
                </CardContent>
              </Card>

              <Card className="border-border h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">Compounding Frequency</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <Tabs value={compoundingFrequency} onValueChange={(value) => setCompoundingFrequency(value as CompoundingFrequency)}>
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="half-yearly">Half Yearly</TabsTrigger>
                      <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Results */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* Maturity Value Card */}
              <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground">Maturity Value</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-4xl font-bold text-primary">{formatCurrency(calculateFD.maturityAmount)}</div>
                </CardContent>
              </Card>

              {/* Investment Breakdown */}
              <Card className="border-border h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">Investment Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Amount Invested</span>
                    <span className="text-lg font-semibold text-foreground">{formatCurrency(calculateFD.investedAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Interest Earned</span>
                    <span className="text-lg font-semibold text-primary">{formatCurrency(calculateFD.interestEarned)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-muted-foreground font-semibold">Maturity Value</span>
                    <span className="text-xl font-bold text-foreground">{formatCurrency(calculateFD.maturityAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Representation */}
              <Card className="border-border h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">Investment vs Returns</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    {/* Principal Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Principal Amount</span>
                        <span className="font-semibold text-foreground">{formatCurrency(calculateFD.investedAmount)}</span>
                      </div>
                      <div className="h-8 bg-secondary rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-secondary transition-all duration-500"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>

                    {/* Interest Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Interest Earned</span>
                        <span className="font-semibold text-primary">{formatCurrency(calculateFD.interestEarned)}</span>
                      </div>
                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: `${(calculateFD.interestEarned / Math.max(1, calculateFD.maturityAmount)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{((calculateFD.interestEarned / calculateFD.investedAmount) * 100).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground mt-1">Total Returns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{tenure} {tenure === 1 ? 'Year' : 'Years'}</div>
                      <div className="text-sm text-muted-foreground mt-1">Investment Period</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info Section */}
          <Card className="mt-8 p-6 bg-accent/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">About this calculator</h2>

            <p className="text-muted-foreground">
              This calculator provides an estimate of your fixed deposit maturity based on the inputs provided. Use the outputs for planning; they are not investment advice.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">At a glance</h3>
            <ul className="text-muted-foreground space-y-2 list-disc px-4">
              <li>Final maturity amount and the interest component.</li>
              <li>Effect of compounding frequency on returns.</li>
              <li>Quick sensitivity: change tenure or rate to see impact instantly.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-2">Practical notes</h3>
            <ul className="text-muted-foreground space-y-2 list-disc px-4">
              <li>Results assume constant annual interest and periodic compounding.</li>
              <li>Taxation, premature withdrawals and bank-specific rules are not modelled here.</li>
              <li>Check bank terms for exact payout and T&C before investing.</li>
            </ul>

            <p className="text-xs text-muted-foreground mt-6">
              <strong>Disclaimer:</strong> Estimates only. Not a financial recommendation.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FDCalculator;
