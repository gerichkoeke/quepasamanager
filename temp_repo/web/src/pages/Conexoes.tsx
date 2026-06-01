import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { QuepasaTab } from './QuepasaTab';
import { TwilioTab } from './TwilioTab';

export const Conexoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quepasa' | 'twilio'>('quepasa');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex border-b border-cw-border-light">
          <button
            onClick={() => setActiveTab('quepasa')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'quepasa'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            WhatsApp (Quepasa)
          </button>
          <button
            onClick={() => setActiveTab('twilio')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'twilio'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            SMS / WhatsApp (Twilio)
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'quepasa' && <QuepasaTab />}
        {activeTab === 'twilio' && <TwilioTab />}
      </div>
    </Layout>
  );
};
