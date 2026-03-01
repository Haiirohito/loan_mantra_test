import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Shield, CheckCircle2, Lock } from "lucide-react";

const LeadForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    loanType: "",
    preferredBank: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.loanType) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    // Payload
    const payload = {
      formName: "Home - Lead Form",
      type: "loan",
      loanType: formData.loanType,
      priority: "normal",
      slaHours: 48,
      channel: "site_lead_form",
      applicantName: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      preferredBank: formData.preferredBank
    };

    try {
      const res = await api.createSubmission(payload);

      const slaDate = new Date(res.slaDeadline);
      const slaStr = slaDate.toLocaleString();

      toast.success(`Request received — Ref: ${res.id.substring(0, 8)}`, {
        description: `We will contact you by ${slaStr}.`,
        duration: 8000
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        loanType: "",
        preferredBank: "",
      });

      // Redirect to loans page
      setTimeout(() => {
        navigate("/loans");
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="10-digit mobile number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="h-11"
            maxLength={10}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            City *
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Your city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loanType" className="text-sm font-medium">
            Loan Type *
          </Label>
          <Select
            value={formData.loanType}
            onValueChange={(value) => setFormData({ ...formData, loanType: value })}
          >
            <SelectTrigger id="loanType" className="h-11">
              <SelectValue placeholder="Select loan type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="home">Home Loan</SelectItem>
              <SelectItem value="personal">Personal Loan</SelectItem>
              <SelectItem value="business">Business Loan</SelectItem>
              <SelectItem value="car">Car Loan</SelectItem>
              <SelectItem value="education">Education Loan</SelectItem>
              <SelectItem value="gold">Gold Loan</SelectItem>
              <SelectItem value="mortgage">Mortgage Loan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
        >
          Proceed
        </Button>

        <div className="flex flex-wrap gap-4 justify-center pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-secondary" />
            <span>Data Secured</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-secondary" />
            <span>Verified Lenders</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <span>No Hidden Fees</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
