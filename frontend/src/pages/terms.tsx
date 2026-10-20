import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Printer } from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    paragraphs: [
      'By creating an account or using Koda AI, you agree to follow these Terms of Service. These terms apply to all users of the platform, including students, companies, and universities.',
      'If you do not agree with these terms, you should not access or use Koda AI.',
    ],
  },
  {
    id: 'about',
    title: '2. About Koda AI',
    paragraphs: [
      'Koda AI provides an internship platform that helps IT students discover opportunities and supports companies in reviewing candidates.',
      'The platform compares user-provided information, assessment results, and internship requirements using configurable rules.',
    ],
  },
  {
    id: 'eligibility',
    title: '3. Eligibility',
    paragraphs: [
      'To use Koda AI, you must provide accurate and complete information relevant to your role on the platform.',
    ],
    bullets: [
      'Students must provide accurate personal information, valid university details, and use the platform for legitimate internship purposes.',
      'Companies must provide accurate company information and must have authority to publish internship opportunities.',
      'Universities must provide accurate institutional details and must be authorized to verify students.',
    ],
  },
  {
    id: 'accounts',
    title: '4. User Accounts',
    paragraphs: [
      'You are responsible for maintaining the accuracy of your account information and for protecting your login credentials.',
    ],
    bullets: [
      'Keep your account information current and accurate.',
      'Protect your password and authentication methods.',
      'Maintain the security of your account at all times.',
      'Do not share your account with another person or organization.',
    ],
  },
  {
    id: 'students',
    title: '5. Student Responsibilities',
    paragraphs: [
      'Students agree to use the platform responsibly and professionally throughout the internship discovery process.',
    ],
    bullets: [
      'Provide accurate information and complete assessments honestly.',
      'Submit genuine applications and maintain professional communication with employers.',
      'Do not upload false documents, misleading credentials, or inaccurate profile details.',
    ],
  },
  {
    id: 'companies',
    title: '6. Company Responsibilities',
    paragraphs: [
      'Companies agree to use Koda AI in a lawful and professional manner when posting internships and reviewing applicants.',
    ],
    bullets: [
      'Provide accurate internship information and legitimate opportunities.',
      'Treat applicants fairly and respectfully.',
      'Do not misuse student information or use the platform for deceptive recruitment practices.',
    ],
  },
  {
    id: 'universities',
    title: '7. University Responsibilities',
    paragraphs: [
      'Universities agree to use the platform responsibly and to support the integrity of student verification and academic records.',
    ],
    bullets: [
      'Verify student information accurately and in good faith.',
      'Protect student data and use platform information responsibly.',
      'Use the platform in accordance with institutional policies and applicable law.',
    ],
  },
  {
    id: 'applications',
    title: '8. Internship Applications',
    paragraphs: [
      'Koda AI provides a platform for discovering and applying to internship opportunities. The platform does not guarantee internship placement, company acceptance, or employment outcomes.',
      'Final recruitment decisions are made by companies, and Koda AI does not act as an employer or hiring authority.',
    ],
  },
  {
    id: 'matching',
    title: '9. Matching and Assessment',
    paragraphs: [
      'Koda AI uses configurable rules, skill weights, assessment results, and eligibility criteria to calculate internship match scores. Objective assessment items are scored against predefined answer keys. Subjective responses are reviewed by a human using a rubric.',
    ],
    bullets: [
      'Match scores explain how the available profile evidence compares with internship requirements and are not guarantees of selection or success.',
      'Companies are responsible for reviewing applicants and making final hiring decisions.',
    ],
  },
  {
    id: 'usage',
    title: '10. Platform Usage Rules',
    paragraphs: [
      'You agree not to misuse the services or interfere with the experience of others on the platform.',
    ],
    bullets: [
      'Provide truthful information and do not impersonate another person.',
      'Do not attempt unauthorized access to accounts, systems, or data.',
      'Do not abuse, overload, or disrupt the platform.',
      'Do not upload harmful, offensive, or unlawful content.',
      'Do not violate the rights of other users or engage in illegal activity.',
    ],
  },
  {
    id: 'ip',
    title: '11. Intellectual Property',
    paragraphs: [
      'Koda AI owns and retains all rights to the platform design, software, branding, and content created by Koda AI.',
      'You retain ownership of your personal information and any content you upload, subject to the permissions needed to operate the platform.',
      'By using Koda AI, you grant us permission to process and use your information to provide, improve, and secure our services.',
    ],
  },
  {
    id: 'privacy',
    title: '12. Data and Privacy',
    paragraphs: [
      'The collection, use, storage, and protection of your data are described in our Privacy Policy. We encourage all users to review that policy carefully.',
      'Koda AI will process personal data in accordance with applicable law and the privacy commitments described in our platform documentation.',
    ],
  },
  {
    id: 'third-party',
    title: '13. Third-Party Services',
    paragraphs: [
      'Koda AI may rely on third-party providers for authentication, database services, cloud storage, and other technical functions. These services may be subject to separate terms and privacy policies.',
      'Koda AI is not responsible for the practices of third-party service providers beyond the services we directly manage.',
    ],
  },
  {
    id: 'termination',
    title: '14. Account Suspension and Termination',
    paragraphs: [
      'Koda AI may suspend or terminate access to your account if we determine that you have violated these Terms, provided inaccurate information, misused the platform, or harmed other users.',
    ],
  },
  {
    id: 'liability',
    title: '15. Limitation of Liability',
    paragraphs: [
      'Koda AI provides the platform as a service and does not guarantee uninterrupted availability, error-free performance, or specific outcomes.',
      'To the extent permitted by law, Koda AI is not responsible for company hiring decisions, internship outcomes, user-provided information, or failures caused by external services.',
    ],
  },
  {
    id: 'changes',
    title: '16. Changes to Terms',
    paragraphs: [
      'Koda AI may update these Terms from time to time as the platform evolves. We will notify users of material changes when appropriate.',
      'Continued use of the platform after any update means that you accept the revised Terms.',
    ],
  },
  {
    id: 'governing-law',
    title: '17. Governing Law',
    paragraphs: [
      'These Terms will be governed by and interpreted in accordance with the applicable laws of the jurisdiction in which Koda AI operates.',
    ],
  },
  {
    id: 'contact',
    title: '18. Contact Us',
    paragraphs: [
      'For questions about these Terms of Service, please contact us at legal@kodaai.com.',
      'We are committed to maintaining a clear and trustworthy experience for students, companies, and universities using Koda AI.',
    ],
  },
];

export default function TermsPage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-black">
      <div
        className="fixed inset-x-0 top-0 z-50 h-1 bg-gradient-to-r from-[#33D6D1] via-[#35B7FF] to-[#7A4DFF] transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />

      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-background via-background to-muted/20 pt-24 pb-20 lg:pt-32 lg:pb-24 print:pt-8 print:pb-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-[#33D6D1]/10 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-br from-[#7A4DFF]/10 via-transparent to-transparent blur-3xl" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Terms of Service
            </h1>
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              These Terms of Service explain the rules and conditions for using Koda AI’s internship matching
              platform. By accessing or using Koda AI, you agree to these terms.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Last Updated:</span>
              <span>July 28, 2026</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-10 md:px-8 lg:py-16 print:py-6">
        <div className="space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-border/50 bg-card/70 p-6 shadow-sm backdrop-blur sm:p-8"
            >
              <h2 className="mb-3 text-xl font-semibold text-foreground">These terms define how the platform is used</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Koda AI provides a secure, professional environment for internship discovery, application review,
                and institutional collaboration. These Terms help establish clear expectations for students,
                companies, and universities using the platform.
              </p>
            </motion.section>

            {sections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.015 }}
                className="scroll-mt-24 rounded-2xl border border-border/50 bg-card/70 p-6 shadow-sm backdrop-blur sm:p-8"
              >
                <h2 className="mb-5 text-2xl font-semibold text-foreground">{section.title}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="mb-4 text-base leading-8 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="space-y-3 text-base leading-7 text-muted-foreground">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex gap-3">
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-[#33D6D1] to-[#7A4DFF]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </motion.section>
            ))}

            <motion.section
              id="contact-us"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="scroll-mt-24 rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-sm backdrop-blur sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Contact
                  </p>
                  <h2 className="text-2xl font-semibold text-foreground">Questions about these terms?</h2>
                  <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground">
                    We welcome questions from students, companies, and universities regarding the use of Koda AI
                    and the expectations set out in these Terms of Service.
                  </p>
                </div>
                <a
                  href="mailto:legal@kodaai.com"
                  className="inline-flex items-center rounded-full border border-[#33D6D1]/30 bg-[#33D6D1]/10 px-4 py-2 text-sm font-medium text-[#33D6D1] transition hover:bg-[#33D6D1]/20"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  legal@kodaai.com
                </a>
              </div>
            </motion.section>
          </div>
        </div>

      <div className="border-t border-border/50 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4">
          <span>© 2026 Koda AI</span>
          <span className="hidden sm:inline">•</span>
          <span>Terms of Service</span>
          <span className="hidden sm:inline">•</span>
          <a href="/privacy" className="transition hover:text-foreground">Privacy Policy</a>
          <span className="hidden sm:inline">•</span>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 transition hover:text-foreground">
            <Printer className="h-4 w-4" />
            Print this page
          </button>
        </div>
      </div>
    </div>
  );
}