import React, { useState, useEffect } from "react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Add Student", href: "#add-student" },
    { name: "Add Teacher", href: "#add-teacher" },
    { name: "Create Classroom", href: "#create-classroom" },
  ];

  // Add scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg" 
        : "bg-gradient-to-r from-cyan-600 to-emerald-500 shadow-xl"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Branding with animated logo */}
          <div className="shrink-0 flex items-center group">
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                scrolled 
                  ? "bg-gradient-to-br from-cyan-500 to-emerald-500" 
                  : "bg-white/20 backdrop-blur-sm"
              }`}>
                <svg className={`w-6 h-6 ${scrolled ? "text-white" : "text-yellow-200"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`text-2xl font-bold tracking-wide cursor-pointer transition-colors duration-300 ${
                scrolled ? "text-gray-800" : "text-white"
              }`}>
                <span className={scrolled ? "text-cyan-600" : "text-yellow-200"}>Smart</span>Attendance
                <span className={scrolled ? "text-emerald-600" : "text-yellow-200"}>System</span>
              </span>
            </div>
          </div>

          {/* Desktop Links with hover effects */}
          <div className="hidden md:ml-6 md:flex md:space-x-1 items-center">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group overflow-hidden ${
                  scrolled 
                    ? "text-gray-700 hover:text-cyan-600 active:scale-95" 
                    : "text-white active:scale-95"
                }`}
              >
                {/* Background hover effect (desktop only) */}
                <span className={`absolute inset-0 w-full h-full transition-all duration-300 transform scale-x-0 md:group-hover:scale-x-100 origin-left ${
                  scrolled ? "bg-cyan-50" : "bg-white/10"
                }`}></span>
                
                {/* Text with relative positioning */}
                <span className="relative z-10">{link.name}</span>
                
                {/* Bottom border animation (desktop only) */}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 md:group-hover:w-full ${
                  scrolled ? "bg-cyan-600" : "bg-yellow-200"
                }`}></span>
              </a>
            ))}
          </div>

          {/* Mobile Menu Button with animation */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset ${
                scrolled 
                  ? "text-gray-700 hover:bg-gray-100 focus:ring-cyan-500" 
                  : "text-white hover:bg-white/20 focus:ring-white"
              }`}
            >
              <span className="sr-only">Open main menu</span>
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}></span>
                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}></span>
                <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}></span>
              </div>
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Menu with slide animation */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-96" : "max-h-0"
      }`}>
        <div className={`px-4 pt-2 pb-4 space-y-1 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md border-t border-gray-200" 
            : "bg-cyan-700/95 backdrop-blur-sm"
        }`}>
          {navLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 active:scale-95 ${
                scrolled 
                  ? "text-gray-700 active:bg-gradient-to-r active:from-cyan-100 active:to-emerald-100 active:text-cyan-700" 
                  : "text-white active:bg-white/30 active:backdrop-blur-lg"
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;