# Pipeline do Thais AI Video

1. POST /api/generate recebe prompt, duração e formato.
2. Backend cria um job e divide o vídeo em cenas de aproximadamente 5 segundos.
3. Próxima integração: modelo de linguagem para roteiro final e prompts visuais.
4. Gerador visual produz cada cena.
5. TTS produz narração.
6. Música é gerada/selecionada sem competir com a voz.
7. Legendas são sincronizadas a partir da narração.
8. FFmpeg monta cenas, áudio, música e legendas e exporta MP4.
9. GET /api/jobs/:id acompanha o progresso.

As chaves ficam somente em variáveis de ambiente no servidor.