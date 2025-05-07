
import React, { useState } from 'react';
import CallButton from '@/components/CallButton';
import VoiceCallPanel from '@/components/VoiceCallPanel';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isCallActive, setIsCallActive] = useState(false);

  const startCall = () => {
    setIsCallActive(true);
  };

  const endCall = () => {
    setIsCallActive(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sm:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Customer Support AI</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-4">Welcome to our AI Customer Support</h2>
          <p className="text-gray-600 mb-6">
            We're here to help answer your questions and provide support for our products and services.
            Our AI assistant is available 24/7 to help with your inquiries.
          </p>

          <div className="mb-8">
            <h3 className="font-medium text-lg mb-3">Common Support Topics:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <h4 className="font-medium text-blue-700">Account Management</h4>
                <p className="text-sm text-gray-600 mt-1">Password resets, account settings, and profile updates</p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <h4 className="font-medium text-blue-700">Billing & Payments</h4>
                <p className="text-sm text-gray-600 mt-1">Invoice requests, payment methods, and subscription details</p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <h4 className="font-medium text-blue-700">Product Information</h4>
                <p className="text-sm text-gray-600 mt-1">Features, specifications, and compatibility questions</p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <h4 className="font-medium text-blue-700">Technical Support</h4>
                <p className="text-sm text-gray-600 mt-1">Troubleshooting, error messages, and how-to guidance</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-blue-800 mb-3">Start a Voice Conversation</h3>
            <p className="text-gray-600 mb-4">
              Click the button below to start speaking with our AI customer support assistant.
            </p>
            <Button
              onClick={startCall}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
            >
              Start Voice Support
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} AI Customer Support Demo. All rights reserved.</p>
        </div>
      </footer>

      {/* Call UI */}
      {!isCallActive && (
        <div className="fixed bottom-8 right-8 z-50">
          <CallButton onClick={startCall} />
        </div>
      )}
      
      <VoiceCallPanel 
        isOpen={isCallActive}
        onClose={endCall}
      />
    </div>
  );
};

export default Index;
