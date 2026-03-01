import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const CONTACT_PHONE = "+91 98765 43210"; // single source of truth
const CONTACT_PHONE_TEL = "+919876543210";
const CONTACT_EMAIL = "info@loanmantrra.in";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    // honeypot field (should remain empty)
    hp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check: if filled, silently ignore
    if (formData.hp) {
      console.warn("Spam bot detected - honeypot filled");
      return;
    }

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    if (!message) {
      toast.error("Please enter a message");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        formName: "Contact Us",
        type: "contact",
        channel: "contact_page",
        slaHours: 24,
        applicantName: name,
        email,
        message, // will be in payload
      }

      const res = await api.createSubmission(payload);

      if (res?.id) {
        const slaDate = new Date(res.slaDeadline);
        const slaStr = slaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        toast.success(`Message sent — Ref: ${res.id.substring(0, 8)}`, {
          description: `We'll respond within 24 hours (by ${slaStr}).`,
        });
        setFormData({ name: "", email: "", message: "", hp: "" });
      } else {
        toast.error("Unable to send message. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? Our advisers will help you compare loan offers and find the best rates.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: About & Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">About LoanMantrra</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  LoanMantrra is a trusted Direct Selling Agent (DSA) and loan aggregation platform that connects customers with India's leading banks and financial institutions. We help individuals and businesses find the most suitable loan products at competitive rates.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our mission is to simplify the loan process with expert guidance and personalised service.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">Contact Information</h3>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Phone</div>
                    <a href={`tel:${CONTACT_PHONE_TEL}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {CONTACT_PHONE}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Email</div>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-muted-foreground hover:text-secondary transition-colors">
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Address</div>
                    <p className="text-muted-foreground">
                      123 Business Park, MG Road<br />
                      Mumbai, Maharashtra 400001<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Business Hours</div>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div>
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-6">Send us a Message</h3>

                <form onSubmit={handleSubmit} className="space-y-5" aria-describedby="contact-form-desc">
                  <input
                    // honeypot: keep it visually hidden but accessible to bots
                    type="text"
                    name="hp"
                    value={formData.hp}
                    onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-sm font-medium">
                      Your Name *
                    </Label>
                    <Input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message" className="text-sm font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="min-h-[150px] resize-none"
                      required
                      aria-required="true"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? "Sending…" : "Send Message"}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Need immediate assistance? Call us at{" "}
                    <a href={`tel:${CONTACT_PHONE_TEL}`} className="text-primary font-semibold hover:underline">
                      {CONTACT_PHONE}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Apply for a Loan?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get personalised loan offers from multiple lenders in minutes. Fill out our quick form and let us find the best rates for you.
            </p>
            <a href="/loans" className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg">
              Apply for Loan Now
            </a>
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

export default Contact;
