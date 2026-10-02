import fs from "node:fs/promises";import path from "node:path";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function generateSceneImage({prompt,outFile,width=768,height=1344}){
 const base=(process.env.COMFYUI_URL||"").replace(/\/$/,"");if(!base)throw new Error("COMFYUI_URL não configurada");
 const workflowPath=process.env.COMFYUI_WORKFLOW||"workflows/flux-schnell-api.json";
 const workflow=JSON.parse(await fs.readFile(workflowPath,"utf8"));
 const textNode=process.env.COMFYUI_TEXT_NODE||"6", latentNode=process.env.COMFYUI_LATENT_NODE||"5", saveNode=process.env.COMFYUI_SAVE_NODE||"9";
 if(!workflow[textNode]?.inputs)throw new Error("Nó de prompt do ComfyUI não encontrado");
 workflow[textNode].inputs.text=prompt;
 if(workflow[latentNode]?.inputs){workflow[latentNode].inputs.width=width;workflow[latentNode].inputs.height=height;workflow[latentNode].inputs.batch_size=1}
 const q=await fetch(base+"/prompt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:workflow,client_id:"thais-ai-video"})});
 if(!q.ok)throw new Error("ComfyUI: "+await q.text());const {prompt_id}=await q.json();
 for(let i=0;i<180;i++){await sleep(1000);const h=await fetch(base+"/history/"+prompt_id);if(!h.ok)continue;const data=await h.json(),job=data[prompt_id];const imgs=job?.outputs?.[saveNode]?.images;if(imgs?.length){const im=imgs[0],v=await fetch(base+`/view?filename=${encodeURIComponent(im.filename)}&subfolder=${encodeURIComponent(im.subfolder||"")}&type=${encodeURIComponent(im.type||"output")}`);if(!v.ok)throw new Error("Falha ao baixar imagem do ComfyUI");await fs.mkdir(path.dirname(outFile),{recursive:true});await fs.writeFile(outFile,Buffer.from(await v.arrayBuffer()));return outFile}}
 throw new Error("Tempo limite na geração visual");
}
export async function generateJobImages(job,dir){const images=[];for(const scene of job.scenes){const out=path.join(dir,`scene-${String(scene.id).padStart(2,"0")}.png`);await generateSceneImage({prompt:scene.visualPrompt,outFile:out});images.push(out)}return images}