import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-border/50">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#33D6D1]/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-[#7A4DFF]/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="container px-4 md:px-8 mx-auto relative z-10 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">Privacy Policy</h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Your privacy is important to us. This Privacy Policy explains how Koda AI collects, uses, stores,
                  and protects your information when you use our platform.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-semibold">Last Updated:</span>
                  <span>July 28, 2026</span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Content Sections */}
          <div className="container px-4 md:px-8 mx-auto max-w-4xl py-16 lg:py-24">
            {/* 1. Introduction */}
            <motion.section
              id="introduction"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">1. Introduction</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Koda AI is an AI-powered internship matching platform that connects IT students with companies and
                  universities. Our platform uses advanced algorithms to help students discover internship opportunities
                  and helps companies identify suitable candidates based on skills and experience.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By using Koda AI, you agree to the terms of this Privacy Policy. This policy applies to all users,
                  including students, companies, and universities. If you do not agree with our privacy practices, please
                  do not use our platform.
                </p>
              </div>
            </motion.section>

            {/* 2. Information We Collect */}
            <motion.section
              id="information-collect"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">2. Information We Collect</h2>

              {/* Subsection: Student Information */}
              <motion.div
                className="mb-8 border-l-4 border-[#33D6D1]/30 pl-6"
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === 'student-info' ? null : 'student-info')}
                  className="flex items-center justify-between w-full text-xl font-semibold text-foreground hover:text-[#33D6D1] transition-colors mb-4"
                >
                  <span>Student Information</span>
                  <motion.div animate={{ rotate: expandedSection === 'student-info' ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: expandedSection === 'student-info' ? 1 : 0,
                    height: expandedSection === 'student-info' ? 'auto' : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    When you register as a student, we collect:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Full name and email address</li>
                    <li>University affiliation and academic information</li>
                    <li>Technical skills and competencies</li>
                    <li>Project portfolio and links</li>
                    <li>Resume or CV document</li>
                    <li>Assessment results from our skill evaluations</li>
                    <li>Internship application history</li>
                    <li>Profile visibility and preference settings</li>
                  </ul>
                </motion.div>
              </motion.div>

              {/* Subsection: Company Information */}
              <motion.div
                className="mb-8 border-l-4 border-[#35B7FF]/30 pl-6"
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === 'company-info' ? null : 'company-info')}
                  className="flex items-center justify-between w-full text-xl font-semibold text-foreground hover:text-[#35B7FF] transition-colors mb-4"
                >
                  <span>Company Information</span>
                  <motion.div animate={{ rotate: expandedSection === 'company-info' ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: expandedSection === 'company-info' ? 1 : 0,
                    height: expandedSection === 'company-info' ? 'auto' : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    When you register as a company, we collect:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Company name and business email</li>
                    <li>Company profile and description</li>
                    <li>Internship positions and requirements</li>
                    <li>Contact details for hiring representatives</li>
                    <li>Company logo and branding information</li>
                    <li>Application review and hiring activity</li>
                  </ul>
                </motion.div>
              </motion.div>

              {/* Subsection: University Information */}
              <motion.div
                className="mb-8 border-l-4 border-[#7A4DFF]/30 pl-6"
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === 'university-info' ? null : 'university-info')}
                  className="flex items-center justify-between w-full text-xl font-semibold text-foreground hover:text-[#7A4DFF] transition-colors mb-4"
                >
                  <span>University Information</span>
                  <motion.div animate={{ rotate: expandedSection === 'university-info' ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: expandedSection === 'university-info' ? 1 : 0,
                    height: expandedSection === 'university-info' ? 'auto' : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    When you register as a university partner, we collect:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>University name and institution identifier</li>
                    <li>Authorized representative details</li>
                    <li>Student roster information for verification</li>
                    <li>Enrollment status of students</li>
                    <li>Contact information for partnership coordination</li>
                  </ul>
                </motion.div>
              </motion.div>

              {/* Subsection: Technical Information */}
              <motion.div
                className="border-l-4 border-muted/30 pl-6"
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === 'technical-info' ? null : 'technical-info')}
                  className="flex items-center justify-between w-full text-xl font-semibold text-foreground hover:text-muted-foreground transition-colors mb-4"
                >
                  <span>Technical Information</span>
                  <motion.div animate={{ rotate: expandedSection === 'technical-info' ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: expandedSection === 'technical-info' ? 1 : 0,
                    height: expandedSection === 'technical-info' ? 'auto' : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We automatically collect:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Device information (OS, browser, device type)</li>
                    <li>IP address and location data</li>
                    <li>Login history and authentication logs</li>
                    <li>Platform usage data and feature interactions</li>
                    <li>Pages visited and time spent on the platform</li>
                  </ul>
                </motion.div>
              </motion.div>
            </motion.section>

            {/* 3. How We Use Your Information */}
            <motion.section
              id="how-we-use"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">3. How We Use Your Information</h2>
              <div className="bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 rounded-xl p-6">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="space-y-3">
                  {[
                    'Creating and maintaining your user profile',
                    'Generating personalized internship recommendations',
                    'Matching students with suitable internship opportunities',
                    'Processing and managing internship applications',
                    'Verifying student enrollment at universities',
                    'Improving platform performance and user experience',
                    'Detecting and preventing fraud or security threats',
                    'Communicating important updates and policy changes',
                    'Complying with legal obligations',
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <div className="h-2 w-2 rounded-full bg-[#33D6D1] mt-2 shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* 4. AI Matching and Assessment Data */}
            <motion.section
              id="ai-matching"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">4. AI Matching and Assessment Data</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Koda AI uses machine learning algorithms to analyze student skills, experience, and preferences
                  alongside company internship requirements to generate matching recommendations. This process involves:
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground mb-2">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>AI recommendations are designed to assist users in discovering opportunities</li>
                    <li>Match scores and rankings do not guarantee internship placement</li>
                    <li>Companies make final hiring decisions independently</li>
                    <li>Students can review and update their assessment results and profile information at any time</li>
                    <li>Assessment data is used exclusively for matching purposes within our platform</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* 5. Information Sharing */}
            <motion.section
              id="information-sharing"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">5. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                <strong className="text-foreground">Koda AI does not sell personal information to third parties.</strong>{' '}
                However, information may be shared in the following circumstances:
              </p>
              <div className="space-y-6">
                {[
                  {
                    title: 'Student Profile Sharing',
                    content: 'When students apply for internships or choose to make their profiles visible, their profile information (name, skills, assessment results) may be shared with companies for recruitment purposes.',
                    color: 'from-[#33D6D1]',
                  },
                  {
                    title: 'Company Internship Listings',
                    content: 'Company internship information, requirements, and job descriptions are shared with students to help them discover and apply for opportunities.',
                    color: 'from-[#35B7FF]',
                  },
                  {
                    title: 'University Verification',
                    content: 'Universities receive verified information about their enrolled students who use the platform for internship matching purposes.',
                    color: 'from-[#7A4DFF]',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className={`border-l-4 border-gradient-to-b bg-gradient-to-br from-card/50 to-muted/20 rounded-r-lg p-4`}
                    style={{ borderColor: `var(--${item.color})` }}
                  >
                    <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                    <p className="text-muted-foreground text-sm">{item.content}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* 6. User Account Data */}
            <motion.section
              id="account-data"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">6. User Account Data</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  You have control over your account data:
                </p>
                <div className="grid gap-4">
                  {[
                    'Update or modify your profile information at any time',
                    'Manage your profile visibility settings',
                    'Control which information is shared with companies or universities',
                    'Request deletion of your account and associated data',
                    'Download a copy of your information',
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 bg-muted/20 rounded-lg p-4"
                    >
                      <div className="h-5 w-5 rounded-full bg-[#33D6D1] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#0B132B]">✓</span>
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* 7. University Verification Data */}
            <motion.section
              id="university-data"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">7. University Verification Data</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Universities can verify student enrollment and monitor internship placements. The data available to
                universities includes:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-[#33D6D1]">•</span>
                  Enrolled students from their institution
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#33D6D1]">•</span>
                  Internship placement status and history
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#33D6D1]">•</span>
                  Career outcome analytics
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Universities commit to using this information solely for educational and student outcome improvement
                purposes.
              </p>
            </motion.section>

            {/* 8. Company Data */}
            <motion.section
              id="company-data"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">8. Company Data</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Company information provided during registration and internship posting is stored securely and used for:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-[#35B7FF]">•</span>
                  Displaying company profiles to students
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#35B7FF]">•</span>
                  Processing student applications
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#35B7FF]">•</span>
                  Communicating with company representatives about hiring
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#35B7FF]">•</span>
                  Providing analytics about hiring activity
                </li>
              </ul>
            </motion.section>

            {/* 9. Data Security */}
            <motion.section
              id="data-security"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">9. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We implement comprehensive security measures to protect your information:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Secure Authentication', desc: 'OAuth 2.0 and secure password protocols' },
                  { title: 'Encrypted Transmission', desc: 'HTTPS/TLS encryption for all data in transit' },
                  { title: 'Access Controls', desc: 'Role-based access restrictions for staff' },
                  { title: 'Database Security', desc: 'Encrypted database with security best practices' },
                  { title: 'Regular Updates', desc: 'Continuous security monitoring and improvements' },
                  { title: 'Backup Systems', desc: 'Regular backups to prevent data loss' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-foreground mb-1 text-sm">{item.title}</h4>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* 10. Data Retention */}
            <motion.section
              id="data-retention"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">10. Data Retention</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  We retain your information for as long as necessary to provide our services:
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Active Accounts</p>
                    <p className="text-muted-foreground text-sm">
                      Data is retained while your account is active and for 30 days after account deletion
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Application History</p>
                    <p className="text-muted-foreground text-sm">
                      Internship applications are retained for 2 years for historical reference
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Backup Data</p>
                    <p className="text-muted-foreground text-sm">
                      Backup copies may persist for up to 90 days following deletion
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 11. Cookies and Tracking Technologies */}
            <motion.section
              id="cookies"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">11. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Session Cookies', purpose: 'Keep you logged in and maintain session state' },
                  { name: 'Security Cookies', purpose: 'Protect against fraud and verify authentication' },
                  { name: 'Preference Cookies', purpose: 'Remember your settings and theme preferences' },
                  { name: 'Analytics Cookies', purpose: 'Understand how users interact with the platform' },
                ].map((cookie, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-start bg-muted/20 rounded-lg p-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground text-sm">{cookie.name}</p>
                      <p className="text-muted-foreground text-sm">{cookie.purpose}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* 12. User Rights */}
            <motion.section
              id="user-rights"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">12. User Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                You have the right to control your personal information:
              </p>
              <div className="grid gap-4">
                {[
                  {
                    right: 'Right to Access',
                    desc: 'Request a copy of the personal information we hold about you',
                  },
                  {
                    right: 'Right to Update',
                    desc: 'Modify or correct inaccurate information in your profile',
                  },
                  {
                    right: 'Right to Deletion',
                    desc: 'Request deletion of your account and associated data',
                  },
                  {
                    right: 'Right to Portability',
                    desc: 'Export your data in a standard format',
                  },
                  {
                    right: 'Right to Opt-Out',
                    desc: 'Opt out of marketing communications and non-essential services',
                  },
                  {
                    right: 'Right to Inquiry',
                    desc: 'Contact us with questions about data processing',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    className="border-l-4 border-[#33D6D1] bg-gradient-to-r from-[#33D6D1]/10 to-transparent rounded-r-lg p-4"
                  >
                    <h4 className="font-semibold text-foreground mb-1">{item.right}</h4>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* 13. Children's Privacy */}
            <motion.section
              id="children-privacy"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">13. Children's Privacy</h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <p className="text-muted-foreground leading-relaxed">
                  Koda AI is designed for users aged 18 and older. We do not knowingly collect personal information from
                  children under 18. If we become aware that a child has provided information to our platform, we will
                  take steps to delete such information and terminate the child's account. Parents or guardians who
                  believe their child has provided information to Koda AI should contact us immediately.
                </p>
              </div>
            </motion.section>

            {/* 14. Third-Party Services */}
            <motion.section
              id="third-party"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">14. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Koda AI uses trusted third-party services to operate and improve our platform:
              </p>
              <div className="grid gap-4">
                {[
                  {
                    service: 'Supabase Authentication',
                    purpose: 'User authentication and account security',
                    privacy: 'https://supabase.com/privacy',
                  },
                  {
                    service: 'PostgreSQL Database',
                    purpose: 'Secure data storage and management',
                    privacy: 'https://www.postgresql.org/about/privacy/',
                  },
                  {
                    service: 'Cloud Storage',
                    purpose: 'File storage for resumes and portfolios',
                    privacy: 'https://supabase.com/privacy',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-card to-muted/30 border border-border/50 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-foreground mb-1">{item.service}</h4>
                    <p className="text-muted-foreground text-sm mb-3">{item.purpose}</p>
                    <a
                      href={item.privacy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#33D6D1] hover:text-[#35B7FF] text-sm font-medium transition-colors"
                    >
                      View Privacy Policy →
                    </a>
                  </motion.div>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mt-6 text-sm">
                Each third-party service maintains its own privacy policies. We encourage you to review their policies
                to understand how they handle data.
              </p>
            </motion.section>

            {/* 15. Changes to This Privacy Policy */}
            <motion.section
              id="policy-changes"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">15. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Koda AI may update this Privacy Policy from time to time to reflect new features, legal requirements, or
                other changes. When we make significant changes, we will notify you by email or by displaying a prominent
                notice on the platform.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your continued use of Koda AI after changes become effective constitutes your acceptance of the updated
                Privacy Policy. We encourage you to review this policy periodically to stay informed about how we protect
                your information.
              </p>
            </motion.section>

            {/* 16. Contact Us */}
            <motion.section
              id="contact"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 scroll-mt-24"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">16. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                If you have questions, concerns, or requests regarding this Privacy Policy or how Koda AI handles your
                personal information, please contact us:
              </p>

              <div className="bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#33D6D1] to-[#7A4DFF] text-white flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Privacy Inquiries</p>
                    <a
                      href="mailto:privacy@kodaai.com"
                      className="text-[#33D6D1] hover:text-[#35B7FF] transition-colors font-medium"
                    >
                      privacy@kodaai.com
                    </a>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    We will respond to all privacy inquiries within 7 business days.
                  </p>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#33D6D1] to-[#7A4DFF] text-white border-0 hover:opacity-90"
                  >
                    Send us a message
                  </Button>
                </div>
              </div>
            </motion.section>

            {/* Footer Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="border-t border-border/50 pt-12 mt-16 text-center"
            >
              <p className="text-sm text-muted-foreground mb-4">
                This Privacy Policy is part of Koda AI's commitment to transparency and user trust.
              </p>
              <p className="text-xs text-muted-foreground/60">
                © 2026 Koda AI. All rights reserved. Last updated: July 28, 2026
              </p>
            </motion.div>
          </div>
    </div>
  );
}