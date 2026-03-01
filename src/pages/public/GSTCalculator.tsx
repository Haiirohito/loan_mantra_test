import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Receipt, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalculatorInput from "@/components/CalculatorInput";

type InputMode = "base" | "final";
type ProfitMode = "percent" | "flat";
type GstType = "intra" | "inter";

const GSTCalculator = () => {
  const navigate = useNavigate();

  // Core inputs
  // Note: `amount` serves as either base cost (excl GST) or final price (incl GST) depending on inputMode
  const [amount, setAmount] = useState<number>(500000);
  const [profitRatio, setProfitRatio] = useState<number>(5); // percent OR flat value depending on profitMode
  const [profitMode, setProfitMode] = useState<ProfitMode>("percent");
  const [gstRate, setGstRate] = useState<number>(18);
  const [inputMode, setInputMode] = useState<InputMode>("base");
  const [gstType, setGstType] = useState<GstType>("intra");
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const gstRates = [3, 5, 12, 18, 28];

  // Utility: sanitize and round values to 2 decimals for calculation stability
  const sanitize = (v: number) => {
    if (!isFinite(v) || isNaN(v)) return 0;
    return Math.round((v + Number.EPSILON) * 100) / 100;
  };

  // Main calculation - memoized
  const results = useMemo(() => {
    // clamp / sanitize inputs
    const amt = Math.max(0, sanitize(amount));
    const gst = Math.max(0, sanitize(gstRate));
    const pMode: ProfitMode = profitMode;
    let profitAmt = 0;
    let taxableValue = 0;
    let gstAmount = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let totalAmount = 0;
    let investedLabelNote = "";

    if (inputMode === "base") {
      // Interpret `amount` as base cost EXCLUDING GST
      // Compute profit depending on profitMode
      if (pMode === "percent") {
        profitAmt = sanitize((amt * profitRatio) / 100);
      } else {
        // flat
        profitAmt = sanitize(Math.max(0, profitRatio));
      }

      taxableValue = sanitize(amt + profitAmt);
      gstAmount = sanitize((taxableValue * gst) / 100);

      if (gstType === "intra") {
        cgst = sanitize(gstAmount / 2);
        sgst = sanitize(gstAmount / 2);
        igst = 0;
      } else {
        igst = sanitize(gstAmount);
        cgst = 0;
        sgst = 0;
      }

      totalAmount = sanitize(taxableValue + gstAmount);
      investedLabelNote = "Base cost (excl. GST) + profit";

    } else {
      // inputMode === "final"
      // Interpret `amount` as finalPrice (includes GST).
      // Reverse-calculate taxable amount and GST. Profit cannot be derived reliably from final price alone,
      // so profit fields are left empty / zero and UI will indicate limitation.
      const finalPrice = amt;
      taxableValue = sanitize(finalPrice / (1 + gst / 100));
      gstAmount = sanitize(finalPrice - taxableValue);

      if (gstType === "intra") {
        cgst = sanitize(gstAmount / 2);
        sgst = sanitize(gstAmount / 2);
        igst = 0;
      } else {
        igst = sanitize(gstAmount);
        cgst = 0;
        sgst = 0;
      }

      totalAmount = sanitize(finalPrice);
      profitAmt = 0; // undefined from reverse calc — set to 0 and show note in UI
      investedLabelNote = "Final price (incl. GST) — profit not derived";
    }

    // Percent returns relative to taxableValue (useful)
    const gstPercentOfTaxable = taxableValue > 0 ? sanitize((gstAmount / taxableValue) * 100) : 0;

    return {
      inputMode,
      amount: amt,
      profitMode: pMode,
      profitAmount: profitAmt,
      taxableValue,
      gstAmount,
      cgst,
      sgst,
      igst,
      totalAmount,
      gstPercentOfTaxable,
      investedLabelNote,
    };
  }, [amount, profitRatio, profitMode, gstRate, inputMode, gstType]);

  // Display formatter (INR)
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.round(value));

  // Small helper text for the profit control when in final-price mode
  const profitControlDisabled = inputMode === "final";

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              Goods &amp; Services Tax <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compute GST, view CGST/SGST or IGST breakdown, and estimate final invoice value precisely.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <Card className="p-6 space-y-6">
              {/* Input Mode */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Input Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={inputMode === "base" ? "default" : "outline"}
                    onClick={() => setInputMode("base")}
                    className="px-3"
                  >
                    Base Price (Excl. GST)
                  </Button>
                  <Button
                    variant={inputMode === "final" ? "default" : "outline"}
                    onClick={() => setInputMode("final")}
                    className="px-3"
                  >
                    Final Price (Incl. GST)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Choose whether the main amount you enter is the base cost (pre-tax) or the final invoice amount (tax included).
                </p>
              </div>

              {/* Amount */}
              <CalculatorInput
                label={inputMode === "base" ? "Cost of Goods / Services (Excl. GST)" : "Final Price (Incl. GST)"}
                value={amount}
                onValueChange={setAmount}
                min={0}
                max={20000000}
                step={1000}
                type="currency"
              />

              {/* Profit Controls */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-base font-semibold">Profit</Label>
                  <span className="text-sm text-muted-foreground">(Mark-up)</span>
                </div>

                <div className="flex gap-2 mb-3">
                  <Button
                    variant={profitMode === "percent" ? "default" : "outline"}
                    onClick={() => setProfitMode("percent")}
                    disabled={profitControlDisabled}
                  >
                    % of Cost
                  </Button>
                  <Button
                    variant={profitMode === "flat" ? "default" : "outline"}
                    onClick={() => setProfitMode("flat")}
                    disabled={profitControlDisabled}
                  >
                    Flat (₹)
                  </Button>
                </div>

                <CalculatorInput
                  label=""
                  value={profitRatio}
                  onValueChange={setProfitRatio}
                  min={0}
                  max={profitMode === "percent" ? 100 : 10000000}
                  step={profitMode === "percent" ? 1 : 1000}
                  type={profitMode === "percent" ? "percent" : "currency"}
                  disabled={profitControlDisabled}
                  className="mt-0"
                />

                {profitControlDisabled && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Profit controls are disabled when you enter a final price (inclusive). Switch to <strong>Base Price</strong> mode to add profit.
                  </p>
                )}
              </div>

              {/* GST Rate */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Select GST Rate</Label>
                <div className="grid grid-cols-5 gap-2">
                  {gstRates.map((rate) => (
                    <Button
                      key={rate}
                      variant={gstRate === rate ? "default" : "outline"}
                      onClick={() => setGstRate(rate)}
                      className="w-full"
                    >
                      {rate}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* GST Type */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Tax Structure</Label>
                <div className="flex gap-2">
                  <Button
                    variant={gstType === "intra" ? "default" : "outline"}
                    onClick={() => setGstType("intra")}
                  >
                    CGST + SGST (Intra-state)
                  </Button>
                  <Button
                    variant={gstType === "inter" ? "default" : "outline"}
                    onClick={() => setGstType("inter")}
                  >
                    IGST (Inter-state)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Choose IGST for interstate supplies; CGST + SGST apply for intra-state transactions.
                </p>
              </div>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  GST Calculation Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-accent/50 rounded-lg">
                    <span className="text-muted-foreground">
                      {results.inputMode === "base" ? "Cost of Goods (Excl. GST)" : "Final Invoice Amount (Incl. GST)"}
                    </span>
                    <span className="text-xl font-bold">{formatCurrency(results.inputMode === "base" ? results.amount : results.totalAmount)}</span>
                  </div>

                  {/* Profit */}
                  {results.inputMode === "base" ? (
                    <div className="flex justify-between items-center p-4 bg-accent/50 rounded-lg">
                      <span className="text-muted-foreground">
                        {profitMode === "percent" ? `Profit (${profitRatio}%)` : "Profit (Flat)"}
                      </span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(results.profitAmount)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-4 bg-accent/50 rounded-lg">
                      <span className="text-muted-foreground">Profit (derived)</span>
                      <span className="text-sm text-muted-foreground">Not available from final price</span>
                    </div>
                  )}

                  {/* Tax */}
                  <div className="flex justify-between items-center p-4 bg-accent/50 rounded-lg">
                    <span className="text-muted-foreground">Taxable Value</span>
                    <span className="text-xl font-bold">{formatCurrency(results.taxableValue)}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-accent/50 rounded-lg">
                    <span className="text-muted-foreground">GST ({gstRate}%)</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(results.gstAmount)}</span>
                  </div>

                  {/* CGST/SGST or IGST */}
                  {gstType === "intra" ? (
                    <>
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <span className="text-muted-foreground">CGST ({sanitize(gstRate / 2)}%)</span>
                        <span className="font-semibold">{formatCurrency(results.cgst)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <span className="text-muted-foreground">SGST ({sanitize(gstRate / 2)}%)</span>
                        <span className="font-semibold">{formatCurrency(results.sgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-muted-foreground">IGST ({gstRate}%)</span>
                      <span className="font-semibold">{formatCurrency(results.igst)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
                    <span className="font-semibold">Total Amount (incl. GST)</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(results.totalAmount)}</span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full"
                  >
                    {showBreakdown ? "Hide" : "Check"} Detailed Breakdown
                  </Button>
                </div>
              </Card>

              {showBreakdown && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Tax Computation Breakdown
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 bg-accent/30 rounded">
                      <span className="text-muted-foreground">Base Cost</span>
                      <span className="font-semibold">{formatCurrency(inputMode === "base" ? amount : results.taxableValue)}</span>
                    </div>

                    {inputMode === "base" && (
                      <div className="flex justify-between p-3 bg-accent/30 rounded">
                        <span className="text-muted-foreground">Profit Applied</span>
                        <span className="font-semibold">{formatCurrency(results.profitAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between p-3 bg-accent/30 rounded">
                      <span className="text-muted-foreground">Taxable Value (on which GST applies)</span>
                      <span className="font-semibold">{formatCurrency(results.taxableValue)}</span>
                    </div>

                    <div className="h-px bg-border my-2"></div>

                    <div className="flex justify-between p-3 bg-blue-50 rounded">
                      <span className="text-muted-foreground">Total GST</span>
                      <span className="font-semibold">{formatCurrency(results.gstAmount)} ({results.gstPercentOfTaxable.toFixed(2)}% of taxable)</span>
                    </div>

                    {gstType === "intra" ? (
                      <>
                        <div className="flex justify-between p-3 bg-blue-50 rounded">
                          <span className="text-muted-foreground">CGST</span>
                          <span className="font-semibold">{formatCurrency(results.cgst)}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-blue-50 rounded">
                          <span className="text-muted-foreground">SGST</span>
                          <span className="font-semibold">{formatCurrency(results.sgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between p-3 bg-blue-50 rounded">
                        <span className="text-muted-foreground">IGST</span>
                        <span className="font-semibold">{formatCurrency(results.igst)}</span>
                      </div>
                    )}

                    <div className="h-px bg-border my-2"></div>

                    <div className="flex justify-between p-3 bg-primary/20 rounded border border-primary">
                      <span className="font-semibold">Final Invoice Amount</span>
                      <span className="font-bold text-primary">{formatCurrency(results.totalAmount)}</span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      Note: When you supply a final price (inclusive of GST), profit amount cannot be uniquely derived. Switch to <strong>Base Price</strong> mode to specify profit explicitly.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Info Section - concise & formal */}
          <Card className="mt-8 p-6 bg-accent/50">
            <h3 className="text-lg font-semibold mb-3">About this calculator</h3>
            <p className="text-muted-foreground">
              This tool computes GST on a taxable value derived from the base cost plus an optional profit mark-up,
              or it can reverse-calculate taxable value when a final price (inclusive of GST) is provided.
              For intra-state transactions the total GST is shown as equal CGST and SGST components; for inter-state
              transactions the tax is shown as IGST. Use Base Price mode to include a specified profit mark-up; use
              Final Price mode to decompose an inclusive amount into taxable value and tax components.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Compliance note: rates and applicability depend on GST Council notifications. This calculator provides estimates and is not a substitute for formal tax advice.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculator;
