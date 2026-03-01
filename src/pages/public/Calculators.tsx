import {
  Calculator,
  TrendingUp,
  PiggyBank,
  Wallet,
  Building2,
  CreditCard,
  Repeat,
  ArrowRightLeft,
  Briefcase,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const calculators = [
  {
    id: "income-tax",
    name: "Income Tax Calculator",
    description: "Estimate your tax liability for the financial year",
    icon: DollarSign,
  },
  {
    id: "sip",
    name: "SIP Calculator",
    description: "Plan SIPs with projected returns",
    icon: TrendingUp,
  },
  {
    id: "fd",
    name: "FD Calculator",
    description: "Calculate FD maturity and interest",
    icon: PiggyBank,
  },
  {
    id: "rd",
    name: "RD Calculator",
    description: "Estimate RD maturity value",
    icon: Wallet,
  },
  {
    id: "gst",
    name: "GST Calculator",
    description: "Compute GST for goods and services",
    icon: Calculator,
  },
  {
    id: "home-loan-emi",
    name: "Home Loan EMI Calculator",
    description: "Calculate monthly EMI for home loans",
    icon: Building2,
  },
  {
    id: "home-loan-prepayment",
    name: "Home Loan Pre-payment Calculator",
    description: "See how prepayments reduce interest and tenure",
    icon: Repeat,
  },
  {
    id: "personal-loan-emi",
    name: "Personal Loan EMI Calculator",
    description: "Estimate EMIs for personal loans",
    icon: CreditCard,
  },
  {
    id: "personal-loan-prepayment",
    name: "Personal Loan Pre-payment Calculator",
    description: "Calculate savings from prepaying your loan",
    icon: ArrowRightLeft,
  },
  {
    id: "business-loan-emi",
    name: "Business Loan EMI Calculator",
    description: "Calculate monthly payments for business loans",
    icon: Briefcase,
  },
  {
    id: "business-loan-prepayment",
    name: "Business Loan Pre-payment Calculator",
    description: "Analyze prepayment benefits for business loans",
    icon: TrendingUp,
  },
  {
    id: "compound-interest",
    name: "Compound Interest Calculator",
    description: "Compute compound returns for investments",
    icon: ArrowRightLeft,
  },
];

const Calculators = () => {
  const navigate = useNavigate();

  const handleCalculatorClick = (calcId: string, calcName: string) => {
    switch (calcId) {
      case "income-tax":
        return navigate("/calculators/income-tax");
      case "sip":
        return navigate("/calculators/sip");
      case "fd":
        return navigate("/calculators/fd");
      case "rd":
        return navigate("/calculators/rd");
      case "gst":
        return navigate("/calculators/gst");
      case "home-loan-emi":
        return navigate("/calculators/home-loan-emi");
      case "personal-loan-emi":
        return navigate("/calculators/personal-loan-emi");
      case "compound-interest":
        return navigate("/calculators/compound-interest");
      case "business-loan-emi":
        return navigate("/calculators/business-loan-emi");
      case "business-loan-prepayment":
        return navigate("/calculators/business-loan-prepayment");
      default:
        toast.info(`${calcName} coming soon!`, {
          description: "This calculator will be available shortly.",
        });
    }
  };

  // handle keyboard activation for cards
  const handleKeyDown = (
    e: React.KeyboardEvent,
    calcId: string,
    calcName: string
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCalculatorClick(calcId, calcName);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Smart Financial <span className="text-primary">Calculators</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tools to help you model loans, investments and taxes quickly and
              accurately.
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators.map((calc) => {
              const Icon = calc.icon;
              return (
                <Card
                  key={calc.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${calc.name} — ${calc.description}`}
                  onClick={() => handleCalculatorClick(calc.id, calc.name)}
                  onKeyDown={(e) => handleKeyDown(e, calc.id, calc.name)}
                  className="cursor-pointer bg-card/90 hover:bg-card border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 text-orange-500`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-card-foreground">
                      {calc.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {calc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                      <span>Launch</span>
                      <ArrowRightLeft className="w-4 h-4 ml-2 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Need guidance on <span className="text-primary">loans ?</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our advisors can help you compare options and choose the most
              suitable product.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Request Quotes
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors"
              >
                Speak to an Advisor
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground text-sm">
          <p>© 2025 LoanMantrra. All rights reserved.</p>
          <p className="mt-2">
            Connecting you with trusted financial institutions across India.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Calculators;
