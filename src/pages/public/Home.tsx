import {
  Building2,
  Users,
  Clock,
  Shield,
  ChevronRight,
  Star,
  Lock,
  Calculator,
  Percent,
  PiggyBank,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  const loanTypes = [
    { name: "Home Loan", icon: "🏠" },
    { name: "Business Loan", icon: "💼" },
    { name: "Personal Loan", icon: "👤" },
    { name: "LAP", icon: "🏢" },
  ];

  const benefits = [
    {
      icon: Building2,
      title: "50+ Lenders",
      description: "Access verified banks & NBFCs in one place",
      stat: "50+",
      statLabel: "Partners",
    },
    {
      icon: Clock,
      title: "Fast Processing",
      description: "Get approvals in as early as 24–48 hours",
      stat: "24h",
      statLabel: "Turnaround",
    },
    {
      icon: Users,
      title: "Dedicated Advisors",
      description: "Expert guidance throughout your journey",
      stat: "1:1",
      statLabel: "Support",
    },
    {
      icon: Shield,
      title: "Transparent Terms",
      description: "No hidden fees, complete clarity upfront",
      stat: "100%",
      statLabel: "Transparent",
    },
  ];

  const bankLogos = [
    "HDFC Bank",
    "ICICI Bank",
    "State Bank of India",
    "Axis Bank",
    "Kotak Mahindra",
    "Yes Bank",
    "IndusInd Bank",
    "Federal Bank",
  ];

  const steps = [
    {
      number: "01",
      title: "Share Requirements",
      description: "Tell us your loan needs in under 2 minutes",
      icon: Sparkles,
    },
    {
      number: "02",
      title: "Compare Offers",
      description: "Review personalized quotes from multiple lenders",
      icon: TrendingUp,
    },
    {
      number: "03",
      title: "Get Funded",
      description: "Connect with your advisor and close the deal",
      icon: BadgeCheck,
    },
  ];

  const calculators = [
    {
      name: "EMI Calculator",
      icon: Calculator,
      path: "/calculators/home-loan-emi",
      desc: "Plan your monthly payments",
    },
    {
      name: "Income Tax",
      icon: Percent,
      path: "/calculators/income-tax",
      desc: "Estimate your tax liability",
    },
    {
      name: "FD Calculator",
      icon: PiggyBank,
      path: "/calculators/fd",
      desc: "Calculate FD returns",
    },
  ];

  const stats = [
    { value: "₹500Cr+", label: "Loans Disbursed" },
    { value: "10,000+", label: "Happy Customers" },
    { value: "4.8★", label: "Customer Rating" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 px-4 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background -z-10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center">
            {/* Trust badge */}
            <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm mb-8">
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">
                Trusted by 10,000+ customers across India
              </span>
            </div>

            <h1 className="animate-slide-up-delay-1 text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] text-balance">
              Smart Loan Matching,{" "}
              <span className="text-primary">Simplified</span>
            </h1>

            <p className="animate-slide-up-delay-2 text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Compare offers from 50+ lenders. Get the best rates. Close faster.
            </p>

            <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/loans">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  Get Free Quotes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/calculators">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base font-medium"
                >
                  Try Calculators
                </Button>
              </Link>
            </div>

            <p className="animate-slide-up-delay-4 text-sm text-muted-foreground mb-12">
              No spam. No commitment. 100% free.
            </p>

            {/* Loan Type Pills */}
            <div className="animate-slide-up-delay-4 flex flex-wrap justify-center gap-3">
              {loanTypes.map((loan) => (
                <Link
                  key={loan.name}
                  to="/loans"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:bg-accent/50 transition-all duration-300"
                >
                  <span className="text-base">{loan.icon}</span>
                  <span>{loan.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-8 px-4 border-y border-border bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 lg:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wide">
              Why Choose Us
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Built for Your Convenience
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've streamlined the loan process so you can focus on what
              matters most
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute top-6 right-6 text-4xl font-bold text-muted/40 group-hover:text-primary/70 group-hover:scale-110 transition-all duration-300">
                  {benefit.stat}
                </div>

                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wide">
              Simple Process
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Three Steps to Your Loan
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center group">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-border group-hover:border-primary/50 transition-colors duration-500" />
                  {/* Inner circle */}
                  <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:shadow-lg transition-all duration-300">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Partnered With
            </p>
            <h3 className="text-xl font-medium text-foreground">
              Leading Financial Institutions
            </h3>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 mb-12">
            {bankLogos.map((bank) => (
              <span
                key={bank}
                className="text-sm font-medium text-muted-foreground/50 hover:text-foreground transition-colors duration-300"
              >
                {bank}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-sm">
              <Lock className="h-4 w-4 text-secondary" />
              <span className="text-foreground">Bank-grade Security</span>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-sm">
              <BadgeCheck className="h-4 w-4 text-secondary" />
              <span className="text-foreground">RBI Compliant Partners</span>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-sm">
              <Star className="h-4 w-4 text-secondary fill-secondary" />
              <span className="text-foreground">4.8/5 Customer Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Teaser */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">
                Tools
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Financial Calculators
              </h2>
            </div>
            <Link
              to="/calculators"
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 group"
            >
              View all calculators
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {calculators.map((calc) => (
              <Link
                key={calc.name}
                to={calc.path}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <calc.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {calc.name}
                </h3>
                <p className="text-sm text-muted-foreground">{calc.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />

        <div className="container mx-auto max-w-3xl text-center relative">
          <div className="bg-card rounded-3xl p-10 md:p-14 border border-border shadow-xl">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Ready to Find Your Best Rate?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of Indians who found their perfect loan through
              LoanMantrra.
            </p>

            <Link to="/loans">
              <Button
                size="lg"
                className="h-14 px-10 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Free Service
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                No Impact on Credit Score
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                2-Minute Application
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-border bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="font-semibold text-foreground mb-4">
                LoanMantrra
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                India's trusted loan comparison platform. Compare, choose, and
                save.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">
                Quick Links
              </h4>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <Link
                  to="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/loans"
                  className="hover:text-foreground transition-colors"
                >
                  Apply for Loan
                </Link>
                <Link
                  to="/calculators"
                  className="hover:text-foreground transition-colors"
                >
                  Calculators
                </Link>
                <Link
                  to="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Disclaimer
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">
                Registered Office
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                DSA Registration: XXXXX
                <br />
                CIN: XXXXXXXXXX
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span className="text-xs font-medium">in</span>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span className="text-xs font-medium">X</span>
                </a>
              </div>
            </div>
          </div>

          <div className="container mx-auto max-w-6xl text-center text-muted-foreground text-sm">
            <p>© 2025 LoanMantrra. All rights reserved.</p>
            <p className="mt-2">
              Connecting you with trusted financial institutions across India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
