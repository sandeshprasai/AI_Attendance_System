import React, { useState } from 'react';

const ContactAdministrator = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    message: ''
  });

  const [contactInfo, setContactInfo] = useState({
    email: '',
    contactNo: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.message) {
      alert('Please fill in all fields');
      return;
    }
    console.log('Form submitted:', formData);
    console.log('Contact Info:', contactInfo);
    // Add your form submission logic here
    alert('Message sent successfully!');
    setFormData({ fullName: '', message: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: 'linear-gradient(to right, #0891b2, #3b82f6, #8b5cf6)',
         }}>
      <div className="w-full max-w-4xl">
        
        {/* Combined Contact Info and Form Section */}
        <div className="rounded-lg p-8"
             style={{
               backgroundColor: 'rgba(30, 41, 59, 0.8)',
               border: '2px solid rgba(59, 130, 246, 0.5)',
               backdropFilter: 'blur(10px)'
             }}>
          
          {/* Contact Info Section */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Contact Us</h2>
            <h3 className="text-2xl text-white text-center mb-8">Smart Attendance pvt.ltd</h3>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <label className="text-white text-xl font-semibold w-32">Email</label>
                <input
                  type="email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleContactInfoChange}
                  className="flex-1 px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="flex items-center">
                <label className="text-white text-xl font-semibold w-32">Contact No.</label>
                <input
                  type="tel"
                  name="contactNo"
                  value={contactInfo.contactNo}
                  onChange={handleContactInfoChange}
                  className="flex-1 px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                  placeholder="Enter contact number"
                />
              </div>
              
              <div className="flex items-center">
                <label className="text-white text-xl font-semibold w-32">Address</label>
                <input
                  type="text"
                  name="address"
                  value={contactInfo.address}
                  onChange={handleContactInfoChange}
                  className="flex-1 px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div>
            <h2 className="text-3xl font-bold text-white text-center mb-8">Form</h2>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <label className="text-white text-xl font-semibold w-32">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="flex items-start">
                <label className="text-white text-xl font-semibold w-32 pt-3">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  className="flex-1 px-4 py-3 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all resize-none"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                  placeholder="Enter your message"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-lg text-white text-xl font-semibold transition-all hover:scale-105 hover:brightness-110"
                  style={{
                    background: 'linear-gradient(to right, #0891b2, #3b82f6)',
                    border: '2px solid rgba(59, 130, 246, 0.6)'
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactAdministrator;