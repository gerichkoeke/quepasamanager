import React from 'react';
import { Layout } from '../components/Layout';
import { QuepasaTab } from './QuepasaTab';

export const Conexoes: React.FC = () => {
  return (
    <Layout>
      <div className="mt-4">
        <QuepasaTab />
      </div>
    </Layout>
  );
};

