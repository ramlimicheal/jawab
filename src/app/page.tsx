import Link from "next/link";
import { MessageSquare, Globe, Users, Zap, BarChart3, Shield, ChevronRight, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans relative overflow-x-hidden">
      {/* Mesh background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: "radial-gradient(circle at top left, #d1fae5 0%, transparent 40%), radial-gradient(circle at bottom right, #fef3c7 0%, transparent 50%)"
      }} />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-emerald-600 shadow-lg shadow-green-500/30 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                J
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">Jawab</span>
            </div>
            <div className="hidden md:flex space-x-10">
              <a href="#features" className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors">Pricing</a>
              <a href="#case-study" className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors">Case Study</a>
              <span className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer font-arabic">عربي</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-emerald-600 font-medium px-4">Log in</Link>
              <Link href="/auth/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-green-500/30">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-200/50 shadow-sm text-sm font-semibold text-gray-700 mb-12">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-emerald-600">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span>JAWAB 2.0 is live - Featuring deep WhatsApp integration</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8 max-w-5xl mx-auto">
          The AI chatbot for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400">
            Gulf Enterprises.
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
          Train a native Arabic/English AI on your exact business data in just 15 minutes.
          It handles customer service and captures verified leads so you don&apos;t have to.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-green-500/20 text-base px-8 py-6">
              Start your 14-day trial
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-base px-8 py-6 gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
              <Play className="w-3 h-3 text-gray-500 ml-0.5" />
            </div>
            Watch Demo
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-14 flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex -space-x-3">
            {[11, 32, 44, 68].map((id) => (
              <img key={id} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" src={`https://i.pravatar.cc/150?img=${id}`} alt="avatar" />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">+500</div>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="flex gap-0.5 text-amber-400 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-semibold tracking-wide text-gray-500">Rated 4.9/5 by Gulf Business Owners</span>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="mt-20 relative w-full max-w-5xl mx-auto rounded-3xl border border-gray-100 bg-white/60 backdrop-blur-xl shadow-2xl overflow-hidden -mb-20">
          <div className="w-full h-14 bg-gray-50/80 border-b border-gray-200 flex items-center px-6 gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="w-px h-5 bg-gray-200 mx-2" />
            <div className="text-xs font-semibold text-gray-500">JAWAB Dashboard v2.0</div>
          </div>
          <div className="bg-white/40 h-96 md:h-[500px] w-full relative flex items-center justify-center overflow-hidden">
            <div className="relative z-10 w-24 h-24 rounded-3xl shadow-xl bg-white flex flex-col items-center justify-center p-2">
              <MessageSquare className="w-10 h-10 text-emerald-600 mb-1" />
              <span className="text-xs font-bold tracking-widest uppercase text-gray-500">Core</span>
            </div>

            {/* Arabic Chat Mockup */}
            <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 w-80 rounded-2xl bg-white shadow-2xl border border-gray-100 p-0 text-right z-20 hidden md:block" dir="rtl">
              <div className="flex items-center gap-4 border-b border-gray-100 p-5 bg-gradient-to-br from-green-50 to-white rounded-t-2xl">
                <div className="bg-white text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100 shadow-sm">Lead</div>
                <div>
                  <div className="text-sm font-bold text-gray-900 font-arabic">عيادة د. خالد</div>
                  <div className="text-xs text-gray-500">Arabic (RTL)</div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="text-sm text-gray-700 font-arabic bg-gray-50 rounded-xl p-4 rounded-tl-sm leading-relaxed">
                  &ldquo;متى العيادة غداً وهل يوجد موعد متاح لتنظيف الأسنان؟&rdquo;
                </div>
                <div className="text-sm text-white bg-emerald-600 rounded-xl p-4 rounded-tr-sm leading-relaxed font-arabic shadow-md shadow-green-500/20">
                  &ldquo;نفتح من 9 صباحاً لـ 6 مساءً. الموعد متاح الساعة 2. يرجى تزويدي برقمك للتأكيد.&rdquo;
                </div>
              </div>
            </div>

            {/* English Chat Mockup */}
            <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-80 rounded-2xl bg-white shadow-2xl border border-gray-100 p-0 text-left z-20 hidden sm:block">
              <div className="flex items-center gap-4 border-b border-gray-100 p-5 bg-gradient-to-bl from-blue-50 to-white rounded-t-2xl">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">S</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Jumeirah RE</div>
                  <div className="text-xs text-gray-500">English (LTR)</div>
                </div>
                <div className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">Verified</div>
              </div>
              <div className="p-5 space-y-4">
                <div className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 rounded-tr-sm leading-relaxed">
                  &ldquo;I&apos;m looking for a 2BR apartment in Marina. Budget is 150k.&rdquo;
                </div>
                <div className="text-sm text-white bg-blue-600 rounded-xl p-4 rounded-tl-sm leading-relaxed shadow-md shadow-blue-500/20">
                  &ldquo;We have 3 matching properties. Provide WhatsApp for brochures.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="pb-24 pt-40 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p className="text-xs font-semibold mb-12 uppercase tracking-widest">Trusted by 500+ Regional Enterprises</p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 grayscale opacity-60">
            <div className="text-gray-900 font-extrabold text-2xl tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gray-900" /> Elite Dental
            </div>
            <div className="text-gray-900 font-bold text-xl uppercase tracking-tight">Marina Properties</div>
            <div className="text-gray-900 font-serif text-2xl italic">GLOW</div>
            <div className="text-gray-900 font-bold text-2xl font-arabic" dir="rtl">الأصول</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white relative z-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">Enterprise power, simplified.</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
              JAWAB processes local dialects, routes visitors intelligently, and generates leads automatically while you focus on business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "Native Bilingual Engine", desc: "GPT-4.1 backed. Native Arabic logic and LTR/RTL structural shifts occur within milliseconds to match users instantly.", color: "green" },
              { icon: Users, title: "Lead Capture Core", desc: "Secure forms dynamically trigger based on semantic value (e.g. pricing, booking) pushing details directly to CRM structures.", color: "amber" },
              { icon: Zap, title: "15-Minute Dashboard", desc: "Full audit trail of all AI interactions. Granular control over training sources, fallback URLs, and branding instantly.", color: "blue" },
              { icon: MessageSquare, title: "WhatsApp-First Leads", desc: "Automatically capture WhatsApp numbers when visitors show purchase intent. Gulf-standard lead flow built in.", color: "green" },
              { icon: BarChart3, title: "Real-Time Analytics", desc: "Track conversations, leads, deflection rates, and satisfaction scores. Export to CSV, get daily email digests.", color: "purple" },
              { icon: Shield, title: "Gulf Data Residency", desc: "Data stored in AWS Bahrain (me-south-1). PDPL, GDPR compliant. End-to-end encryption. Your data never trains AI.", color: "red" },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                  feature.color === "green" ? "bg-green-50 text-emerald-600 border border-green-100" :
                  feature.color === "amber" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                  feature.color === "blue" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                  feature.color === "purple" ? "bg-purple-50 text-purple-600 border border-purple-100" :
                  "bg-red-50 text-red-600 border border-red-100"
                }`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section id="case-study" className="py-32 bg-gray-50 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-10 md:p-16 flex flex-col md:flex-row gap-16 items-center shadow-xl">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-emerald-600 font-bold">+</div>
                <span className="text-sm font-bold tracking-widest uppercase text-emerald-600">Case Record // 01</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-8">
                &ldquo;For the first time, my clinic&apos;s digital doors are open around the clock.&rdquo;
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-10">
                Dr. Khalid owns a thriving dental clinic in Dubai, but every evening he was swamped by WhatsApp messages about appointments and pricing. With staff clocking out at 6pm, he was losing valuable leads.
                <br /><br />
                He signed up for JAWAB, trained it on his clinic&apos;s website in 10 minutes, and embedded the code. Now, a bilingual bot greets visitors 24/7, captures appointment leads automatically, and hands off complex emergencies directly to his WhatsApp.
              </p>
              <div className="flex items-center gap-5 border-t border-gray-100 pt-8">
                <img src="https://i.pravatar.cc/150?img=11" alt="Dr. Khalid" className="w-14 h-14 rounded-full shadow-md object-cover" />
                <div>
                  <div className="font-extrabold text-gray-900 tracking-tight text-lg">Dr. Khalid, DDS</div>
                  <div className="text-sm text-gray-500 font-medium">Dental Clinic Owner, Dubai</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white relative z-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">Start free. Scale as you grow. All prices in AED.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Starter", price: "149", annual: "99", features: ["2 chatbots", "2,000 messages/mo", "50 content sources", "3 team members", "Email support"] },
              { name: "Growth", price: "399", annual: "299", popular: true, features: ["5 chatbots", "10,000 messages/mo", "200 content sources", "10 team members", "Priority support", "Webhooks"] },
              { name: "Scale", price: "899", annual: "699", features: ["20 chatbots", "50,000 messages/mo", "1,000 content sources", "50 team members", "Dedicated support", "API access", "Custom branding"] },
              { name: "Enterprise", price: "Custom", features: ["Unlimited chatbots", "Unlimited messages", "Unlimited content", "Unlimited team", "White-label", "SLA", "Custom integration"] },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl border p-8 flex flex-col ${plan.popular ? "border-emerald-600 shadow-xl shadow-green-500/10 relative" : "border-gray-200"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold">Most Popular</div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  {plan.annual ? (
                    <>
                      <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500 text-sm ml-1">AED/mo</span>
                    </>
                  ) : (
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button className={`w-full ${plan.popular ? "bg-emerald-600 hover:bg-emerald-700" : ""}`} variant={plan.popular ? "default" : "outline"}>
                    {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-emerald-600 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-8">Ready to automate your customer service?</h2>
          <p className="text-xl text-emerald-100 mb-12 font-medium">Join 500+ Gulf businesses using JAWAB to capture leads and delight customers 24/7.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 text-base px-8 py-6 font-bold">
                Start your 14-day trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-700 text-base px-8 py-6">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">J</div>
                <span className="font-bold text-xl text-white">Jawab</span>
              </div>
              <p className="text-sm">AI-powered bilingual chatbot for Gulf businesses. Capture leads, answer customers, 24/7.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Data Processing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Jawab. All rights reserved. Built for the Gulf.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
