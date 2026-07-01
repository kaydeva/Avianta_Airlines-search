import { useState } from 'react';
import {
  Shield,
  Clock,
  Coffee,
  Globe,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function LandingSections() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: <Clock className="text-[#C9A86A]" size={26} />,
      title: 'Search, Not Stress',
      description:
        'Avianta scans private jet operators in seconds, surfacing the most relevant options for your route and schedule.',
    },
    {
      icon: <Shield className="text-[#C9A86A]" size={26} />,
      title: 'Verified Operators Only',
      description:
        'Every operator shown in Avianta meets strict safety and compliance standards before appearing in your results.',
    },
    {
      icon: <Coffee className="text-[#C9A86A]" size={26} />,
      title: 'Curated Flight Insights',
      description:
        'See aircraft type, cabin style, operator reputation, and pricing at a glance—before you decide where to book.',
    },
    {
      icon: <Globe className="text-[#C9A86A]" size={26} />,
      title: 'Global Private Jet Coverage',
      description:
        'Discover private jet options across thousands of airports worldwide, from regional hops to ultra‑long‑range journeys.',
    },
  ];

  const jetClasses = [
    {
      name: 'Cheapest Option Today',
      seats: '6–7 seats · Light Jet',
      range: '1,500 nm · Regional',
      hourlyRate: '$4,200',
      operator: 'Aurora Jet Charter',
      date: 'Next 24 hours',
      route: 'Paris → Geneva · Sample route',
      image:
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=600&h=400&q=80',
      tagline: 'Optimized for cost‑efficient, short‑haul business and leisure trips.',
    },
    {
      name: 'Balanced Comfort & Range',
      seats: '8–9 seats · Super Midsize',
      range: '3,200 nm · Transcontinental',
      hourlyRate: '$7,600',
      operator: 'Helios Aviation',
      date: 'Within 3 days',
      route: 'New York → Los Angeles · Sample route',
      image:
        'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=600&h=400&q=80',
      tagline: 'Ideal when you want both cabin comfort and extended range.',
    },
    {
      name: 'Most Exclusive Cabin',
      seats: '13–16 seats · Ultra Long Range',
      range: '7,000 nm · Intercontinental',
      hourlyRate: '$12,900',
      operator: 'Aureon Private Air',
      date: 'Within 7 days',
      route: 'London → Dubai · Sample route',
      image:
        'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=600&h=400&q=80',
      tagline: 'For global itineraries where time, privacy, and range are non‑negotiable.',
    },
  ];

  const faqs = [
    {
      question: 'Is Avianta a private jet operator or airline?',
      answer:
        'Avianta is a search and comparison platform. We do not operate aircraft or sell flights directly—we show you options from certified operators and redirect you to complete booking with them.',
    },
    {
      question: 'How does Avianta find the cheapest and most premium private jet options?',
      answer:
        'Avianta aggregates pricing and availability from partner operators, then ranks options by cost, cabin class, range, and schedule so you can quickly see both the most affordable and the most exclusive choices.',
    },
    {
      question: 'Does Avianta charge extra fees?',
      answer:
        'No. The prices you see are provided directly by operators. Avianta does not add fees or commissions.',
    },
    {
      question: 'What happens after I select a flight?',
      answer:
        'Avianta redirects you to the operator’s booking page where you finalize details, payment, and any special requests.',
    },
    {
      question: 'Are operators verified?',
      answer:
        'Yes. Avianta only displays operators who meet strict safety, compliance, and operational standards.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-32 py-24">

      {/* STORY SECTION */}
      <section id="story" className="max-w-7xl mx-auto px-6 md:px-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-[fadeIn_1.2s_ease-out]">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#C9A86A] uppercase">
              About Avianta
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-[#202A36] leading-tight tracking-tight">
              A private jet search
              <br />
              <span className="font-semibold text-[#C9A86A]">built for clarity.</span>
            </h2>
            <p className="text-[#3A3F47] text-lg leading-relaxed max-w-lg text-justify">
              Avianta is a clean, modern search engine for private aviation. Instead of browsing
              dozens of operator sites, you see curated private jet options in one place—ranked by
              price, range, cabin, and schedule.
            </p>
            <p className="text-[#3A3F47] leading-relaxed text-lg md:text-xl max-w-xl animate-[fadeIn_1.3s_ease-out] text-justify">
              We don’t sell flights. We surface them. Avianta aggregates data from certified
              operators, highlights the cheapest and most premium options for your route, then
              redirects you to complete booking securely on the operator’s platform.
            </p>
            <p className="text-[#555B63] leading-relaxed text-base md:text-lg max-w-xl animate-[fadeIn_1.4s_ease-out] text-justify">
              Whether you’re planning a regional business hop or an ultra‑long‑range escape,
              Avianta helps you understand the landscape: aircraft type, operator, date, price,
              and availability—before you commit to a single provider.
            </p>
            <div className="pt-6 animate-[fadeIn_1.5s_ease-out]">
              <button
                onClick={() => {
                  document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-3 text-base font-medium text-[#202A36] hover:text-[#C9A86A] transition-all group cursor-pointer"
              >
                Start with a search
                <ArrowRight
                  size={18}
                  className="text-[#C9A86A] group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>

          <div className="relative group animate-[fadeIn_1.4s_ease-out]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A86A]/20 to-transparent rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
            <img
              src="https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=900&q=80"
              alt="Private Jet"
              className="rounded-3xl shadow-2xl w-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* SECOND STORY SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 animate-[fadeIn_1.4s_ease-out]">
            <p className="text-[#3A3F47] leading-relaxed text-lg md:text-xl max-w-xl text-justify">
              Avianta was created around a simple truth: private aviation should feel transparent,
              not mysterious. Travelers deserve to see how prices, aircraft, and operators compare
              side by side—without needing insider contacts or endless phone calls.
            </p>
            <p className="text-[#555B63] leading-relaxed text-base md:text-lg max-w-xl text-justify">
              Instead of locking you into a single provider, Avianta shows you a spectrum of
              options: the most affordable jet that fits your route, the most premium cabin
              available, and everything in between. Once you choose, we redirect you to finalize
              booking directly with the operator.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#202A36] hover:text-[#C9A86A] transition-colors group cursor-pointer"
              >
                Explore Avianta engine
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform text-[#C9A86A]"
                />
              </button>
            </div>
          </div>

          <div className="relative group animate-[fadeIn_1.6s_ease-out]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A86A]/20 to-transparent rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
            <img
              src="https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?auto=format&fit=crop&w=800&h=600&q=80"
              alt="Luxury private jet interior"
              className="rounded-3xl shadow-2xl object-cover w-full h-[420px] md:h-[520px] group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section
        id="benefits"
        className="py-28 scroll-mt-24 bg-gradient-to-b from-white to-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-5 animate-[fadeIn_1.2s_ease-out]">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C9A86A] uppercase">
              Why Avianta
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-[#202A36] tracking-tight">
              Designed for clear decisions.
            </h2>
            <p className="text-[#3A3F47] text-lg">
              Every element of Avianta is built to help you understand private jet options quickly,
              compare them confidently, and book with the operator you trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-white p-10 rounded-3xl border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-[fadeIn_1.4s_ease-out]"
              >
                <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#202A36] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-[#555B63] text-sm leading-relaxed text-justify">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RATES / SNAPSHOT SECTION */}
      <section
        id="rates"
        className="max-w-7xl mx-auto px-6 md:px-8 py-28 scroll-mt-24"
      >
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-5 animate-[fadeIn_1.2s_ease-out]">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C9A86A] uppercase">
            Today&apos;s Private Jet Snapshot
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-[#202A36] tracking-tight">
            From most affordable to most exclusive.
          </h2>
          <p className="text-[#3A3F47] text-lg">
            Avianta highlights a range of private jet options—showing you which flights are
            currently the cheapest, which cabins are the most premium, and how they compare on
            range, seats, and operators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {jetClasses.map((jet, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-[fadeIn_1.4s_ease-out]"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src={jet.image}
                  alt={jet.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="p-10 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-[#202A36]">{jet.name}</h3>
                  <p className="text-gray-500 text-xs font-medium">{jet.tagline}</p>

                  <div className="space-y-3 mt-4 mb-6 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Seats & Class</span>
                      <span className="font-semibold text-[#202A36]">{jet.seats}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Range</span>
                      <span className="font-semibold text-[#202A36]">{jet.range}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Operator</span>
                      <span className="font-semibold text-[#202A36]">{jet.operator}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Availability window</span>
                      <span className="font-semibold text-[#202A36]">{jet.date}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Indicative hourly rate</span>
                      <span className="font-bold text-[#C9A86A]">{jet.hourlyRate}/hr</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Example data shown for illustration. Actual pricing and availability are
                    provided by operators when you search in Avianta.
                  </p>
                </div>

                <button
                  onClick={() => {
                    document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-6 w-full py-3.5 rounded-xl bg-[#202A36] text-white text-sm font-semibold hover:bg-[#C9A86A] hover:text-black transition-all duration-300 shadow-sm cursor-pointer"
                >
                  View similar flights in Avianta
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section
        id="faq"
        className="max-w-4xl mx-auto px-6 md:px-8 scroll-mt-24 pb-16"
      >
        <div className="text-center mb-16 space-y-4 animate-[fadeIn_1.2s_ease-out]">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C9A86A] uppercase">
            Questions & Answers
          </span>
          <h2 className="text-3xl md:text-4xl font-light text-[#202A36] tracking-tight">
            Understanding how Avianta works.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md transition-all animate-[fadeIn_1.4s_ease-out]"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between font-medium text-[#202A36] hover:text-[#C9A86A] transition-colors focus:outline-none"
              >
                <span>{faq.question}</span>
                {openFaq === i ? (
                  <ChevronUp className="text-[#C9A86A] flex-shrink-0" size={18} />
                ) : (
                  <ChevronDown className="text-gray-400 flex-shrink-0" size={18} />
                )}
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-40 border-t border-gray-100' : 'max-h-0'
                  }`}
              >
                <p className="px-6 py-5 text-sm text-[#555B63] leading-relaxed bg-gray-50 text-justify">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
