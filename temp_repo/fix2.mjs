import fs from 'fs';
const file = 'temp_repo/web/src/pages/Sessions.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `      const parsedOptions = typebotForm.botOptionsString.split('\\n').filter(Boolean).map((line: string) => {
        const parts = line.split('|');
        return {
          id: parts[0] ? parts[0].trim() : '',
          text: parts[1] ? parts[1].trim() : '',
          teamId: parts[2] ? parseInt(parts[2].trim()) : undefined
        };
      }).filter((o: any) => o.id && o.text);`;

const replacement = `      const parsedOptions = typebotForm.botOptionsString.split('\\n').filter(Boolean).map((line: string) => {
        const parts = line.split('|');
        return {
          id: parts[0] ? parts[0].trim() : '',
          text: parts[1] ? parts[1].trim() : '',
          teamId: parts[2] ? parseInt(parts[2].trim()) : undefined,
          labels: parts[3] ? parts[3].split(',').map(s => s.trim()).filter(Boolean) : undefined,
          submenuText: parts[4] ? parts[4].trim() : undefined
        };
      }).filter((o: any) => o.id && o.text);`;

content = content.split(target).join(replacement);

// Also let's edit the label of the specific textarea to explain the new format
content = content.replace(
  '<label className="block text-sm font-medium text-gray-700 mb-1">Opções do Menu (Uma por linha: ID|Texto|TeamID_Chatwoot)</label>',
  '<label className="block text-sm font-medium text-gray-700 mb-1">Opções do Menu (Uma por linha: ID|Texto|TeamID|Etiquetas|Texto_Submenu)</label>'
);
content = content.replace(
  '<p className="text-[10px] text-gray-500 mt-1">Exemplo: 1|Suporte Técnico|10 (Onde 10 é o ID interno da equipe no Chatwoot para direcionamento)</p>',
  '<p className="text-[10px] text-gray-500 mt-1">Exemplo: 1|Suporte Técnico|10|suporte,vip|Mensagem customizada <br/>(TeamID, Etiquetas e Texto do Submenu são opcionais)</p>'
);

fs.writeFileSync(file, content);
