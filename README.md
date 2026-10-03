# ModLive 2.0

## Render
Build Command: `npm install`

Start Command: `node server/server.js`

## Environment
Adicione no Render:
- `GOOGLE_CLIENT_ID` = seu OAuth Client ID do Google
- `JWT_SECRET` = uma chave longa e aleatória
- `NODE_ENV` = `production`

No Google Cloud Console, crie um OAuth 2.0 Client ID do tipo Web application e adicione `https://mod-live.onrender.com` em Authorized JavaScript origins.

O cadastro/login é obrigatório via Google. A recuperação da Conta Google é feita pelo próprio Google.

Inclui chat Socket.IO, canais, usuários online, câmera/microfone WebRTC e compartilhamento de tela. Para WebRTC funcionar de forma confiável em todas as redes, futuramente é recomendado adicionar TURN.
