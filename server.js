import fs from "node:fs/promises";
import path from "node:path";
import { scenesToSrt } from "./lib/subtitles.js";
import { synthesizeNarration } from "./lib/tts.js";
import { hasFfmpeg } from "./lib/render.js";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
const app=express(), __dirname=path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({limit:"2mb"})); app.use(express.static(__dirname));
const jobs=new Map();
function makePlan(prompt,duration=60){
 const count=Math.max(4,Math.round(duration/5)), themes=["abertura","apresentação","exemplo","descoberta","interação","reforço","desafio","encerramento"];
 return Array.from({length:count},(_,i)=>({id:i+1,start:i*5,end:Math.min(duration,(i+1)*5),scene:themes[i%themes.length],visualPrompt:`${prompt}. Cena ${i+1}, composição clara, visual consistente, sem texto embutido.`,narration:i===0?"Olá! Vamos aprender brincando!":i===count-1?"Muito bem! Continue observando e aprendendo!":`Cena ${i+1}: continue a explicação de forma simples, divertida e educativa.`}));
}
app.post("/api/generate",async(req,res)=>{
 const {prompt,duration=60,format="9:16",voice=true,music=true,captions=true}=req.body||{};
 if(!prompt?.trim()) return res.status(400).json({error:"Prompt obrigatório"});
 const id=crypto.randomUUID(), job={id,status:"planning",progress:10,prompt,duration:Number(duration),format,voice,music,captions,createdAt:new Date().toISOString()};
 jobs.set(id,job); job.scenes=makePlan(prompt,Number(duration)); job.status="planned"; job.progress=25;
 res.json(job);
});
app.post("/api/jobs/:id/audio",async(req,res)=>{const j=jobs.get(req.params.id);if(!j)return res.status(404).json({error:"Job não encontrado"});try{const dir=path.join(__dirname,"output",j.id);await fs.mkdir(dir,{recursive:true});const srt=scenesToSrt(j.scenes);await fs.writeFile(path.join(dir,"captions.srt"),srt);const narration=j.scenes.map(x=>x.narration).join(" ");const audio=path.join(dir,"narration.wav");await synthesizeNarration(narration,audio);j.status="audio_ready";j.progress=55;j.audio="/output/"+j.id+"/narration.wav";j.captions="/output/"+j.id+"/captions.srt";res.json(j)}catch(e){res.status(500).json({error:e.message})}});
app.get("/api/capabilities",async(_,res)=>res.json({ffmpeg:await hasFfmpeg(),tts:!!process.env.KOKORO_URL,captions:true,render:true}));
app.use("/output",express.static(path.join(__dirname,"output")));
app.get("/api/jobs/:id",(req,res)=>{const j=jobs.get(req.params.id);if(!j)return res.status(404).json({error:"Job não encontrado"});res.json(j)});
app.get("/api/health",(_,res)=>res.json({ok:true,service:"Thais AI Video"}));
app.listen(process.env.PORT||3000,()=>console.log("Thais AI Video em http://localhost:"+(process.env.PORT||3000)));