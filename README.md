# Mod Live Chat

Projeto de comunidade em tempo real com identidade **Mod Live Chat — Desde 2026**.

## Recursos desta versão
- Canais de texto e interface de comunidade
- Chat em tempo real com Socket.IO
- Salas por ID
- Voz e vídeo via WebRTC
- Compartilhamento de tela do PC
- Lista de participantes online
- Interface responsiva
- Logo oficial incluída em `public/assets/modlive-logo.jpeg`

## Executar
1. Instale Node.js 18+.
2. Abra o terminal na pasta do projeto.
3. Execute `npm install`.
4. Execute `npm start`.
5. Abra `http://localhost:3000`.

## Colocar público
Hospede em um serviço que aceite Node.js/WebSocket e use HTTPS. Para chamadas mais confiáveis entre redes diferentes, configure um servidor TURN (por exemplo, coturn) e adicione suas credenciais à configuração WebRTC.

## Observação
Esta é uma base funcional inspirada em apps de comunidade. Recursos de produção como contas persistentes, banco de dados, recuperação de senha, moderação avançada, armazenamento de arquivos e criptografia/segurança operacional precisam de infraestrutura adicional.
