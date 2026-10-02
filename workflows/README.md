# Workflow visual

O Thais AI Video usa ComfyUI local como motor visual gratuito.

1. Abra o ComfyUI.
2. Monte/carregue um workflow text-to-image.
3. Exporte em **API format**.
4. Salve como `workflows/flux-schnell-api.json`.
5. Configure no .env os IDs dos nós de prompt, latent e SaveImage.

Sugestão inicial: FLUX.1-schnell. O modelo é Apache-2.0 e pode ser executado localmente pelo ComfyUI.

O arquivo de workflow específico não é incluído automaticamente porque os IDs dependem do workflow/modelo instalado na máquina.