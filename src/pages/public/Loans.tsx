import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Home as HomeIcon,
  Briefcase,
  Car,
  GraduationCap,
  Coins,
  Building2,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface Loan {
  name: string;
  interestRate: string;
  features: string[];
  description: string;
}

interface LoanCategory {
  icon: LucideIcon;
  category: string;
  description: string;
  loans: Loan[];
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const Loans: React.FC = () => {
  const loanCategories: LoanCategory[] = [
    {
      icon: HomeIcon,
      category: "Home Loans",
      description:
        "Turn your homeownership dream into reality with attractive and reliable financing options",
      loans: [
        {
          name: "Home Purchase Loan",
          interestRate: "8.5% - 9.0% p.a.",
          features: [
            "Funding up to 90%",
            "Flexible tenure up to 30 years",
            "Eligible for tax benefits",
          ],
          description:
            "Affordable financing to help you purchase your ideal home",
        },
        {
          name: "Home Construction Loan",
          interestRate: "9.0% - 9.5% p.a.",
          features: [
            "Stage-based disbursement",
            "Tenure up to 30 years",
            "Convenient repayment options",
          ],
          description:
            "Finance the construction of your home from the foundation upward",
        },
      ],
    },
    {
      icon: CreditCard,
      category: "Personal Loans",
      description:
        "Fast, hassle-free personal loans designed for your immediate financial needs",
      loans: [
        {
          name: "Instant Personal Loan",
          interestRate: "10.5% - 14% p.a.",
          features: [
            "Quick approval",
            "No collateral required",
            "Same-day disbursal",
          ],
          description:
            "Access instant funds for emergencies or personal expenses",
        },
        {
          name: "Debt Consolidation Loan",
          interestRate: "12% - 18% p.a.",
          features: [
            "Merge multiple debts",
            "Single monthly EMI",
            "Potentially lower interest",
          ],
          description:
            "Simplify your finances by consolidating all existing debts",
        },
      ],
    },
    {
      icon: Briefcase,
      category: "Business Loans",
      description:
        "Support your business growth with flexible funding tailored to your operations",
      loans: [
        {
          name: "Working Capital Loan",
          interestRate: "11% - 14% p.a.",
          features: [
            "Fast processing",
            "Flexible repayment",
            "Minimal documentation",
          ],
          description:
            "Ensure smooth day-to-day operations with reliable capital support",
        },
        {
          name: "Business Expansion Loan",
          interestRate: "12% - 16% p.a.",
          features: [
            "Higher loan limits",
            "Extended tenures",
            "Attractive interest rates",
          ],
          description:
            "Fuel your business expansion and long-term growth plans",
        },
      ],
    },
    {
      icon: Car,
      category: "Vehicle Loans",
      description:
        "Bring home your dream vehicle with easy and affordable financing",
      loans: [
        {
          name: "New Car Loan",
          interestRate: "8.5% - 10% p.a.",
          features: [
            "Up to 90% financing",
            "Tenure up to 7 years",
            "Quick approval",
          ],
          description: "Convenient financing for brand new vehicles",
        },
        {
          name: "Used Car Loan",
          interestRate: "9.5% - 11% p.a.",
          features: [
            "Up to 80% funding",
            "Tenure up to 5 years",
            "Easy documentation",
          ],
          description:
            "Buy a quality pre-owned vehicle with flexible loan options",
        },
      ],
    },
    {
      icon: GraduationCap,
      category: "Education Loans",
      description:
        "Invest in quality education with reliable and student-friendly financing",
      loans: [
        {
          name: "Domestic Education Loan",
          interestRate: "9% - 11% p.a.",
          features: [
            "100% coverage",
            "Includes moratorium period",
            "Eligible for tax deductions",
          ],
          description:
            "Finance higher education at leading institutions within India",
        },
        {
          name: "International Education Loan",
          interestRate: "10.5% - 13.5% p.a.",
          features: [
            "Covers tuition and living expenses",
            "Grace period available",
            "Flexible repayment schedule",
          ],
          description:
            "Pursue overseas education with comprehensive financial support",
        },
      ],
    },
    {
      icon: Coins,
      category: "Gold Loans",
      description:
        "Access quick liquidity by leveraging the value of your gold assets",
      loans: [
        {
          name: "Gold Loan – Regular",
          interestRate: "7% - 9% p.a.",
          features: [
            "Immediate approval",
            "Simple documentation",
            "Flexible tenure options",
          ],
          description:
            "Get instant funds while keeping your gold safe and secure",
        },
        {
          name: "Gold Loan – Overdraft",
          interestRate: "8% - 10% p.a.",
          features: [
            "Interest charged only on the amount used",
            "Flexible withdrawals",
            "Convenient overdraft facility",
          ],
          description: "Enjoy on-demand access to funds against your gold",
        },
      ],
    },
    {
      icon: Building2,
      category: "Property Loans",
      description:
        "Utilize the value of your property to meet personal or business financial requirements",
      loans: [
        {
          name: "Mortgage Loan",
          interestRate: "9% - 11% p.a.",
          features: [
            "High loan eligibility",
            "Long repayment tenure",
            "Competitive rates",
          ],
          description: "Secure financing using residential property",
        },
        {
          name: "Commercial Property Loan",
          interestRate: "10% - 12% p.a.",
          features: [
            "Up to 65% of property value",
            "Flexible repayment",
            "Fast and efficient processing",
          ],
          description:
            "Finance the purchase or growth of commercial real estate",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Discover the Right Loan for Your{" "}
              <span className="text-primary">Financial Goals</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore a comprehensive range of loan products designed to support
              your personal, professional, and lifestyle aspirations.
            </p>
          </div>

          {/* LeadForm removed */}

          <div className="space-y-16 mb-12">
            {loanCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              const categorySlug = slugify(category.category);
              return (
                <section key={categoryIndex} className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {category.category}
                      </h3>
                      <p className="text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.loans.map((loan, loanIndex) => {
                      const loanSlug = slugify(loan.name);
                      return (
                        <Card
                          key={loanIndex}
                          className="border-border hover:shadow-lg transition-all duration-300 flex flex-col"
                        >
                          <CardHeader>
                            <CardTitle className="text-lg">
                              {loan.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {loan.description}
                            </p>
                          </CardHeader>

                          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              {loan.features.map((feature, featureIndex) => (
                                <div
                                  key={featureIndex}
                                  className="flex items-center gap-2 text-sm text-muted-foreground"
                                >
                                  <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-4 border-t border-border mt-auto">
                              <p className="text-sm font-semibold text-foreground mb-4">
                                Interest Rate:{" "}
                                <span className="text-primary">
                                  {loan.interestRate}
                                </span>
                              </p>

                              <Link
                                to={`/apply/${categorySlug}/${loanSlug}`}
                                state={{ loan, category: category.category }}
                                className="block"
                              >
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                  Apply Now
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Unsure Which Loan Fits{" "}
              <span className="text-primary">Your Needs ?</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our financial specialists can guide you to the most suitable loan
              product based on your goals and requirements.
            </p>
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Speak With an Expert
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Loans;
