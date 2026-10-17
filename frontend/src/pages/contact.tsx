import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  MessageCircle,
  Handshake,
  Newspaper,
  Wrench,
  ChevronDown,
  Mail,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Github,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const floatingVariant = {
  initial: { y: 0 },
  animate: {
    y: [0, -20, 0],
    transition: { duration: 3, repeat: Infinity, repeatType: 'loop' as const, ease: 'easeInOut' as any },
  },
};

interface FormData {
  fullName: string;
  email: string;
  organization: string;
  subject: string;
  userType: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  subject?: string;
  userType?: string;
  message?: string;
}

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    organization: '',
    subject: '',
    userType: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.userType) newErrors.userType = 'Please select a type';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Replace with actual API endpoint
      console.log('Form submitted:', formData);

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        email: '',
        organization: '',
        subject: '',
        userType: '',
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const contactCards = [
    {
      icon: MessageCircle,
      title: 'General Support',
      description: 'Need help using Koda AI? Contact our support team.',
      email: 'support@kodaai.com',
      color: 'from-[#33D6D1]',
    },
    {
      icon: Handshake,
      title: 'Business Partnerships',
      description: 'Interested in partnering with Koda AI as a company or university?',
      email: 'partnerships@kodaai.com',
      color: 'from-[#35B7FF]',
    },
    {
      icon: Newspaper,
      title: 'Media & Press',
      description: 'For media inquiries and press-related requests.',
      email: 'press@kodaai.com',
      color: 'from-[#7A4DFF]',
    },
    {
      icon: Wrench,
      title: 'Technical Support',
      description: 'Report bugs or technical issues with the platform.',
      email: 'tech@kodaai.com',
      color: 'from-[#33D6D1]',
    },
  ];

  const faqItems = [
    {
      question: 'How can students join Koda AI?',
      answer:
        'Students can register on our platform, complete their profile with skills and experience, take technical assessments, and get matched with internship opportunities tailored to their abilities.',
    },
    {
      question: 'How can companies post internships?',
      answer:
        'Companies can create an account, verify their business information, and access the internship posting dashboard. You can define role requirements, skills needed, and let our AI matching system find qualified candidates.',
    },
    {
      question: 'How do universities become partners?',
      answer:
        'Universities can partner with Koda AI to verify student enrollment, monitor internship placements, and gain insights into student career outcomes. Contact our partnerships team to discuss integration.',
    },
    {
      question: 'How long does it take to receive a response?',
      answer:
        'We aim to respond to all inquiries within 1–2 business days. For urgent technical issues, our support team prioritizes responses within 24 hours.',
    },
    {
      question: 'How can I report a technical issue?',
      answer:
        'You can submit a technical support request through the contact form, email tech@kodaai.com, or use the in-platform help section. Include details about the issue, steps to reproduce, and your browser/device information.',
    },
  ];

  const socialLinks = [
    { icon: Linkedin, label: 'LinkedIn', url: '#', status: 'Coming Soon' },
    { icon: Facebook, label: 'Facebook', url: '#', status: 'Coming Soon' },
    { icon: Instagram, label: 'Instagram', url: '#', status: 'Coming Soon' },
    { icon: Twitter, label: 'Twitter (X)', url: '#', status: 'Coming Soon' },
    { icon: Github, label: 'GitHub', url: '#', status: 'Coming Soon' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ============================================================
          SECTION 1: HERO
          ============================================================ */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#33D6D1]/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-br from-[#7A4DFF]/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
        </div>

        <div className="container px-4 md:px-8 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground mb-8 text-center leading-tight"
            >
              Get in{' '}
              <span className="block">
                <span className="bg-gradient-to-r from-[#33D6D1] via-[#35B7FF] to-[#7A4DFF] bg-clip-text text-transparent">
                  Touch
                </span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto text-center leading-relaxed"
            >
              Have questions, partnership opportunities, or feedback? We'd love to hear from you. Whether you're a
              student, company, or university, our team is here to help.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-gradient-to-r from-[#33D6D1] to-[#7A4DFF] text-white border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-90 transition-all w-full sm:w-auto"
              >
                Contact Support
                <Mail className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base w-full sm:w-auto"
                onClick={() => setLocation('/register')}
              >
                Become a Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: CONTACT CARDS
          ============================================================ */}
      <section className="py-24">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">How to Reach Us</h2>
            <p className="text-lg text-muted-foreground">
              Choose the best contact method for your inquiry.
            </p>
          </motion.div>

          {/* Contact Cards Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {contactCards.map((card, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="group"
              >
                <div className="bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 rounded-2xl p-8 h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${card.color} to-[#7A4DFF] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{card.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{card.description}</p>
                  <div className="flex items-center gap-2 text-[#33D6D1] font-semibold">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${card.email}`} className="hover:opacity-80 transition-opacity">
                      {card.email}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: CONTACT FORM
          ============================================================ */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Send us a Message</h2>
            <p className="text-lg text-muted-foreground">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 rounded-2xl p-8 lg:p-12 shadow-lg shadow-black/5">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground transition-all ${
                      errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-border/50 focus:border-[#33D6D1]'
                    } focus:outline-none focus:ring-2 ${errors.fullName ? 'focus:ring-red-500/20' : 'focus:ring-[#33D6D1]/20'}`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground transition-all ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-border/50 focus:border-[#33D6D1]'
                    } focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500/20' : 'focus:ring-[#33D6D1]/20'}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Organization */}
                <div>
                  <label htmlFor="organization" className="block text-sm font-semibold text-foreground mb-2">
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background text-foreground transition-all focus:border-[#33D6D1] focus:outline-none focus:ring-2 focus:ring-[#33D6D1]/20"
                    placeholder="Your Company or University"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground transition-all ${
                      errors.subject ? 'border-red-500 focus:border-red-500' : 'border-border/50 focus:border-[#33D6D1]'
                    } focus:outline-none focus:ring-2 ${errors.subject ? 'focus:ring-red-500/20' : 'focus:ring-[#33D6D1]/20'}`}
                    placeholder="How can we help?"
                  />
                  {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
                </div>

                {/* I am a */}
                <div>
                  <label htmlFor="userType" className="block text-sm font-semibold text-foreground mb-2">
                    I am a *
                  </label>
                  <div className="relative">
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground transition-all appearance-none ${
                        errors.userType ? 'border-red-500 focus:border-red-500' : 'border-border/50 focus:border-[#33D6D1]'
                      } focus:outline-none focus:ring-2 ${errors.userType ? 'focus:ring-red-500/20' : 'focus:ring-[#33D6D1]/20'}`}
                    >
                      <option value="">Select an option</option>
                      <option value="student">Student</option>
                      <option value="company">Company</option>
                      <option value="university">University</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.userType && <p className="text-sm text-red-500 mt-1">{errors.userType}</p>}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground transition-all resize-none ${
                      errors.message ? 'border-red-500 focus:border-red-500' : 'border-border/50 focus:border-[#33D6D1]'
                    } focus:outline-none focus:ring-2 ${errors.message ? 'focus:ring-red-500/20' : 'focus:ring-[#33D6D1]/20'}`}
                    placeholder="Tell us what's on your mind..."
                  />
                  {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message}</p>}
                </div>

                {/* Success Message */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Message sent successfully!</p>
                      <p className="text-sm text-green-700 mt-1">We'll get back to you within 1–2 business days.</p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Oops, something went wrong.</p>
                      <p className="text-sm text-red-700 mt-1">Please try again or email us directly.</p>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base bg-gradient-to-r from-[#33D6D1] to-[#7A4DFF] text-white border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span className="ml-2">Sending...</span>
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: FAQ
          ============================================================ */}
      <section className="py-24">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Koda AI.
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="group"
              >
                <button
                  onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                  className="w-full bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 rounded-xl p-6 text-left hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/10"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-[#33D6D1] transition-colors">
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: expandedFaqIndex === idx ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </button>

                {/* Answer */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: expandedFaqIndex === idx ? 1 : 0,
                    height: expandedFaqIndex === idx ? 'auto' : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted/30 border border-t-0 border-border/50 rounded-b-xl px-6 py-6 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: RESPONSE EXPECTATIONS
          ============================================================ */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container px-4 md:px-8 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 rounded-2xl p-8 lg:p-12 shadow-lg shadow-black/5">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">What to Expect</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  'Response within 1–2 business days',
                  'Support for students, companies, and universities',
                  'Professional assistance from the Koda AI team',
                  'Secure handling of all inquiries',
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4"
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#33D6D1] to-[#7A4DFF] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-foreground font-medium">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: OFFICE INFORMATION
          ============================================================ */}
      <section className="py-24">
        <div className="container px-4 md:px-8 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">Office Information</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Operating Online */}
              <div className="bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 rounded-2xl p-8">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#33D6D1] to-[#35B7FF] text-white flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Operating Online</h3>
                <p className="text-muted-foreground">
                  Serving students, companies, and universities through our digital platform.
                </p>
              </div>

              {/* Future Headquarters */}
              <div className="bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 rounded-2xl p-8">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#35B7FF] to-[#7A4DFF] text-white flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Future Headquarters</h3>
                <p className="text-muted-foreground">To Be Announced</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: SOCIAL MEDIA
          ============================================================ */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="container px-4 md:px-8 mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Connect With Us</h2>
            <p className="text-lg text-muted-foreground">Follow Koda AI on social media for updates and announcements.</p>
          </motion.div>

          {/* Social Links Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-4xl mx-auto"
          >
            {socialLinks.map((social, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="group"
              >
                <div className="bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full flex flex-col justify-center items-center">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#33D6D1] to-[#7A4DFF] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <social.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{social.label}</h3>
                  <p className="text-sm text-[#33D6D1] font-medium">{social.status}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 8: FINAL CTA
          ============================================================ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-gradient-to-br from-[#33D6D1]/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#7A4DFF]/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-8 mx-auto relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Let's Build Better Internship Opportunities Together
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Whether you're searching for internships, recruiting talented students, or exploring university
              partnerships, Koda AI is here to help.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-gradient-to-r from-[#33D6D1] to-[#7A4DFF] text-white border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-90 transition-all w-full sm:w-auto"
                onClick={() => setLocation('/register')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base w-full sm:w-auto"
                onClick={() => setLocation('/')}
              >
                Explore Features
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}