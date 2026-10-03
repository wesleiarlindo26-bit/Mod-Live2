const socket = io();
const $ = s => document.querySelector(s);
let roomId = "modlive-geral";
let username = "Visitante";
let localStream = null;
const peers = new Map();

function addMessage(x){
  const el=document.createElement("div");
  el.innerHTML=`<b>${escapeHtml(x.author.name)}:</b> ${escapeHtml(x.message)}`;
  $("#messages").appendChild(el);
  $("#messages").scrollTop=$("#messages").scrollHeight;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

$("#join").onclick=()=>{
  roomId=$("#room").value.trim()||"modlive-geral";
  username=prompt("Seu nome no ModLive:",username)||username;
  $("#username").textContent=username;
  socket.emit("join-room",{roomId,user:{name:username}});
};
$("#chatForm").onsubmit=e=>{
  e.preventDefault();
  const message=$("#message").value.trim(); if(!message)return;
  socket.emit("chat-message",{roomId,message}); $("#message").value="";
};
socket.on("chat-message",addMessage);
socket.on("room-users", users=> users.forEach(startPeer));
socket.on("user-joined", u=>{});
socket.on("user-left", ({socketId})=>{peers.get(socketId)?.close();peers.delete(socketId);});

async function ensureMedia(withVideo=false){
  if(!localStream)localStream=await navigator.mediaDevices.getUserMedia({audio:true,video:withVideo});
  return localStream;
}
async function startPeer(user){
  const pc=new RTCPeerConnection({iceServers:[
    {urls:"stun:stun.l.google.com:19302"},
    {urls:"stun:stun1.l.google.com:19302"}
  ]});
  peers.set(user.socketId,pc);
  const stream=await ensureMedia(false);
  stream.getTracks().forEach(t=>pc.addTrack(t,stream));
  pc.onicecandidate=e=>{if(e.candidate)socket.emit("signal",{to:user.socketId,data:{candidate:e.candidate}})};
  pc.ontrack=e=>showRemote(user,e.streams[0]);
  const offer=await pc.createOffer(); await pc.setLocalDescription(offer);
  socket.emit("signal",{to:user.socketId,data:{description:pc.localDescription}});
}
socket.on("signal",async ({from,data})=>{
  let pc=peers.get(from);
  if(!pc){
    pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
    peers.set(from,pc);
    const stream=localStream||await ensureMedia(false);
    stream.getTracks().forEach(t=>pc.addTrack(t,stream));
    pc.onicecandidate=e=>{if(e.candidate)socket.emit("signal",{to:from,data:{candidate:e.candidate}})};
    pc.ontrack=e=>showRemote({socketId:from,name:"Participante"},e.streams[0]);
  }
  if(data.description){
    await pc.setRemoteDescription(data.description);
    if(data.description.type==="offer"){
      const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
      socket.emit("signal",{to:from,data:{description:pc.localDescription}});
    }
  } else if(data.candidate) await pc.addIceCandidate(data.candidate);
});
function showRemote(user,stream){
  let card=document.getElementById("v-"+user.socketId);
  if(!card){card=document.createElement("div");card.className="video-card";card.id="v-"+user.socketId;const v=document.createElement("video");v.autoplay=true;v.playsInline=true;card.appendChild(v);$("#videos").appendChild(card);}
  card.querySelector("video").srcObject=stream;
}
$("#voice").onclick=async()=>{await ensureMedia(false);alert("Microfone ativado. Entre em uma sala para conversar.");};
$("#video").onclick=async()=>{await ensureMedia(true);alert("Câmera ativada.");};
$("#screen").onclick=async()=>{
  try{
    const screen=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
    const local=document.createElement("div");local.className="video-card";local.id="local-screen";
    const v=document.createElement("video");v.autoplay=true;v.muted=true;v.playsInline=true;v.srcObject=screen;local.appendChild(v);$("#videos").prepend(local);
    for(const pc of peers.values()){
      const sender=pc.getSenders().find(s=>s.track?.kind==="video");
      if(sender)sender.replaceTrack(screen.getVideoTracks()[0]);
    }
    screen.getVideoTracks()[0].onended=()=>document.getElementById("local-screen")?.remove();
  }catch(e){console.warn(e)}
};
socket.emit("join-room",{roomId,user:{name:username}});