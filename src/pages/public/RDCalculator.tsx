import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalculatorInput from "@/components/CalculatorInput";

const periodsPerYear = (freq: "monthly" | "quarterly" | "half-yearly" | "yearly") => {
  switch (freq) {
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "half-yearly":
      return 2;
    case "yearly":
      return 1;
    default:
      return 4;
  }
};

/**
 * Accurate RD maturity calculator using month-by-month simulation.
 *
 * @param monthlyDeposit  monthly instalment (number)
 * @param annualRatePct   annual nominal interest rate in percent (e.g. 7 for 7%)
 * @param tenureYears     tenure in years (integer or fractional allowed)
 * @param compFreq        compounding frequency ("monthly"|"quarterly"|"half-yearly"|"yearly")
 */
const calculateRDSim = (
  monthlyDeposit: number,
  annualRatePct: number,
  tenureYears: number,
  compFreq: "monthly" | "quarterly" | "half-yearly" | "yearly" = "quarterly"
) => {
  // basic validation / sanitization
  if (monthlyDeposit <= 0 || annualRatePct <= 0 || tenureYears <= 0) {
    return { maturityAmount: 0, investedAmount: 0, returns: 0 };
  }

  const totalMonths = Math.round(tenureYears * 12);
  const ppy = periodsPerYear(compFreq);
  const monthsPerPeriod = 12 / ppy;
  const periodRate = annualRatePct / 100 / ppy; // interest rate applied at each compounding period

  let balance = 0;
  let monthsInCurrentPeriod = 0;

  for (let m = 1; m <= totalMonths; m++) {
    // deposit at start of month
    balance += monthlyDeposit;
    monthsInCurrentPeriod++;

    // if we hit a compounding boundary, apply period interest to the entire balance
    if (monthsInCurrentPeriod >= monthsPerPeriod) {
      balance *= 1 + periodRate;
      monthsInCurrentPeriod = 0;
    }
  }

  // leftover months: prorate interest for the remaining fraction of the period
  if (monthsInCurrentPeriod > 0) {
    const fraction = monthsInCurrentPeriod / monthsPerPeriod;
    balance *= 1 + periodRate * fraction;
  }

  const investedAmount = monthlyDeposit * totalMonths;
  const maturityAmount = Math.round(balance);
  const returns = Math.round(maturityAmount - investedAmount);

  return {
    maturityAmount,
    investedAmount: Math.round(investedAmount),
    returns,
  };
};

const RDCalculator = () => {
  const navigate = useNavigate();
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
  const [interestRate, setInterestRate] = useState(7);
  const [tenure, setTenure] = useState(5);

  // UseMemo to avoid recomputing on unrelated renders
  const results = useMemo(() => {
    return calculateRDSim(monthlyDeposit, interestRate, tenure, "quarterly");
  }, [monthlyDeposit, interestRate, tenure]);

  const returnsPercentage = results.investedAmount > 0 ? (results.returns / results.investedAmount) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              RD <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate the maturity amount of your recurring deposit with regular monthly investments
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Calculator Inputs</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your RD details to calculate returns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <CalculatorInput
                  label="Monthly Deposit Amount"
                  value={monthlyDeposit}
                  onValueChange={setMonthlyDeposit}
                  min={100}
                  max={100000}
                  step={100}
                  type="currency"
                />

                <CalculatorInput
                  label="Rate of Interest (p.a.)"
                  value={interestRate}
                  onValueChange={setInterestRate}
                  min={3.5}
                  max={16}
                  step={0.1}
                  type="percent"
                />

                <CalculatorInput
                  label="Time Period"
                  value={tenure}
                  onValueChange={setTenure}
                  min={1}
                  max={10}
                  step={1}
                  type="years"
                />
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="space-y-6">
              {/* Result Cards */}
              <div className="grid gap-4">
                <Card className="border-border bg-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Invested Amount</p>
                          <p className="text-2xl font-bold text-card-foreground">
                            {formatCurrency(results.investedAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Returns</p>
                          <p className="text-2xl font-bold text-card-foreground">
                            {formatCurrency(results.returns)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <PiggyBank className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Maturity Amount</p>
                          <p className="text-3xl font-bold text-primary">
                            {formatCurrency(results.maturityAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visual Breakdown */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Investment Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invested Amount</span>
                      <span className="font-semibold text-card-foreground">
                        {formatCurrency(results.investedAmount)}
                      </span>
                    </div>
                    <div className="h-3 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(results.investedAmount / results.maturityAmount) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Returns Earned</span>
                      <span className="font-semibold text-card-foreground">
                        {formatCurrency(results.returns)} ({returnsPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full transition-all duration-500"
                        style={{ width: `${(results.returns / results.maturityAmount) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border">
                    <div className="flex justify-between">
                      <span className="font-semibold text-card-foreground">Total Maturity</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(results.maturityAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Start Your RD Journey Today
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Recurring deposits are ideal for building savings with small monthly investments. Get expert guidance on choosing the best RD plans.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                Compare RD Plans
              </a>
              <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors">
                Talk to Expert
              </a>
            </div>
          </div>
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

export default RDCalculator;
