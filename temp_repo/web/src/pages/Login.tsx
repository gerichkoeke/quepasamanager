import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Shield, Key } from 'lucide-react';

export const Login: React.FC = () => {
  const [token, setToken] = useState('');
  const [loginMethod, setLoginMethod] = useState<'token' | 'saml'>('token');
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if SSO is enabled in localStorage
    const saved = localStorage.getItem('sso_config');
    if (saved) {
      const config = JSON.parse(saved);
      if (config.enabled) {
        setSsoEnabled(true);
        setLoginMethod('saml');
      }
    }
  }, []);

  const handleSubmitToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      return;
    }

    const success = await login(token);
    if (success) {
      navigate('/');
    }
  };

  const handleSamlLogin = () => {
    // Redirect to SAML IdP
    const saved = localStorage.getItem('sso_config');
    if (saved) {
      const config = JSON.parse(saved);
      if (config.entryPoint) {
         // Create SAML AuthnRequest XML
         const id = '_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
         const issueInstant = new Date().toISOString();
         
         // Use the configured Issuer (Entity ID / Client ID)
         const issuer = config.issuer || window.location.origin;
         
         // ACS URL (Assertion Consumer Service) - Should match Valid Redirect URIs
         // We'll use the current origin + / (as per their setup)
         const redirectUrl = window.location.origin + '/';

         const samlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="${id}" Version="2.0" IssueInstant="${issueInstant}" Destination="${config.entryPoint}" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" AssertionConsumerServiceURL="${redirectUrl}">
    <saml:Issuer>${issuer}</saml:Issuer>
    <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified" AllowCreate="true"/>
</samlp:AuthnRequest>`;

         // Base64 encode the XML
         const base64Request = btoa(unescape(encodeURIComponent(samlRequest)));

         // Use HTTP-POST Binding via hidden form to bypass the need for deflating the payload
         const form = document.createElement('form');
         form.method = 'POST';
         form.action = config.entryPoint;
         form.style.display = 'none';

         const input = document.createElement('input');
         input.type = 'hidden';
         input.name = 'SAMLRequest';
         input.value = base64Request;
         
         form.appendChild(input);
         document.body.appendChild(form);
         form.submit();
      } else {
         alert('URL de Login do Provedor não configurada.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-8 transition-colors">
        <div className="flex justify-center mb-8">
          {/* Using text for logo fallback if needed but we have the image */}
          <img src="/logoastra.png" alt="QuepasaManager" className="h-12" />
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Selecione o método de autenticação
        </p>

        {ssoEnabled && (
          <div className="flex rounded-md shadow-sm mb-6 p-1 bg-gray-100 dark:bg-gray-700">
            <button
              type="button"
              onClick={() => setLoginMethod('saml')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                loginMethod === 'saml'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              SSO / SAML
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('token')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                loginMethod === 'token'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Token
            </button>
          </div>
        )}

        {loginMethod === 'token' ? (
          <form onSubmit={handleSubmitToken} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" /> Token de Autenticação
                </div>
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Digite seu token"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={!token.trim()}
            >
              {isLoading ? 'Entrando...' : 'Entrar com Token'}
            </Button>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
             <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <Shield className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                  Faça login usando suas credenciais de rede corporativa (Active Directory / Keycloak).
                </p>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={handleSamlLogin}
                >
                  Entrar com SSO
                </Button>
             </div>
          </div>
        )}

        {loginMethod === 'token' && !ssoEnabled && (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Contate seu administrador para obter um token</p>
          </div>
        )}
      </div>
    </div>
  );
};
