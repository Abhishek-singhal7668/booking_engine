import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PrivacyPolicyModal from './PrivacyPolicyModal'; // Import the modal component

const FooterLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    className="block text-slate-700 hover:text-brand transition-colors duration-300"
    onClick={onClick}
  >
    {label}
  </Link>
);

const GlobalFooter = () => {
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);

  const openPrivacyPolicyModal = (e) => {
    e.preventDefault(); // Prevent default link behavior
    setIsPrivacyPolicyModalOpen(true);
  };

  const closePrivacyPolicyModal = () => {
    setIsPrivacyPolicyModalOpen(false);
  };

  return (
    <footer className="bg-slate-50 text-slate-700 mt-6">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="font-bold text-lg mb-2">Company Info</h4>
            <FooterLink to="/about-us" label="About Us" />
           
            <FooterLink to="/" label="Privacy Policy" onClick={openPrivacyPolicyModal} />
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="font-bold text-lg mb-2">Support</h4>
            <FooterLink to="/" label="FAQs" />
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="font-bold text-lg mb-2">Newsletter</h4>
            <p>Stay updated with our latest trends</p>
           
          </div>
        </div>
      </div>
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyModalOpen}
        onRequestClose={closePrivacyPolicyModal}
      />
    </footer>
  );
};

export default GlobalFooter;
