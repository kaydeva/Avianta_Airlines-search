import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ['FAQ'];

  const handleScroll = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id.toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">

          {/* Brand Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-3xl font-light tracking-tight text-white hover:opacity-80 transition-opacity"
          >
            <span className="font-semibold text-white">Avi</span>
            <span className="text-[#C9A86A] font-semibold">anta</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleScroll(item)}
                className="relative text-sm font-medium text-white tracking-wide hover:text-[#C9A86A] transition-colors duration-300 pb-1"
              >
                {item}

                {/* Underline */}
                <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-[#C9A86A] scale-x-0 origin-left transition-transform duration-300 hover:scale-x-100"></span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-1 hover:text-[#C9A86A] transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`absolute top-full left-4 right-4 mt-3 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 md:hidden transition-all duration-300 transform origin-top ${isOpen
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="flex flex-col space-y-4">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleScroll(item)}
              className="text-base font-medium text-white hover:text-[#C9A86A] py-2 border-b border-white/10 last:border-0 transition-colors duration-200"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
