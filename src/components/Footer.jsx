import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium tracking-widest uppercase text-slate-900 mb-4">Ana's</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your trusted inventory management solution for frozen goods and retail products.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-widest uppercase text-slate-900 mb-4">Support</h4>
            <p className="text-xs text-gray-500">support@Anas.com</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">&copy; 2026 . All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
