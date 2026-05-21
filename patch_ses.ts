import * as fs from 'fs';

let content = fs.readFileSync('temp_repo/web/src/pages/Sessions.tsx', 'utf8');

content = content.replace(
  /const \[typebotForm, setTypebotForm\] = useState\(\{[\s\S]*?\}\);/,
  `const [typebotForm, setTypebotForm] = useState({
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
  });`
);

content = content.replace(
  /const resetTypebotForm = \(\) => \{[\s\S]*?\}\);/,
  `const resetTypebotForm = () => {
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
  };`
);

content = content.replace(
  /const handleOpenTypebotConfig = \(mapping: QuepasaMapping\) => \{[\s\S]*?\}\);/,
  `const handleOpenTypebotConfig = (mapping: QuepasaMapping) => {
    setEditingQuepasa(mapping);
    setTypebotForm({
      useTypebot: mapping.useTypebot || false,
      typebotFlowId: mapping.typebotFlowId || '',
      typebotHost: mapping.typebotHost || '',
      typebotApiKey: mapping.typebotApiKey || '',
      useNativeBot: mapping.useNativeBot || false,
      botWelcomeMessage: mapping.botWelcomeMessage || 'Olá! Para começar, escolha o setor:',
      botOptionsString: mapping.botOptions ? mapping.botOptions.map((o: any) => \`\${o.id}|\${o.text}|\${o.teamId||''}\`).join('\\n') : '1|Opção Exemplo|',
      botInvalidMessage: mapping.botInvalidMessage || 'Opção Inválida!',
      provider: mapping.provider || 'quepasa',
      officialPhoneId: mapping.officialPhoneId || '',
      officialApiToken: mapping.officialApiToken || '',
      officialWabaId: mapping.officialWabaId || '',
    });
    setShowTypebotConfigModal(true);
  };`
);

content = content.replace(
  /const updateData: Partial<CreateQuepasaMappingRequest> = \{[\s\S]*?typebotApiKey: typebotForm\.typebotApiKey \|\| undefined,\n      \};/,
  `// Parse bot options
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
      };`
);

fs.writeFileSync('temp_repo/web/src/pages/Sessions.tsx', content);
