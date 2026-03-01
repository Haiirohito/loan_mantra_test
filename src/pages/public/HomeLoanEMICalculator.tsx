import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Wallet, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalculatorInput from "@/components/CalculatorInput";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(Number.isFinite(v) ? v : min, min), max);

type PaymentRow = { month: number; payment: number; principal: number; interest: number; balance: number };

const HomeLoanEMICalculator: React.FC = () => {
  const navigate = useNavigate();

  const MIN_LOAN = 500000; // ₹5 Lac
  const MAX_LOAN = 200000000; // ₹20 Cr
  const MIN_TENURE = 5; // years
  const MAX_TENURE = 30; // years
  const MIN_RATE = 0;
  const MAX_RATE = 20;

  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [tenure, setTenure] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);

  // EMI, totals and amortization (memoized)
  const { emi, totalAmount, totalInterest, amortization } = useMemo(() => {
    const principal = clamp(loanAmount, MIN_LOAN, MAX_LOAN);
    const months = clamp(tenure, MIN_TENURE, MAX_TENURE) * 12;
    const monthlyRate = clamp(interestRate, MIN_RATE, MAX_RATE) / 12 / 100;

    let emiVal: number;
    if (Math.abs(monthlyRate) < 1e-12) {
      emiVal = principal / months;
    } else {
      const factor = Math.pow(1 + monthlyRate, months);
      emiVal = (principal * monthlyRate * factor) / (factor - 1);
    }

    const rows: PaymentRow[] = [];
    let balance = principal;

    for (let m = 1; m <= months; m++) {
      const interest = balance * monthlyRate;
      let principalPortion = emiVal - interest;
      if (m === months) {
        principalPortion = balance; // clear residual
      }
      principalPortion = Math.max(0, principalPortion);
      const payment = principalPortion + interest;
      balance = Math.max(0, balance - principalPortion);

      rows.push({
        month: m,
        payment: Math.round((payment + Number.EPSILON) * 100) / 100,
        principal: Math.round((principalPortion + Number.EPSILON) * 100) / 100,
        interest: Math.round((interest + Number.EPSILON) * 100) / 100,
        balance: Math.round((balance + Number.EPSILON) * 100) / 100,
      });
    }

    const total = emiVal * months;
    const interestTotal = total - principal;

    return { emi: emiVal, totalAmount: total, totalInterest: interestTotal, amortization: rows };
  }, [loanAmount, tenure, interestRate]);

  const formatCurrency = (value: number, decimals = 0) => {
    if (!Number.isFinite(value)) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (!Number.isFinite(value)) return "—";
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lac`;
    return formatCurrency(value, 0);
  };

  const principalPercent = totalAmount > 0 ? (clamp(loanAmount, MIN_LOAN, MAX_LOAN) / totalAmount) * 100 : 0;
  const interestPercent = totalAmount > 0 ? (totalInterest / totalAmount) * 100 : 0;

  const downloadCSV = () => {
    if (!amortization || amortization.length === 0) return;
    const header = "month,payment,principal,interest,balance";
    const lines = amortization.map(r => `${r.month},${r.payment},${r.principal},${r.interest},${r.balance}`);
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "home-loan-amortization.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const firstRows = amortization.slice(0, 5);
  const lastRows = amortization.slice(-5);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Home Loan EMI <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-4xl mx-auto">
              Estimate monthly EMI, total interest and repayment schedule. Results exclude lender fees and insurance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 space-y-6">
              <CalculatorInput
                label="Loan Amount (₹)"
                value={loanAmount}
                onValueChange={setLoanAmount}
                min={MIN_LOAN}
                max={MAX_LOAN}
                step={100000}
                type="currency"
              />

              <CalculatorInput
                label="Tenure (years)"
                value={tenure}
                onValueChange={setTenure}
                min={MIN_TENURE}
                max={MAX_TENURE}
                step={1}
                type="years"
              />

              <CalculatorInput
                label="Interest Rate (p.a.)"
                value={interestRate}
                onValueChange={setInterestRate}
                min={MIN_RATE}
                max={MAX_RATE}
                step={0.1}
                type="percent"
              />
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Monthly EMI
                </h3>

                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-primary mb-2">{formatCurrency(emi, 2)}</div>
                  <div className="text-sm text-muted-foreground">per month for {tenure} years</div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-accent/50 rounded-lg">
                    <span className="text-muted-foreground">Principal</span>
                    <span className="text-xl font-bold">{formatNumber(clamp(loanAmount, MIN_LOAN, MAX_LOAN))}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-accent/50 rounded-lg">
                    <span className="text-muted-foreground">Total Interest</span>
                    <span className="text-xl font-bold text-orange-600">{formatNumber(totalInterest)}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
                    <span className="font-semibold">Total Repayable</span>
                    <span className="text-2xl font-bold text-primary">{formatNumber(totalAmount)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Payment breakdown
                </h3>

                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-primary">Principal</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-primary">{principalPercent.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-accent">
                      <div style={{ width: `${principalPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-orange-600">Interest</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-orange-600">{interestPercent.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-accent">
                      <div style={{ width: `${interestPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-600"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{formatNumber(clamp(loanAmount, MIN_LOAN, MAX_LOAN))}</div>
                      <div className="text-sm text-muted-foreground mt-1">Principal</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{formatNumber(totalInterest)}</div>
                      <div className="text-sm text-muted-foreground mt-1">Interest</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Amortization Schedule - SIP-style Card & Table (always visible) */}
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Amortization Schedule</CardTitle>
              <Button variant="outline" size="sm" onClick={downloadCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Month-by-month breakdown of your EMI — how much goes to principal vs interest, and the remaining balance.
              </p>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Month</TableHead>
                      <TableHead className="text-right">Payment</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {firstRows.map((r) => (
                      <TableRow key={`f-${r.month}`}>
                        <TableCell className="font-medium">{r.month}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.payment, 2)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.principal, 2)}</TableCell>
                        <TableCell className="text-right text-secondary">{formatCurrency(r.interest, 2)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.balance, 2)}</TableCell>
                      </TableRow>
                    ))}

                    {amortization.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-2">
                          …
                        </TableCell>
                      </TableRow>
                    )}

                    {lastRows.map((r) => (
                      <TableRow key={`l-${r.month}`}>
                        <TableCell className="font-medium">{r.month}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.payment, 2)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.principal, 2)}</TableCell>
                        <TableCell className="text-right text-secondary">{formatCurrency(r.interest, 2)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.balance, 2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8 p-6 bg-accent/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">About this calculator</h2>

            <p className="text-muted-foreground">
              Provides an indicative EMI schedule calculated via the reducing-balance method with constant monthly instalments.
              Results reflect mathematical estimates and intentionally omit lender-specific adjustments.
            </p>

            <ul className="text-xs text-muted-foreground mt-4 list-disc list-inside space-y-1">
              <li>Rounding & schedule differences: lenders may apply different rounding/interest-posting rules.</li>
              <li>Excluded items: processing fees, insurance, taxes, prepayment penalties, top-ups and closure charges.</li>
              <li>Not a loan offer — final terms and exact repayment schedule must be obtained from your lender.</li>
            </ul>
          </Card>


        </div>
      </div>
    </div>
  );
};

export default HomeLoanEMICalculator;
