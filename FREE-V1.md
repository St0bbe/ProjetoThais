# Thais AI Video — V1 gratuita

## Componentes
- Backend: Node.js + Express
- Narração: Kokoro TTS local (endpoint compatível com /v1/audio/speech)
- Legendas: geradas localmente em SRT a partir do roteiro
- Montagem: FFmpeg
- Música: arquivo de trilha local/royalty-free na V1
- Visual: preparado para receber imagens/cenas geradas por um provedor local ou gratuito

## Requisitos locais
1. Node.js 20+
2. FFmpeg no PATH
3. Kokoro TTS rodando localmente
4. Copie .env.example para .env e defina KOKORO_URL

Nenhuma chave secreta deve ser colocada no index.html ou enviada ao GitHub.

## Próxima etapa
Adicionar o gerador visual. Cada cena já possui visualPrompt, permitindo trocar o provedor sem alterar o restante do pipeline.