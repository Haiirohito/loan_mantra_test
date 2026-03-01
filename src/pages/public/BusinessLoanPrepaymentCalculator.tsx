import { useState, useMemo } from "react";
import { ChevronRight, Briefcase, TrendingDown, IndianRupee, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import CalculatorInput from "@/components/CalculatorInput";

/**
 * BusinessLoanPrepaymentCalculator.tsx
 * Updated:
 * - Added Export CSV buttons to both Baseline and Result amortization tables
 */

type Strategy = "reduce-emi" | "reduce-tenure";
type TableView = "baseline" | "result";

const MIN_TENURE = 1;
const MAX_TENURE = 30; // expanded to reasonable maximum
const MAX_PREPAYMENT_PCT = 0.5; // 50% of loan by default
const SAFETY_BUFFER = 1000; // leave at least ₹1,000 as buffer when computing max prepayment

const BusinessLoanPrepaymentCalculator: React.FC = () => {
  const navigate = useNavigate();

  // Inputs
  const [loanAmount, setLoanAmount] = useState<number>(1500000);
  const [tenure, setTenure] = useState<number>(5); // years
  const [interestRate, setInterestRate] = useState<number>(11); // annual %
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(100000);
  const [emisPaid, setEmisPaid] = useState<number>(12);
  const [strategy, setStrategy] = useState<Strategy>("reduce-emi");

  // Table view toggle state: 'baseline' or 'result'
  const [tableView, setTableView] = useState<TableView>("baseline");

  // Formatting helpers
  const formatCurrency = (amount: number) => {
    if (!isFinite(amount)) amount = 0;
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)} K`;
    }
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  };

  const formatCurrencyFixed = (amount: number, decimals = 2) => {
    if (!isFinite(amount)) amount = 0;
    const fixed = Number(amount).toFixed(decimals);
    const parts = fixed.split(".");
    parts[0] = Number(parts[0]).toLocaleString("en-IN");
    return `₹${parts.join(".")}`;
  };

  const formatFullCurrency = (amount: number) => {
    if (!isFinite(amount)) amount = 0;
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  };

  const numberToWords = (num: number): string => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (!isFinite(num) || Math.round(num) === 0) return "Zero";

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " And " + convertLessThanThousand(n % 100) : "");
    };

    const roundedNum = Math.round(Math.abs(num));
    if (roundedNum >= 100000) {
      const lakhs = Math.floor(roundedNum / 100000);
      const remainder = roundedNum % 100000;
      return convertLessThanThousand(lakhs) + " Lakh" + (remainder ? " " + convertLessThanThousand(Math.floor(remainder / 1000)) + " Thousand" + (remainder % 1000 ? " " + convertLessThanThousand(remainder % 1000) : "") : "");
    }
    if (roundedNum >= 1000) {
      const thousands = Math.floor(roundedNum / 1000);
      const remainder = roundedNum % 1000;
      return convertLessThanThousand(thousands) + " Thousand" + (remainder ? " " + convertLessThanThousand(remainder) : "");
    }
    return convertLessThanThousand(roundedNum);
  };

  // Amortization schedule generator (for remaining period after emisPaid)
  const generateAmortization = (
    principal: number,
    monthlyRate: number,
    months: number,
    emi: number
  ) => {
    const schedule: {
      month: number;
      payment: number;
      principalPaid: number;
      interestPaid: number;
      balance: number;
    }[] = [];

    let balance = principal;
    for (let m = 1; m <= months && balance > 0.5; m++) {
      let interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
      let principalPaid = Math.min(balance, emi - interest);
      if (principalPaid < 0) {
        // EMI too small to cover interest; break to avoid infinite loop
        principalPaid = 0;
      }
      const payment = principalPaid + interest;
      balance = Math.max(0, balance - principalPaid);

      schedule.push({
        month: m,
        payment,
        principalPaid,
        interestPaid: interest,
        balance,
      });
      // safety
      if (schedule.length > 1000) break;
    }
    return schedule;
  };

  // CSV export helper - exports full schedule passed in
  const downloadScheduleCsv = (rows: { month: number; payment: number; principalPaid: number; interestPaid: number; balance: number; }[], filename = "amortization.csv") => {
    if (!rows || rows.length === 0) return;
    const header = ["Month", "Payment (₹)", "Principal Paid (₹)", "Interest Paid (₹)", "Balance (₹)"];
    const lines = [
      header.join(","),
      ...rows.map(r => [
        r.month,
        Math.round(r.payment),
        Math.round(r.principalPaid),
        Math.round(r.interestPaid),
        Math.round(r.balance),
      ].join(","))
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Main calculations memoized
  const calculations = useMemo(() => {
    // Validate & clamp inputs
    const clampedLoan = Math.max(50000, Math.min(10000000, Number(loanAmount || 0)));
    const clampedTenure = Math.max(MIN_TENURE, Math.min(MAX_TENURE, Math.round(Number(tenure || 0))));
    const annualRate = Math.max(0, Number(interestRate || 0));
    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = Math.max(1, clampedTenure * 12);

    const clampedEmisPaid = Math.max(0, Math.min(totalMonths, Math.round(Number(emisPaid || 0))));

    const computedMaxPrepayment = Math.min(clampedLoan * MAX_PREPAYMENT_PCT, Math.max(0, clampedLoan - SAFETY_BUFFER));
    const clampedPrepayment = Math.max(0, Math.min(computedMaxPrepayment, Number(prepaymentAmount || 0)));

    // Original EMI
    let originalEMI = 0;
    if (monthlyRate === 0) {
      originalEMI = clampedLoan / totalMonths;
    } else {
      const pow = Math.pow(1 + monthlyRate, totalMonths);
      originalEMI = (clampedLoan * monthlyRate * pow) / (pow - 1);
    }

    // Outstanding principal after emisPaid
    let outstanding = clampedLoan;
    for (let i = 0; i < clampedEmisPaid; i++) {
      const interestForMonth = monthlyRate === 0 ? 0 : outstanding * monthlyRate;
      const principalForMonth = Math.max(0, originalEMI - interestForMonth);
      outstanding = Math.max(0, outstanding - principalForMonth);
    }

    // If prepayment >= outstanding -> loan fully paid
    const newPrincipal = Math.max(0, outstanding - clampedPrepayment);
    const remainingMonths = Math.max(0, totalMonths - clampedEmisPaid);

    // Revised EMI if user chooses to reduce EMI
    let revisedEMI = 0;
    if (newPrincipal <= 0 || remainingMonths === 0) {
      revisedEMI = 0;
    } else if (monthlyRate === 0) {
      revisedEMI = newPrincipal / remainingMonths;
    } else {
      const powR = Math.pow(1 + monthlyRate, remainingMonths);
      revisedEMI = (newPrincipal * monthlyRate * powR) / (powR - 1);
    }

    // Revised tenure if user chooses to keep EMI same
    let revisedTenureMonths = remainingMonths;
    if (newPrincipal <= 0) {
      revisedTenureMonths = 0;
    } else if (originalEMI <= 0) {
      revisedTenureMonths = remainingMonths;
    } else if (monthlyRate === 0) {
      revisedTenureMonths = Math.ceil(newPrincipal / originalEMI);
    } else {
      const denom = originalEMI - monthlyRate * newPrincipal;
      if (denom <= 0) {
        // EMI too small to amortize the loan after prepayment -> keep remaining months
        revisedTenureMonths = remainingMonths;
      } else {
        revisedTenureMonths = Math.ceil(Math.log(originalEMI / denom) / Math.log(1 + monthlyRate));
      }
    }

    // Totals for comparisons (use unrounded values)
    const totalPaymentOriginal = originalEMI * totalMonths;
    const totalInterestOriginal = totalPaymentOriginal - clampedLoan;

    const paidSoFar = originalEMI * clampedEmisPaid;

    // Total with reduce-EMI (recalculate payment for remaining months)
    const totalPaymentWithPrepayment_reduceEMI = paidSoFar + clampedPrepayment + revisedEMI * remainingMonths;
    const totalInterestWithPrepayment_reduceEMI = totalPaymentWithPrepayment_reduceEMI - clampedLoan;
    const interestSavings_reduceEMI = Math.max(0, totalInterestOriginal - totalInterestWithPrepayment_reduceEMI);

    // Total with reduce-tenure (keep EMI same, reduce months)
    const totalPaymentWithPrepayment_reduceTenure = paidSoFar + clampedPrepayment + originalEMI * revisedTenureMonths;
    const totalInterestWithPrepayment_reduceTenure = totalPaymentWithPrepayment_reduceTenure - clampedLoan;
    const interestSavings_reduceTenure = Math.max(0, totalInterestOriginal - totalInterestWithPrepayment_reduceTenure);

    // Amortization schedules (for display) - baseline remaining plus two result variants
    const baselineSchedule = generateAmortization(outstanding, monthlyRate, remainingMonths, originalEMI);
    const scheduleAfterPrepay_reduceEMI = revisedEMI > 0
      ? generateAmortization(newPrincipal, monthlyRate, remainingMonths, revisedEMI)
      : []; // fully paid
    const scheduleAfterPrepay_reduceTenure = originalEMI > 0 && revisedTenureMonths > 0
      ? generateAmortization(newPrincipal, monthlyRate, revisedTenureMonths, originalEMI)
      : [];

    return {
      // inputs (clamped)
      clampedLoan,
      clampedTenure,
      annualRate,
      computedMaxPrepayment,
      clampedPrepayment,
      clampedEmisPaid,
      // EMIs & principals
      originalEMI,
      outstanding,
      newPrincipal,
      revisedEMI,
      revisedTenureMonths,
      // totals
      totalInterestOriginal,
      interestSavings_reduceEMI,
      interestSavings_reduceTenure,
      // schedules
      baselineSchedule,
      scheduleAfterPrepay_reduceEMI,
      scheduleAfterPrepay_reduceTenure,
    };
  }, [loanAmount, tenure, interestRate, prepaymentAmount, emisPaid]);

  // Helpers to build table slice (first 5, last 5)
  const sliceSchedule = (rows: { month: number; payment: number; principalPaid: number; interestPaid: number; balance: number; }[]) => {
    if (!rows || rows.length === 0) return { firstRows: [], lastRows: [], hasMore: false, full: rows };
    if (rows.length <= 10) return { firstRows: rows, lastRows: [], hasMore: false, full: rows };
    const firstRows = rows.slice(0, 5);
    const lastRows = rows.slice(rows.length - 5);
    return { firstRows, lastRows, hasMore: true, full: rows };
  };

  const baselineSlices = sliceSchedule(calculations.baselineSchedule);
  const resultSchedule = strategy === "reduce-emi" ? calculations.scheduleAfterPrepay_reduceEMI : calculations.scheduleAfterPrepay_reduceTenure;
  const resultSlices = sliceSchedule(resultSchedule);

  // UX helpers for display
  const displayRevisedTenure = () => {
    const months = calculations.revisedTenureMonths ?? 0;
    if (months === 0) return "Paid off";
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (years > 0 && remMonths > 0) return `${years} yr ${remMonths} mo`;
    if (years > 0) return `${years} yr${years > 1 ? "s" : ""}`;
    return `${remMonths} mo`;
  };

  const showFullyPaid = calculations.newPrincipal <= 0;

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Business Loan Prepayment <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-4xl mx-auto">
              Estimate post-prepayment EMI, total interest saved and potential reduction in loan duration. Figures are indicative—refer to your lender for exact amounts.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calculator Inputs */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardContent className="p-6 space-y-6">
                  <CalculatorInput
                    label="Loan Amount"
                    value={loanAmount}
                    onValueChange={setLoanAmount}
                    min={50000}
                    max={10000000}
                    step={50000}
                    type="currency"
                  />

                  <CalculatorInput
                    label="Original Loan Tenure"
                    value={tenure}
                    onValueChange={setTenure}
                    min={MIN_TENURE}
                    max={MAX_TENURE}
                    type="years"
                  />

                  <CalculatorInput
                    label="Rate of Interest (annual)"
                    value={interestRate}
                    onValueChange={setInterestRate}
                    min={0}
                    max={25}
                    step={0.1}
                    type="percent"
                  />

                  <CalculatorInput
                    label="Prepayment Amount"
                    value={prepaymentAmount}
                    onValueChange={setPrepaymentAmount}
                    min={0}
                    max={Math.max(1000, calculations.computedMaxPrepayment ?? Math.min(loanAmount * MAX_PREPAYMENT_PCT, loanAmount - SAFETY_BUFFER))}
                    step={1000}
                    type="currency"
                  />

                  <CalculatorInput
                    label="Number of EMIs Paid"
                    value={emisPaid}
                    onValueChange={setEmisPaid}
                    min={0}
                    max={Math.max(0, Math.round(tenure * 12) - 1)}
                    step={1}
                    type="number"
                  />

                  {/* Strategy selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Post-prepayment outcome</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStrategy("reduce-emi")}
                        className={`px-3 py-1 rounded-lg ${strategy === "reduce-emi" ? "bg-primary text-white" : "bg-accent text-muted-foreground"}`}
                        aria-pressed={strategy === "reduce-emi"}
                      >
                        Reduce EMI
                      </button>
                      <button
                        onClick={() => setStrategy("reduce-tenure")}
                        className={`px-3 py-1 rounded-lg ${strategy === "reduce-tenure" ? "bg-primary text-white" : "bg-accent text-muted-foreground"}`}
                        aria-pressed={strategy === "reduce-tenure"}
                      >
                        Reduce Tenure
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Choose whether the prepayment should lower monthly EMI or shorten loan duration.</p>
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="space-y-6">
              {/* Revised EMI Display */}
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Post-prepayment result ({strategy === "reduce-emi" ? "Reduce EMI" : "Reduce Tenure"})</p>
                  <p className="text-4xl font-bold text-primary mb-2">
                    {strategy === "reduce-emi"
                      ? (showFullyPaid ? "Paid off" : formatFullCurrency(calculations.revisedEMI))
                      : (calculations.revisedTenureMonths === 0 ? "Paid off" : displayRevisedTenure())
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {strategy === "reduce-emi"
                      ? (showFullyPaid ? "Loan cleared after prepayment." : numberToWords(calculations.revisedEMI))
                      : (calculations.revisedTenureMonths === 0 ? "Loan cleared after prepayment." : `Remaining: ${displayRevisedTenure()}`)
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Key Takeaways */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Key Takeaways</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary"></div>
                      <span className="text-sm text-muted-foreground">Original EMI</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatFullCurrency(calculations.originalEMI)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">If you reduce EMI</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {calculations.revisedEMI > 0 ? formatFullCurrency(calculations.revisedEMI) : (showFullyPaid ? "Paid off" : "—")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Interest saved (reduce EMI)</span>
                    </div>
                    <span className="font-semibold text-green-500">{formatFullCurrency(calculations.interestSavings_reduceEMI)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">If you keep EMI (reduce tenure)</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {calculations.revisedTenureMonths === 0 ? "Paid off" : displayRevisedTenure()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Interest saved (reduce tenure)</span>
                    </div>
                    <span className="font-semibold text-green-500">{formatFullCurrency(calculations.interestSavings_reduceTenure)}</span>
                  </div>

                </CardContent>
              </Card>

              {/* CTA */}
              <Button className="w-full" size="lg" onClick={() => navigate("/loans")}>
                Explore Lenders
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Table view toggle */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={tableView === "baseline" ? undefined : "ghost"}
                onClick={() => setTableView("baseline")}
                className={tableView === "baseline" ? "bg-primary text-white" : ""}
                size="sm"
              >
                Baseline Amortization Schedule (remaining)
              </Button>
              <Button
                variant={tableView === "result" ? undefined : "ghost"}
                onClick={() => setTableView("result")}
                className={tableView === "result" ? "bg-primary text-white" : ""}
                size="sm"
              >
                Resulting Amortization Schedule ({strategy === "reduce-emi" ? "Reduce EMI" : "Reduce Tenure"})
              </Button>
            </div>

          </div>

          {/* Single table container: shows baseline or result depending on tableView */}
          {tableView === "baseline" ? (
            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Baseline Amortization Schedule (remaining)</CardTitle>
                <Button variant="outline" size="sm" onClick={() => downloadScheduleCsv(calculations.baselineSchedule, "baseline_schedule.csv")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Month-by-month breakdown of remaining EMIs — principal vs interest and remaining balance.
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
                      {baselineSlices.firstRows.map((r) => (
                        <TableRow key={`b-f-${r.month}`}>
                          <TableCell className="font-medium">{r.month}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.payment, 2)}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.principalPaid, 2)}</TableCell>
                          <TableCell className="text-right text-secondary">{formatCurrencyFixed(r.interestPaid, 2)}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.balance, 2)}</TableCell>
                        </TableRow>
                      ))}

                      {baselineSlices.hasMore && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-2">
                            …
                          </TableCell>
                        </TableRow>
                      )}

                      {baselineSlices.lastRows && baselineSlices.lastRows.map((r) => (
                        <TableRow key={`b-l-${r.month}`}>
                          <TableCell className="font-medium">{r.month}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.payment, 2)}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.principalPaid, 2)}</TableCell>
                          <TableCell className="text-right text-secondary">{formatCurrencyFixed(r.interestPaid, 2)}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.balance, 2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {(!calculations.baselineSchedule || calculations.baselineSchedule.length === 0) && (
                    <p className="text-sm text-muted-foreground mt-3">No remaining schedule (loan may be paid off).</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Resulting Amortization Schedule ({strategy === "reduce-emi" ? "Reduce EMI" : "Reduce Tenure"})</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadScheduleCsv(resultSchedule, `result_schedule_${strategy === "reduce-emi" ? "reduce_emi" : "reduce_tenure"}.csv`)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Month-by-month breakdown after prepayment. Shows payments and balance under the chosen strategy.
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
                      {resultSlices.firstRows.map((r) => (
                        <TableRow key={`r-f-${r.month}`}>
                          <TableCell className="font-medium">{r.month}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.payment, 2)}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.principalPaid, 2)}</TableCell>
                          <TableCell className="text-right text-secondary">{formatCurrencyFixed(r.interestPaid, 2)}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.balance, 2)}</TableCell>
                        </TableRow>
                      ))}

                      {resultSlices.hasMore && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-2">
                            …
                          </TableCell>
                        </TableRow>
                      )}

                      {resultSlices.lastRows && resultSlices.lastRows.map((r) => (
                        <TableRow key={`r-l-${r.month}`}>
                          <TableCell className="font-medium">{r.month}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.payment, 2)}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.principalPaid, 2)}</TableCell>
                          <TableCell className="text-right text-secondary">{formatCurrencyFixed(r.interestPaid, 2)}</TableCell>
                          <TableCell className="text-right">{formatCurrencyFixed(r.balance, 2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {(!resultSchedule || resultSchedule.length === 0) && (
                    <p className="text-sm text-muted-foreground mt-3">No schedule to display (loan may be paid off immediately after prepayment).</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <Card className="mt-8 p-6 bg-accent/50">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Why prepay a business loan?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Lower interest outflow</h3>
                <p className="text-sm text-muted-foreground">Partial prepayment reduces outstanding principal and lowers total interest payable.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Flexible outcomes</h3>
                <p className="text-sm text-muted-foreground">You can either reduce monthly EMI or shorten the loan tenure—select the option that fits cash flow planning.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Confirm lender terms</h3>
                <p className="text-sm text-muted-foreground">Prepayment penalties, taxes or charges may apply. Verify exact terms with your lender before transacting.</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">This calculator provides indicative figures and excludes lender-specific fees or penalties.</p>
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

export default BusinessLoanPrepaymentCalculator;
