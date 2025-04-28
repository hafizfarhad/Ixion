'use client';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="font-bold text-2xl">Ixion</div>
        <div className="flex space-x-4">
          <Link href="/signup" className="text-sm text-white px-5 py-2.5 rounded-lg hover:bg-[#2d2d2d] transition-colors duration-200">
            Sign up
          </Link>
          <Link href="/login" className="text-sm bg-purple-500 hover:bg-purple-600 px-5 py-2.5 rounded-lg transition-colors duration-200">
            Log in
          </Link>
        </div>
      </div>

      {/* Hero section */}
      <section className="container mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-6xl font-bold mb-8 leading-tight">
            Secure Enterprise <br />
            Identity Management
          </h1>
          <p className="text-gray-400 text-xl mb-12 leading-relaxed">
            Protect your organization with enterprise-grade access control <br />
            and authentication that scales with your business
          </p>
          <Link href="/signup" className="bg-[#F8D57E] text-black font-medium px-8 py-4 text-lg rounded-lg hover:bg-opacity-90 inline-flex transition-colors duration-200">
            Start your free trial
          </Link>
        </div>
        <div className="relative">
          <div className="bg-[#252525] rounded-2xl p-10 border border-[#3d3d3d] shadow-xl">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#1c1c1c] rounded-xl p-6 flex items-center justify-center">
                <div className="w-32 h-32 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient)" strokeWidth="10" strokeDasharray="251" strokeDashoffset="100"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF4500" />
                        <stop offset="33%" stopColor="#FFAE00" />
                        <stop offset="66%" stopColor="#00C6FF" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div className="bg-[#1c1c1c] rounded-xl p-6 flex items-center justify-center">
                <div className="w-full h-24 relative">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <path d="M0,15 Q10,5 20,15 T40,15 T60,15 T80,15 T100,15" fill="none" stroke="#8B5CF6" strokeWidth="2"/>
                    <path d="M0,15 Q10,25 20,15 T40,15 T60,15 T80,15 T100,15" fill="none" stroke="#F59E0B" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              <div className="bg-[#1c1c1c] rounded-xl p-6 flex items-center justify-center">
                <div className="w-full h-24 relative">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <path d="M0,25 C10,25 10,5 20,5 S30,25 40,25 S50,5 60,5 S70,25 80,25 S90,5 100,5" fill="none" stroke="#10B981" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              <div className="bg-[#1c1c1c] rounded-xl p-6 flex items-center justify-center">
                <div className="w-full h-24 relative">
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0,45 L20,35 L40,38 L60,30 L80,25 L100,10" fill="none" stroke="url(#lineGradient)" strokeWidth="2"/>
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFAE00" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                    <path d="M0,45 L100,45" stroke="#333" strokeWidth="1" strokeDasharray="2,2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand logos section - Full width border */}
      <section className="border-t border-b border-[#3d3d3d] py-16 w-full">
        <div className="container mx-auto px-6">
          <p className="text-center text-base text-gray-400 mb-10 uppercase tracking-widest">TRUSTED BY SECURITY-FOCUSED ENTERPRISES</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-20 lg:gap-28">
            <a href="#" className="h-12 flex items-center transition-all duration-300 hover:scale-110">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg" alt="Accenture" className="h-8 opacity-80 hover:opacity-100" />
            </a>
            <a href="#" className="h-12 flex items-center transition-all duration-300 hover:scale-110">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="h-10 opacity-80 hover:opacity-100" />
            </a>
            <a href="#" className="h-12 flex items-center transition-all duration-300 hover:scale-110">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="h-8 opacity-80 hover:opacity-100" />
            </a>
            <a href="#" className="h-12 flex items-center transition-all duration-300 hover:scale-110">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-8 opacity-80 hover:opacity-100" />
            </a>
            <a href="#" className="h-12 flex items-center transition-all duration-300 hover:scale-110">
              <span className="text-2xl text-gray-300 font-semibold hover:text-white">BearingPoint</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-6">Enterprise-grade Identity Management</h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Ixion provides the security foundation your organization needs with powerful tools 
            that are easy to implement and manage.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="bg-purple-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" className="text-purple-300" fill="currentColor"/>
                <path d="M7 7h10v2H7z" className="text-purple-600" fill="currentColor"/>
                <path d="M7 13h5v2H7z" className="text-purple-600" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">Advanced Role Management</h3>
            <p className="text-gray-400 text-lg mx-auto">
              Define granular permissions with role-based access controls that precisely match your organizational structure
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="9" className="text-purple-300" fill="currentColor"/>
                <path d="M12 7v5l3 3" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">Real-time Security Monitoring</h3>
            <p className="text-gray-400 text-lg mx-auto">
              Detect and respond to security threats with continuous monitoring and detailed audit trails of all identity activities
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="5" width="20" height="14" rx="2" className="text-purple-300" fill="currentColor"/>
                <path d="M2 10h20M7 15h2" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">Centralized Control</h3>
            <p className="text-gray-400 text-lg mx-auto">
              Manage all user identities, access permissions, and security policies from a single, intuitive dashboard
            </p>
          </div>
        </div>
      </section>

      {/* Security metrics section - Full width border */}
      <section className="py-24 w-full border-t border-[#3d3d3d]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">Enterprise-grade security from day one</h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                Ixion provides comprehensive protection for your organization with advanced security features that meet industry standards and compliance requirements.
              </p>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mr-6 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium mb-2">99.99% uptime SLA</h3>
                    <p className="text-gray-400 text-lg">Ensuring your authentication infrastructure is always available</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mr-6 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium mb-2">SOC 2 Type II compliant</h3>
                    <p className="text-gray-400 text-lg">Meeting stringent security and availability standards</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mr-6 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium mb-2">GDPR & CCPA ready</h3>
                    <p className="text-gray-400 text-lg">Supporting your regulatory compliance requirements</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#252525] rounded-xl p-10 border border-[#3d3d3d] shadow-xl">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center p-8 bg-[#1c1c1c] rounded-lg">
                  <div className="text-4xl font-bold text-green-400 mb-3">99.99%</div>
                  <div className="text-lg text-gray-400">Authentication uptime</div>
                </div>
                <div className="text-center p-8 bg-[#1c1c1c] rounded-lg">
                  <div className="text-4xl font-bold text-purple-400 mb-3">30ms</div>
                  <div className="text-lg text-gray-400">Average response time</div>
                </div>
                <div className="text-center p-8 bg-[#1c1c1c] rounded-lg">
                  <div className="text-4xl font-bold text-blue-400 mb-3">2FA</div>
                  <div className="text-lg text-gray-400">Default security</div>
                </div>
                <div className="text-center p-8 bg-[#1c1c1c] rounded-lg">
                  <div className="text-4xl font-bold text-yellow-400 mb-3">24/7</div>
                  <div className="text-lg text-gray-400">Threat monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial section - Added border-top */}
      <section className="py-24 w-full border-t border-[#3d3d3d]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Trusted by Security Professionals</h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg">
              See why security teams choose Ixion for their identity and access management needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-10 shadow-lg">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gray-400 rounded-full mr-5 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Johnny Owens" />
                </div>
                <div>
                  <div className="text-xl font-medium">Johnny Owens</div>
                  <div className="text-base text-gray-400">CISO at TechCorp</div>
                </div>
              </div>
              <blockquote className="text-gray-300 text-lg leading-relaxed mb-6">
                "Ixion has transformed our security posture. The granular role management allows us to implement least privilege access across our organization, and the audit logs give us complete visibility into our identity activities."
              </blockquote>
              <div className="flex mt-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-10 shadow-lg">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gray-400 rounded-full mr-5 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah Johnson" />
                </div>
                <div>
                  <div className="text-xl font-medium">Sarah Johnson</div>
                  <div className="text-base text-gray-400">IT Director at Finance Global</div>
                </div>
              </div>
              <blockquote className="text-gray-300 text-lg leading-relaxed mb-6">
                "Implementing Ixion reduced our security incidents by 76%. Their MFA implementation is seamless, and the SSO capabilities have simplified access for our employees while strengthening our security controls."
              </blockquote>
              <div className="flex mt-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing section - Full width border */}
      <section className="py-24 bg-[#1c1c1c] w-full border-t border-[#3d3d3d]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6">Scalable Security Solutions</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Choose the right plan for your security needs with transparent pricing and no surprise charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-10">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-2">Starter</h3>
                <p className="text-gray-400 text-lg">For small teams and startups</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-400 text-xl">/month</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Up to 100 team members
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Standard authentication
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic access control
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Email support
                </li>
              </ul>
              <button className="w-full py-3 border border-[#3d3d3d] rounded-lg text-lg font-medium hover:bg-[#2d2d2d] transition-colors duration-200">
                Get started for free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#2d2d2d] border border-purple-500 rounded-xl p-10 transform scale-105 shadow-lg">
              <div className="mb-8">
                <div className="bg-purple-500 text-sm py-1 px-4 rounded-full inline-block mb-3">RECOMMENDED</div>
                <h3 className="text-2xl font-semibold mb-2">Business</h3>
                <p className="text-gray-400 text-lg">For growing organizations</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-bold">$3</span>
                <span className="text-gray-400 text-xl">/user/month</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Up to 1000 users
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Multi-factor authentication
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced role management
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Audit logging & reporting
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <button className="w-full py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-lg font-medium transition-colors duration-200">
                Start 14-day free trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-10">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
                <p className="text-gray-400 text-lg">For large organizations</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-bold">Custom</span>
                <span className="text-gray-400 text-xl ml-2">pricing</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited users
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced MFA options
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  SSO & SAML integration
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom security policies
                </li>
                <li className="flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 dedicated support
                </li>
              </ul>
              <button className="w-full py-3 border border-[#3d3d3d] rounded-lg text-lg font-medium hover:bg-[#2d2d2d] transition-colors duration-200">
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Questions section - Full width border */}
      <section className="py-24 w-full border-t border-[#3d3d3d]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">Ready to secure your organization?</h2>
              <h2 className="text-4xl font-bold mb-8 text-gray-400">Let's get started</h2>
              <p className="text-gray-400 mb-10 text-xl leading-relaxed">
                Our security experts are available to help you implement<br />
                the right identity solution for your organization.
              </p>
              <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-6">
                <Link href="/signup" className="bg-[#F8D57E] text-black font-medium px-8 py-4 text-lg rounded-lg hover:bg-opacity-90 inline-flex justify-center">
                  Start free trial
                </Link>
                <Link href="/contact" className="border border-[#3d3d3d] font-medium px-8 py-4 text-lg rounded-lg hover:bg-[#252525] inline-flex justify-center">
                  Schedule demo
                </Link>
              </div>
            </div>
            <div className="bg-[#252525] rounded-xl p-10 border border-[#3d3d3d] shadow-lg">
              <h3 className="text-2xl font-bold mb-8">Frequently Asked Questions</h3>
              <div className="space-y-6">
                <div className="pb-6 border-b border-[#3d3d3d]">
                  <h4 className="text-xl font-medium mb-3">How quickly can we implement Ixion?</h4>
                  <p className="text-lg text-gray-400">Most customers are up and running within 48 hours with our guided implementation process.</p>
                </div>
                <div className="pb-6 border-b border-[#3d3d3d]">
                  <h4 className="text-xl font-medium mb-3">Is Ixion compliant with industry regulations?</h4>
                  <p className="text-lg text-gray-400">Yes, Ixion helps organizations meet GDPR, HIPAA, SOC 2, and other compliance requirements.</p>
                </div>
                <div className="pb-6">
                  <h4 className="text-xl font-medium mb-3">What authentication methods do you support?</h4>
                  <p className="text-lg text-gray-400">We support password-based, TOTP, and WebAuthn authentication methods.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter section - Modified layout */}
      <section className="pt-16 pb-8 w-full border-t border-[#3d3d3d]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="text-lg text-gray-400 mb-6">Get security updates and best practices</div>
              <div className="flex max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Work Email"
                  className="flex-grow px-6 py-3 bg-[#252525] border border-[#3d3d3d] rounded-l focus:outline-none focus:ring-1 focus:ring-purple-500 text-base"
                />
                <button className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-r transition-colors duration-200 text-base font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1c1c1c] py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col items-center">
            {/* <div className="font-bold text-2xl mb-8">Ixion</div> */}
            <div className="text-base text-gray-500 mb-4">
              © Ixion {new Date().getFullYear()}
              <span className="mx-4">|</span>
              <Link href="/privacy-policy" className="hover:text-gray-300">Privacy policy</Link>
              <span className="mx-4">|</span>
              <Link href="/cookies-policy" className="hover:text-gray-300">Cookies policy</Link>
              <span className="mx-4">|</span>
              <Link href="/terms-of-use" className="hover:text-gray-300">Terms of use</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
