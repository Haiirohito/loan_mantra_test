import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";

type LocationState = {
  loan?: {
    name: string;
    interestRate?: string;
    description?: string;
    features?: string[];
  };
  category?: string;
} | null;

const decodeSlug = (s?: string) =>
  s ? decodeURIComponent(s).replace(/-/g, " ") : "";

const ApplyLoanForm: React.FC = () => {
  const { categorySlug, loanSlug } = useParams<{
    categorySlug?: string;
    loanSlug?: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as LocationState) ?? null;

  const [loanName, setLoanName] = useState<string>(
    state?.loan?.name ?? decodeSlug(loanSlug)
  );
  const [categoryName, setCategoryName] = useState<string>(
    state?.category ?? decodeSlug(categorySlug)
  );
  const [interestRate, setInterestRate] = useState<string>(
    state?.loan?.interestRate ?? ""
  );

  // common fields
  const [applicantName, setApplicantName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // conditional fields
  const [employer, setEmployer] = useState<string>("");
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [propertyValue, setPropertyValue] = useState<string>("");
  const [propertyLocation, setPropertyLocation] = useState<string>("");
  const [vehicleMakeModel, setVehicleMakeModel] = useState<string>("");
  const [vehicleYear, setVehicleYear] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [estimatedGoldValue, setEstimatedGoldValue] = useState<string>("");

  useEffect(() => {
    if (state?.loan?.interestRate) setInterestRate(state.loan.interestRate);
    if (state?.loan?.name) setLoanName(state.loan.name);
    if (state?.category) setCategoryName(state.category);
  }, [state]);

  // Helper: concise content per category
  const infoByCategory = (cat: string) => {
    const key = (cat || "").toLowerCase();
    switch (true) {
      case key.includes("home"):
      case key.includes("property"):
        return {
          eligibility:
            "Resident of India, age 21–70 (at loan maturity). Stable income and standard credit history.",
          documents:
            "ID, address proof, income proof (salary/ITR), bank statements, property documents (title, plan).",
          next: "Preliminary assessment, documentation request, property valuation and lender sanction if eligible.",
        };

      case key.includes("personal"):
        return {
          eligibility:
            "Resident of India, age 21–60. Minimum qualifying income and satisfactory credit score.",
          documents:
            "ID, address proof, latest salary slips or bank statements, PAN/ITR where applicable.",
          next: "Quick eligibility check, document upload request, credit assessment and offer of terms.",
        };

      case key.includes("business"):
        return {
          eligibility:
            "Active business entity, minimum operating history (varies by lender), business stability and cash flows.",
          documents:
            "Business proof (registration), bank statements, financials/ITR, promoter ID proof.",
          next: "Business assessment, KYC & financial review, lender quote and disbursement scheduling.",
        };

      case key.includes("vehicle"):
        return {
          eligibility:
            "Resident of India, age 21–65. Employed or self-employed with minimum income criteria.",
          documents:
            "ID, address proof, income proof, vehicle quote / dealer invoice (for new vehicles).",
          next: "Loan sanction on documentation, vehicle inspection (for used cars), dealer coordination for disbursal.",
        };

      case key.includes("education"):
        return {
          eligibility:
            "Admission offer or fee schedule from recognized institution. Co-applicant may be required.",
          documents:
            "Admission/fee letter, ID, address proof, co-applicant KYC, income proof (if required).",
          next: "Loan estimation, required document list, sanction and disbursal to institution.",
        };

      case key.includes("gold"):
        return {
          eligibility:
            "Resident of India. Owner of acceptable gold jewellery or coins to pledge.",
          documents:
            "ID, address proof and the gold items for valuation at branch or pickup.",
          next: "Gold valuation, immediate sanction for eligible LTV and flexible repayment options.",
        };

      default:
        return {
          eligibility:
            "Standard KYC and minimum income criteria apply; specific terms depend on the lender and product.",
          documents:
            "ID, address proof, income proof (where applicable). Additional documents may be requested.",
          next: "Application review, document verification, and lender-specific offer/next steps.",
        };
    }
  };

  // Helper: render extra form fields for specific categories
  const renderExtraFields = (cat: string) => {
    const key = (cat || "").toLowerCase();

    if (key.includes("home") || key.includes("property")) {
      return (
        <>
          <div>
            <Label className="mb-1">Property value (₹)</Label>
            <Input
              value={formatINR(propertyValue)}
              onChange={(e) => setPropertyValue(unformatINR(e.target.value))}
              placeholder="Estimated market value"
            />
          </div>

          <div>
            <Label className="mb-1">Property location</Label>
            <Input
              value={propertyLocation}
              onChange={(e) => setPropertyLocation(e.target.value)}
              placeholder="City / Locality"
            />
          </div>
        </>
      );
    }

    if (key.includes("personal") || key.includes("business")) {
      return (
        <>
          <div>
            <Label className="mb-1">Employer / Business name</Label>
            <Input
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              placeholder="Company or business name"
            />
          </div>

          <div>
            <Label className="mb-1">Monthly net income (₹)</Label>
            <Input
              value={formatINR(monthlyIncome)}
              onChange={(e) => setMonthlyIncome(unformatINR(e.target.value))}
              placeholder="e.g. 40,000"
            />
          </div>
        </>
      );
    }

    if (key.includes("vehicle")) {
      return (
        <>
          <div>
            <Label className="mb-1">Vehicle make & model</Label>
            <Input
              value={vehicleMakeModel}
              onChange={(e) => setVehicleMakeModel(e.target.value)}
              placeholder="e.g. Maruti Swift"
            />
          </div>

          <div>
            <Label className="mb-1">Vehicle year</Label>
            <Input
              value={vehicleYear}
              onChange={(e) => setVehicleYear(e.target.value)}
              placeholder="e.g. 2024"
            />
          </div>
        </>
      );
    }

    if (key.includes("education")) {
      return (
        <>
          <div>
            <Label className="mb-1">Institution name</Label>
            <Input
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="College / University name"
            />
          </div>

          <div>
            <Label className="mb-1">Course / Program</Label>
            <Input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. MSc Computer Science"
            />
          </div>
        </>
      );
    }

    if (key.includes("gold")) {
      return (
        <div>
          <Label className="mb-1">Estimated gold value (₹)</Label>
          <Input
            value={formatINR(estimatedGoldValue)}
            onChange={(e) => setEstimatedGoldValue(unformatINR(e.target.value))}
            placeholder="Approximate market value"
          />
        </div>
      );
    }

    return null;
  };

  // ... (imports remain the same, just adding api and toast)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      formName: `${categoryName} - ${loanName}`, // Important for grouping
      type: "loan",
      loanType: categoryName.toLowerCase().split(" ")[0] || "general",
      priority: "normal",
      slaHours: 48,
      loanName,
      categoryName,
      interestRate,
      applicantName,
      email,
      phone,
      amount,
      notes,
      // conditional fields
      employer,
      monthlyIncome,
      propertyValue,
      propertyLocation,
      vehicleMakeModel,
      vehicleYear,
      institution,
      course,
      estimatedGoldValue,
    };

    try {
      const res = await api.createSubmission(payload);
      navigate("/success", {
        state: {
          id: res.id,
          formName: payload.formName,
          slaDeadline: res.slaDeadline,
          type: res.type
        }
      });
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Submission failed", {
        description: "Please try again later.",
      });
    }
  };

  // Formats a numeric string (e.g., "10000000") into Indian format ("1,00,00,000")
  const formatINR = (value: string) => {
    if (!value) return "";
    const numeric = value.replace(/[^0-9]/g, "");

    if (numeric.length <= 3) return numeric;

    // Last 3 digits stay together
    const lastThree = numeric.slice(-3);
    const rest = numeric.slice(0, -3);

    // Add commas every 2 digits in the rest (Indian style)
    const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

    return `${formattedRest},${lastThree}`;
  };

  // Removes commas → "1,00,00,000" → "10000000"
  const unformatINR = (value: string) => value.replace(/[^0-9]/g, "");

  const info = infoByCategory(categoryName);

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Apply for{" "}
              <span className="text-primary">{loanName ?? "Loan"}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {categoryName} · {interestRate || "Interest rate varies"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applicant details</CardTitle>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label className="mb-1">Full name</Label>
                      <Input
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-1">Email</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@domain.com"
                          required
                        />
                      </div>

                      <div>
                        <Label className="mb-1">Phone</Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 98XXXXXXXX"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-1">Requested loan amount (₹)</Label>
                      <Input
                        value={formatINR(amount)}
                        onChange={(e) => setAmount(unformatINR(e.target.value))}
                        placeholder="e.g. 5,00,000"
                        required
                      />
                    </div>

                    {/* conditional extra fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderExtraFields(categoryName)}
                    </div>

                    <div>
                      <Label className="mb-1">Notes (optional)</Label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-md border border-border p-3 min-h-[120px] resize-vertical focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Any additional details"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        By submitting, you consent to being contacted for
                        verification.
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => navigate(-1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Submit Application
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Tailored Info Section */}
              <Card className="mt-6 p-6 bg-accent/50">
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  About this application
                </h2>

                <p className="text-sm text-muted-foreground">
                  {info.eligibility}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Required documents
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {info.documents}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Next steps
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {info.next}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Loan summary and tailored benefits */}
            <aside className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Loan summary</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Product</p>
                    <div className="text-foreground font-medium">
                      {loanName ?? "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <div className="text-foreground font-medium">
                      {categoryName ?? "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Indicative rate
                    </p>
                    <div className="text-foreground font-medium">
                      {interestRate || "Varies"}
                    </div>
                  </div>

                  {/* show features if available; otherwise show benefits tuned by category */}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Key benefits
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                      {state?.loan?.features?.length
                        ? state.loan.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))
                        : // fallback benefits per category
                        ((): JSX.Element[] => {
                          const key = (categoryName || "").toLowerCase();
                          if (
                            key.includes("home") ||
                            key.includes("property")
                          ) {
                            return [
                              <li key="1">
                                Competitive long-tenure financing
                              </li>,
                              <li key="2">
                                Tax benefits (where applicable)
                              </li>,
                            ];
                          }
                          if (key.includes("personal")) {
                            return [
                              <li key="1">Quick approvals</li>,
                              <li key="2">
                                No collateral for most products
                              </li>,
                            ];
                          }
                          if (key.includes("business")) {
                            return [
                              <li key="1">Higher limits for growth</li>,
                              <li key="2">Flexible repayment</li>,
                            ];
                          }
                          if (key.includes("vehicle")) {
                            return [
                              <li key="1">Dealer tie-up disbursal</li>,
                              <li key="2">
                                Competitive interest for new cars
                              </li>,
                            ];
                          }
                          if (key.includes("education")) {
                            return [
                              <li key="1">
                                Grace periods & moratorium options
                              </li>,
                              <li key="2">
                                Covers tuition & living costs (product
                                dependent)
                              </li>,
                            ];
                          }
                          if (key.includes("gold")) {
                            return [
                              <li key="1">
                                Immediate liquidity against pledged gold
                              </li>,
                              <li key="2">Simple documentation</li>,
                            ];
                          }
                          return [<li key="1">Fast application review</li>];
                        })()}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground">
                      Submitting this form starts an application process; final
                      terms depend on lender verification.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 p-4 text-sm text-muted-foreground">
                <div className="font-medium text-foreground mb-1">
                  Quick notes
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Complete required fields to avoid delays.</li>
                  <li>
                    We will contact you for document upload and verification.
                  </li>
                </ul>
              </Card>
            </aside>
          </div>

          {/* Footer */}
          <footer className="mt-10 bg-card border-t border-border py-6 px-4">
            <div className="container mx-auto max-w-6xl text-center text-muted-foreground text-sm">
              <p>
                © {new Date().getFullYear()} LoanMantrra. All rights reserved.
              </p>
              <p className="mt-1">
                Connecting you with trusted financial partners across India.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ApplyLoanForm;
