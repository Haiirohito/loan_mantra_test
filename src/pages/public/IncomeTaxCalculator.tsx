import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import CalculatorInput from "@/components/CalculatorInput";

const IncomeTaxCalculator = () => {
  // State for inputs
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [basicPay, setBasicPay] = useState(600000);
  const [hra, setHra] = useState(240000);
  const [houseRent, setHouseRent] = useState(20000);
  const [city, setCity] = useState("others");
  const [investments80C, setInvestments80C] = useState(150000);
  const [investments80CCD, setInvestments80CCD] = useState(50000);
  const [medicalInsurance, setMedicalInsurance] = useState(25000);

  // HRA exemption: inputs expected as annual amounts except houseRent (monthly)
  const calculateHRAExemption = (basicAnnual: number, hraAnnual: number, houseRentMonthly: number, city: string) => {
    const rentPaidAnnual = houseRentMonthly * 12;
    const option1 = hraAnnual; // HRA received (annual)
    const option2 = rentPaidAnnual - 0.1 * basicAnnual; // Rent paid - 10% of basic
    const metro = ["mumbai", "delhi", "chennai", "kolkata"].includes(city);
    const option3 = (metro ? 0.5 : 0.4) * basicAnnual; // 50% of basic for metro else 40%

    // Minimum of the three positive values (option2 might be negative)
    const minOfThree = Math.min(option1, option2, option3);
    return Math.max(0, minOfThree);
  };

  // Old regime tax slabs
  const calculateOldRegimeTax = (taxableIncome: number) => {
    let tax = 0;
    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 12500 + (taxableIncome - 500000) * 0.2;
    } else {
      tax = 112500 + (taxableIncome - 1000000) * 0.3;
    }

    // Rebate (section 87A style): reduce tax up to ₹12,500 when taxable income <= ₹5,00,000
    if (taxableIncome <= 500000) {
      const rebate = Math.min(tax, 12500);
      tax = Math.max(0, tax - rebate);
    }

    // Add 4% cess
    return tax * 1.04;
  };

  // New regime tax slabs
  const calculateNewRegimeTax = (taxableIncome: number) => {
    let tax = 0;
    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 600000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 900000) {
      tax = 15000 + (taxableIncome - 600000) * 0.1;
    } else if (taxableIncome <= 1200000) {
      tax = 45000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      tax = 90000 + (taxableIncome - 1200000) * 0.2;
    } else {
      tax = 150000 + (taxableIncome - 1500000) * 0.3;
    }

    // Apply same small-income rebate if applicable (keeps comparison fair)
    if (taxableIncome <= 500000) {
      const rebate = Math.min(tax, 12500);
      tax = Math.max(0, tax - rebate);
    }

    // Add 4% cess
    return tax * 1.04;
  };

  const taxResults = useMemo(() => {
    // Apply caps
    const inv80C = Math.min(investments80C, 150000);
    const inv80CCD = Math.min(investments80CCD, 50000);
    const medical = Math.min(medicalInsurance, 25000);

    const totalInvestment = inv80C + inv80CCD + medical;

    // HRA
    const hraExemption = calculateHRAExemption(basicPay, hra, houseRent, city);

    // Standard deduction commonly available to salaried taxpayers (applied in old regime)
    const standardDeduction = 50000;

    // Old regime: taxable income after deductions (ensure non-negative)
    const taxableIncomeOld = Math.max(0, grossIncome - hraExemption - totalInvestment - standardDeduction);
    const oldRegimeTax = calculateOldRegimeTax(taxableIncomeOld);

    // New regime: assume no deductions (gross income is used directly)
    const taxableIncomeNew = Math.max(0, grossIncome);
    const newRegimeTax = calculateNewRegimeTax(taxableIncomeNew);

    return {
      totalIncome: grossIncome,
      totalInvestment,
      hraExemption,
      oldRegimeTax,
      newRegimeTax,
    };
  }, [grossIncome, basicPay, hra, houseRent, city, investments80C, investments80CCD, medicalInsurance]);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Income & Tax <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-4xl mx-auto">
              Estimate your annual tax under the <strong>Old</strong> and <strong>New</strong> regimes.
              Enter your salary details and common deductions to compare which regime is more favourable.
              Results are indicative — consult a tax professional for filing.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Salary & Housing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CalculatorInput
                    label="Gross Income (annual)"
                    value={grossIncome}
                    onValueChange={setGrossIncome}
                    min={0}
                    max={5000000}
                    step={10000}
                    type="currency"
                  />

                  <CalculatorInput
                    label="Basic Pay (annual)"
                    value={basicPay}
                    onValueChange={setBasicPay}
                    min={0}
                    max={5000000}
                    step={10000}
                    type="currency"
                  />

                  <CalculatorInput
                    label="HRA received (annual)"
                    value={hra}
                    onValueChange={setHra}
                    min={0}
                    max={2000000}
                    step={5000}
                    type="currency"
                  />

                  <CalculatorInput
                    label="House Rent (monthly)"
                    value={houseRent}
                    onValueChange={setHouseRent}
                    min={0}
                    max={200000}
                    step={1000}
                    type="currency"
                  />

                  <div>
                    <Label className="text-base font-semibold mb-4 block">City</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                        <SelectItem value="kolkata">Kolkata</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deductions & Investments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CalculatorInput
                    label="Investments u/s 80C (max ₹1,50,000)"
                    value={investments80C}
                    onValueChange={setInvestments80C}
                    min={0}
                    max={150000}
                    step={1000}
                    type="currency"
                  />

                  <CalculatorInput
                    label="Investments u/s 80CCD (max ₹50,000)"
                    value={investments80CCD}
                    onValueChange={setInvestments80CCD}
                    min={0}
                    max={50000}
                    step={1000}
                    type="currency"
                  />

                  <CalculatorInput
                    label="Medical Insurance (80D) (max ₹25,000)"
                    value={medicalInsurance}
                    onValueChange={setMedicalInsurance}
                    min={0}
                    max={25000}
                    step={1000}
                    type="currency"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                    <p className="text-3xl font-bold text-primary">
                      ₹ {taxResults.totalIncome.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-2">Total Investment</p>
                      <p className="text-lg font-semibold truncate">
                        ₹ {taxResults.totalInvestment.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-2">HRA Exemption</p>
                      <p className="text-lg font-semibold truncate">
                        ₹ {Math.round(taxResults.hraExemption).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="min-w-0">
                      {/* Prevent the label from wrapping; it will truncate instead if space is tight */}
                      <p className="text-xs text-muted-foreground mb-2 whitespace-nowrap truncate">Old Regime (incl. cess)</p>
                      <p className="text-lg font-semibold truncate">
                        ₹ {Math.round(taxResults.oldRegimeTax).toLocaleString("en-IN")}
                      </p>
                    </div>

                  </div>

                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">New Regime (incl. cess)</p>
                    <p className="text-2xl font-bold text-secondary">
                      ₹ {Math.round(taxResults.newRegimeTax).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Estimates only</p>
                  </div>

                  <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                    <p>* Estimates include a 4% cess. Standard deduction (₹50,000) is applied in the old regime here. This tool simplifies some rules — consult official sources or a tax advisor for filing.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mt-8 p-6 bg-accent/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              About This Calculator
            </h2>

            <p className="text-muted-foreground">
              This tool estimates your annual tax liability under both the <strong>Old</strong> and <strong>New</strong> tax regimes,
              showing HRA exemption, capped investments, and final tax payable (including 4% cess). Use it to compare regimes,
              plan investments, and check affordability before filing.
            </p>

            <h3 className="text-lg font-semibold mt-4">What this calculator does</h3>
            <ul className="text-muted-foreground">
              <li>Computes <strong>HRA exemption</strong> based on basic pay, HRA received, rent paid and city (metro/non-metro).</li>
              <li>Applies contribution limits: <strong>80C cap ₹1,50,000</strong>, <strong>80CCD cap ₹50,000</strong>, and <strong>80D cap ₹25,000</strong> for medical insurance (as used here).</li>
              <li>Calculates tax under both regimes so you can <strong>compare total tax payable</strong> and decide which is advantageous.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">Key assumptions & limits</h3>
            <ul className="text-muted-foreground">
              <li>All amounts are treated as <em>annual</em> unless labeled monthly (e.g., House Rent input is monthly).</li>
              <li>80C investments are capped at ₹1,50,000 and 80CCD at ₹50,000 (these caps are applied in the calculation).</li>
              <li>Medical insurance (80D) is capped at ₹25,000 for the purpose of this estimate.</li>
              <li>New regime calculations assume <strong>no deduction</strong> (standard new-regime behavior) except basic exemptions built into slabs.</li>
              <li>Results include a 4% health & education cess and are indicative — final liability can change with additional allowances, rebates, or tax law updates.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">How the numbers are computed</h3>
            <ol className="text-muted-foreground">
              <li>
                <strong>HRA exemption</strong>: computed as the minimum of:
                <ul>
                  <li>HRA received (annual)</li>
                  <li>Rent paid (annual) − 10% of basic pay</li>
                  <li>40% of basic pay (non-metro) or 50% (metro)</li>
                </ul>
              </li>
              <li>
                <strong>Taxable income (Old regime)</strong> = Gross income − HRA exemption − Allowed investments (80C, 80CCD, 80D capped).
              </li>
              <li>
                <strong>Tax computation</strong>: applies slab rates to taxable income:
                <ul>
                  <li><em>Old regime</em> slabs & rates are applied to taxable income after deductions.</li>
                  <li><em>New regime</em> applies its slab structure directly on gross income (no deductions considered).</li>
                </ul>
              </li>
              <li>
                A <strong>4% cess</strong> is added to computed tax. The tool currently does not include education cess, surcharge specifics, or other niche rebates.
              </li>
            </ol>

            <h3 className="text-lg font-semibold mt-4">Practical tips</h3>
            <ul className="text-muted-foreground">
              <li>If your 80C &amp; 80CCD investments are near the cap, you’ll often benefit more from the <strong>Old regime</strong> only if the deductions materially reduce taxable income into a lower slab.</li>
              <li>For salaried taxpayers with high HRA and rent, carefully check the <strong>HRA exemption</strong> — it can noticeably reduce old-regime tax.</li>
              <li>Use the side summary to directly compare the final tax payable under both regimes before making investment or filing choices.</li>
            </ul>

            <p className="text-xs text-muted-foreground mt-4">
              <strong>Disclaimer:</strong> This calculator provides estimates for planning purposes only. It simplifies some allowances and caps; consult a tax professional or the latest finance act for exact filing figures.
            </p>
          </Card>

        </div>
      </div >
      <footer className="bg-card border-t border-border py-8 px-4"> <div className="container mx-auto max-w-6xl text-center text-muted-foreground text-sm"> <p>© 2025 LoanMantrra. All rights reserved.</p> <p className="mt-2">Connecting you with trusted financial institutions across India.</p> </div> </footer>
    </div >
  );
};

export default IncomeTaxCalculator;
