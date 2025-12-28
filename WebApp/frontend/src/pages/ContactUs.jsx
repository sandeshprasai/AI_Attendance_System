import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const ContactAdministrator = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNo: '',
    address: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;
    
    if (name === 'fullName') {
      newValue = value.split(' ').map(word => {
        if (word.length > 0) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      }).join(' ');
    }
    
    if (name === 'contactNo') {
      newValue = value.replace(/[^0-9+\-() ]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else {
      const names = formData.fullName.trim().split(' ').filter(name => name.length > 0);
      if (names.length < 2) {
        newErrors.fullName = 'Please enter your full name (first and last name)';
      } else {
        const isValidFormat = names.every(name => name[0] === name[0].toUpperCase());
        if (!isValidFormat) {
          newErrors.fullName = 'First and last name must start with uppercase letters';
        }
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const allowedDomains = [
        '@gmail.com',
        '@yahoo.com',
        '@school.edu',
        '@outlook.com',
        '@college.edu',
        '@mail.school.edu',
        '@dept.university.edu',
        '@company.com.np',
        '@ngo.org.in',
        '@college.edu.au',
        '@protonmail.com',
        '@company.co',
        '@startup.io',
        '@organization.org',
        '@domain123.com',
        '@localhost.localdomain'
      ];
      
      const emailLower = formData.email.toLowerCase();
      const isValidDomain = allowedDomains.some(domain => emailLower.endsWith(domain));
      
      if (!isValidDomain) {
        newErrors.email = 'This email domain is not authorized. Please use an approved email domain.';
      }
    }

    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Contact number is required';
    } else {
      const digitsOnly = formData.contactNo.replace(/\D/g, '');
      if (digitsOnly.length < 9 || digitsOnly.length > 10) {
        newErrors.contactNo = 'Contact number must be 9 or 10 digits';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitting(true);
      console.log('Form submitted:', formData);
      
      setTimeout(() => {
        alert('Message sent successfully!');
        setFormData({
          fullName: '',
          email: '',
          contactNo: '',
          address: '',
          message: ''
        });
        setErrors({});
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen p-4" 
         style={{
           background: 'linear-gradient(to right, #0891b2, #3b82f6, #8b5cf6)',
         }}>
      
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-all hover:scale-105 mb-4"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '2px solid rgba(59, 130, 246, 0.5)',
        }}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-6xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="rounded-lg p-8"
                 style={{
                   backgroundColor: 'rgba(30, 41, 59, 0.8)',
                   border: '2px solid rgba(59, 130, 246, 0.5)',
                   backdropFilter: 'blur(10px)'
                 }}>
              
              <h2 className="text-3xl font-bold text-white text-center mb-6">About Our System</h2>
              
              <div className="space-y-4 text-white">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cyan-400">Smart Attendance System</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Our advanced attendance management system provides real-time tracking and automated reporting, 
                    making attendance management effortless for educational institutions and businesses.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cyan-400">Key Features</h3>
                  <div className="text-gray-300 leading-relaxed space-y-2">
                    <p>• Biometric and RFID integration for accurate tracking</p>
                    <p>• Real-time attendance monitoring and analytics</p>
                    <p>• Automated report generation and notifications</p>
                    <p>• Cloud-based secure data storage</p>
                    <p>• Mobile app for easy access</p>
                    <p>• Customizable attendance policies</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-cyan-400">Why Choose Us?</h3>
                  <p className="text-gray-300 leading-relaxed">
                    With over 5 years of experience, we have helped hundreds of organizations streamline their 
                    attendance processes, reduce administrative workload, and improve overall efficiency.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg p-8"
                 style={{
                   backgroundColor: 'rgba(30, 41, 59, 0.8)',
                   border: '2px solid rgba(59, 130, 246, 0.5)',
                   backdropFilter: 'blur(10px)'
                 }}>
            
              <h2 className="text-3xl font-bold text-white text-center mb-4">Contact Administrator</h2>
              <h3 className="text-xl text-white text-center mb-8">Smart Attendance pvt.ltd</h3>
            
              <div className="space-y-6">
                <div>
                  <div className="flex items-center">
                    <label className="text-white text-lg font-semibold w-40">Full Name</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: `1px solid ${errors.fullName ? '#ef4444' : 'rgba(59, 130, 246, 0.3)'}`
                        }}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center">
                    <label className="text-white text-lg font-semibold w-40">Email</label>
                    <div className="flex-1">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: `1px solid ${errors.email ? '#ef4444' : 'rgba(59, 130, 246, 0.3)'}`
                        }}
                        placeholder="Enter your email address"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              
                <div>
                  <div className="flex items-center">
                    <label className="text-white text-lg font-semibold w-40">Contact No.</label>
                    <div className="flex-1">
                      <input
                        type="tel"
                        name="contactNo"
                        value={formData.contactNo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: `1px solid ${errors.contactNo ? '#ef4444' : 'rgba(59, 130, 246, 0.3)'}`
                        }}
                        placeholder="Enter your contact number"
                      />
                      {errors.contactNo && (
                        <p className="text-red-400 text-sm mt-1">{errors.contactNo}</p>
                      )}
                    </div>
                  </div>
                </div>
              
                <div>
                  <div className="flex items-center">
                    <label className="text-white text-lg font-semibold w-40">Address</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: `1px solid ${errors.address ? '#ef4444' : 'rgba(59, 130, 246, 0.3)'}`
                        }}
                        placeholder="Enter your address"
                      />
                      {errors.address && (
                        <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start">
                    <label className="text-white text-lg font-semibold w-40 pt-3">Message</label>
                    <div className="flex-1">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all resize-none"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: `1px solid ${errors.message ? '#ef4444' : 'rgba(59, 130, 246, 0.3)'}`
                        }}
                        placeholder="Enter your message"
                      />
                      {errors.message && (
                        <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-lg text-white text-xl font-semibold transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: 'linear-gradient(to right, #0891b2, #3b82f6)',
                      border: '2px solid rgba(59, 130, 246, 0.6)'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactAdministrator;