import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import express from "express";
import { scenesToSrt } from "./lib/subtitles.js";
import { synthesizeNarration } from "./lib/tts.js";
import { hasFfmpeg, renderSlideshow } from "./lib/render.js";
import { generateSceneImages } from "./lib/visual.js";

const app=express(), __dirname=path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({limit:"2mb"})); app.use(express.static(__dirname));
app.use("/output",express.static(path.join(__dirname,"output")));
const jobs=new Map();

function makePlan(prompt,duration=60){
 const count=Math.max(4,Math.round(duration/5)), themes=["abertura","apresentação","exemplo","descoberta","interação","reforço","desafio","encerramento"];
 return Array.from({length:count},(_,i)=>({id:i+1,start:i*5,end:Math.min(duration,(i+1)*5),scene:themes[i%themes.length],visualPrompt:`${prompt}. Cena ${i+1}, ${themes[i%themes.length]}, personagens consistentes, composição clara, colorida, sem texto embutido.`,narration:i===0?"Olá! Vamos aprender brincando!":i===count-1?"Muito bem! Continue observando e aprendendo!":`Cena ${i+1}: continue a explicação de forma simples, divertida e educativa.`}));
}
app.post("/api/generate",async(req,res)=>{
 const {prompt,duration=60,format="9:16",voice=true,music=true,captions=true}=req.body||{};
 if(!prompt?.trim()) return res.status(400).json({error:"Prompt obrigatório"});
 const id=crypto.randomUUID(), job={id,status:"planned",progress:25,prompt,duration:Number(duration),format,voice,music,captions,createdAt:new Date().toISOString()};
 job.scenes=makePlan(prompt,job.duration);jobs.set(id,job);res.json(job);
});
app.post("/api/jobs/:id/build",async(req,res)=>{
 const j=jobs.get(req.params.id);if(!j)return res.status(404).json({error:"Job não encontrado"});
 try{
  const dir=path.join(__dirname,"output",j.id);await fs.mkdir(dir,{recursive:true});
  j.status="generating_visuals";j.progress=35;
  const images=await generateSceneImages(j.scenes,dir,j.format);
  const srtFile=path.join(dir,"captions.srt");await fs.writeFile(srtFile,scenesToSrt(j.scenes));
  let audio=null;if(j.voice){j.status="generating_voice";j.progress=55;audio=path.join(dir,"narration.wav");await synthesizeNarration(j.scenes.map(x=>x.narration).join(" "),audio)}
  const music=j.music&&process.env.MUSIC_FILE?path.resolve(process.env.MUSIC_FILE):null;
  if(!(await hasFfmpeg()))throw new Error("FFmpeg não encontrado no servidor");
  j.status="rendering";j.progress=80;const out=path.join(dir,"video.mp4");
  await renderSlideshow({images,audio,music,srt:srtFile,out,duration:j.duration});
  j.status="done";j.progress=100;j.video="/output/"+j.id+"/video.mp4";j.captions="/output/"+j.id+"/captions.srt";res.json(j);
 }catch(e){j.status="error";j.error=e.message;res.status(500).json(j)}
});
app.get("/api/capabilities",async(_,res)=>res.json({ffmpeg:await hasFfmpeg(),kokoro:!!process.env.KOKORO_URL,visual:!!process.env.COMFYUI_URL,captions:true,render:true,providers:{voice:"Kokoro TTS",visual:"ComfyUI / Stable Diffusion",renderer:"FFmpeg"}}));
app.get("/api/jobs/:id",(req,res)=>{const j=jobs.get(req.params.id);if(!j)return res.status(404).json({error:"Job não encontrado"});res.json(j)});
app.get("/api/health",(_,res)=>res.json({ok:true,service:"Thais AI Video"}));
app.listen(process.env.PORT||3000,()=>console.log("Thais AI Video em http://localhost:"+(process.env.PORT||3000)));