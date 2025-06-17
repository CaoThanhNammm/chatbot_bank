/**
 * External Chat Demo Page
 * Page to demonstrate external chat API integration
 */

import React from 'react';
import { ExternalChatDemo } from '../components/Chat';

const ExternalChatDemoPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <ExternalChatDemo />
      </div>
    </div>
  );
};

export default ExternalChatDemoPage;