import * as fs from 'fs';

let content = fs.readFileSync('temp_repo/web/src/pages/Sessions.tsx', 'utf8');

const target = '  const handleConfigureChatwoot = async (e: React.FormEvent) => {';

const replacementStr = `  const resetTypebotForm = () => {
    setEditingQuepasa(null);
    setTypebotForm({
      useTypebot: false,
      typebotFlowId: '',
      typebotHost: '',
      typebotApiKey: '',
      useNativeBot: false,
      botWelcomeMessage: '',
      botOptionsString: '',
      botInvalidMessage: '',
      provider: 'quepasa',
      officialPhoneId: '',
      officialApiToken: '',
      officialWabaId: '',
    });
  };

  const handleOpenTypebotConfig = (mapping: QuepasaMapping) => {
    setEditingQuepasa(mapping);
    setTypebotForm({
      useTypebot: mapping.useTypebot || false,
      typebotFlowId: mapping.typebotFlowId || '',
      typebotHost: mapping.typebotHost || '',
      typebotApiKey: mapping.typebotApiKey || '',
      useNativeBot: mapping.useNativeBot || false,
      botWelcomeMessage: mapping.botWelcomeMessage || 'Olá! Para começar, escolha o setor:',
      botOptionsString: mapping.botOptions ? (mapping.botOptions as any[]).map((o: any) => \`\${o.id}|\${o.text}|\${o.teamId||''}\`).join('\\n') : '1|Opção Exemplo|',
      botInvalidMessage: mapping.botInvalidMessage || 'Opção Inválida!',
      provider: mapping.provider || 'quepasa',
      officialPhoneId: mapping.officialPhoneId || '',
      officialApiToken: mapping.officialApiToken || '',
      officialWabaId: mapping.officialWabaId || '',
    });
    setShowTypebotConfigModal(true);
  };

  const handleDisconnectQuepasa = async (id: string, name: string) => {
    if (!confirm(\`Tem certeza que deseja desconectar o WhatsApp \${name}?\`)) return;
    try {
      await api.deleteQuepasaSession(id);
      toast.success('WhatsApp desconectado', { id: 'disconnect' });
      loadData();
    } catch (error: any) {
      toast.error('Falha ao desconectar', { id: 'disconnect' });
    }
  };

  const handleDeleteQuepasa = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta conexão? O histórico no Chatwoot será mantido.')) return;
    try {
      await api.deleteQuepasaMapping(id);
      toast.success('Conexão removida');
      loadData();
    } catch (error: any) {
      toast.error('Falha ao remover conexão');
    }
  };

  const handleConfigureTypebot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuepasa) return;

    try {
      setIsSubmitting(true);
      // Parse bot options
      const parsedOptions = typebotForm.botOptionsString.split('\\n').filter(Boolean).map((line: string) => {
        const parts = line.split('|');
        return {
          id: parts[0] ? parts[0].trim() : '',
          text: parts[1] ? parts[1].trim() : '',
          teamId: parts[2] ? parseInt(parts[2].trim()) : undefined
        };
      }).filter((o: any) => o.id && o.text);

      const updateData: Partial<CreateQuepasaMappingRequest> = {
        useTypebot: typebotForm.useTypebot,
        typebotFlowId: typebotForm.typebotFlowId || undefined,
        typebotHost: typebotForm.typebotHost || undefined,
        typebotApiKey: typebotForm.typebotApiKey || undefined,
        useNativeBot: typebotForm.useNativeBot,
        botWelcomeMessage: typebotForm.botWelcomeMessage,
        botOptions: parsedOptions as any,
        botInvalidMessage: typebotForm.botInvalidMessage,
        provider: typebotForm.provider,
        officialPhoneId: typebotForm.officialPhoneId || undefined,
        officialApiToken: typebotForm.officialApiToken || undefined,
        officialWabaId: typebotForm.officialWabaId || undefined,
      };

      await api.updateQuepasaMapping(editingQuepasa.id, updateData);
      toast.success('Configuração salva com sucesso');
      setShowTypebotConfigModal(false);
      resetTypebotForm();
      loadData();
    } catch (error: any) {
      toast.error('Falha ao salvar configuração');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfigureChatwoot = async (e: React.FormEvent) => {`;

content = content.replace(target, replacementStr);

fs.writeFileSync('temp_repo/web/src/pages/Sessions.tsx', content);
