export default {
    command: 'test6',
    category: 'experiment',
    description: 'Testing rich response: HTML with sound',
    syntax: '.test6',
    async run(context) {
        const { m, naze } = context;

        // Cth html rich dengan sound
        const html = `
<style>
*{
  -webkit-tap-highlight-color:transparent;
  -webkit-user-select:none;
  user-select:none;
}
body{
  margin:0;
  background:transparent;
  font-family:Arial,sans-serif;
  color:#eee;
}
.box{
  width:100%;
  max-width:620px;
  margin:auto;
  padding:16px;
  box-sizing:border-box;
}
.card{
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.15);
  border-radius:16px;
  padding:22px;
  box-sizing:border-box;
}
.title{
  font-size:22px;
  font-weight:bold;
  color:white;
}
.sub{
  font-size:12px;
  color:rgba(255,255,255,.5);
  margin-top:5px;
}
button{
  width:100%;
  border:0;
  border-radius:12px;
  padding:14px;
  margin-top:12px;
  font-size:15px;
  font-weight:bold;
  color:white;
  background:#6c5ce7;
  cursor:pointer;
}
button:active{
  transform:scale(.97);
}
.row{
  display:flex;
  gap:10px;
}
.row button{
  flex:1;
}
.status{
  margin-top:16px;
  text-align:center;
  font-size:12px;
  color:rgba(255,255,255,.55);
}
input{
  width:100%;
  box-sizing:border-box;
  margin-top:15px;
}
</style>

<div class="box">
  <div class="card">
    <div class="title">🔊 Sound Test</div>
    <div class="sub">Offline audio test</div>

    <button id="beep">TEST BEEP</button>

    <div class="row">
      <button id="low">LOW</button>
      <button id="mid">MID</button>
      <button id="high">HIGH</button>
    </div>

    <button id="melody">PLAY MELODY</button>

    <div style="margin-top:18px;font-size:12px;color:#aaa">
      Frequency:
      <span id="freqText">440 Hz</span>
    </div>

    <input
      id="freq"
      type="range"
      min="100"
      max="2000"
      value="440"
    >

    <div id="status" class="status">
      Ready — tekan tombol untuk mengeluarkan suara
    </div>
  </div>
</div>

<script>

let audioCtx = null;

function getAudio(){

  if(!audioCtx){
    audioCtx = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();
  }

  if(audioCtx.state === 'suspended'){
    audioCtx.resume();
  }

  return audioCtx;
}

function playTone(
  freq,
  duration = 0.3,
  type = 'sine'
){

  const ctx = getAudio();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;

  osc.frequency.setValueAtTime(
    freq,
    ctx.currentTime
  );

  gain.gain.setValueAtTime(
    0.0001,
    ctx.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.35,
    ctx.currentTime + 0.02
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + duration
  );

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();

  osc.stop(
    ctx.currentTime +
    duration +
    0.05
  );

  document.getElementById(
    'status'
  ).textContent =
    'Playing ' + freq + ' Hz';
}

document.getElementById(
  'beep'
).onclick = function(){

  playTone(
    440,
    0.5,
    'sine'
  );

};

document.getElementById(
  'low'
).onclick = function(){

  playTone(
    220,
    0.5,
    'sine'
  );

};

document.getElementById(
  'mid'
).onclick = function(){

  playTone(
    440,
    0.5,
    'sine'
  );

};

document.getElementById(
  'high'
).onclick = function(){

  playTone(
    880,
    0.5,
    'sine'
  );

};

document.getElementById(
  'freq'
).oninput = function(){

  document.getElementById(
    'freqText'
  ).textContent =
    this.value + ' Hz';

};

document.getElementById(
  'freq'
).onchange = function(){

  playTone(
    Number(this.value),
    0.5,
    'sine'
  );

};

document.getElementById(
  'melody'
).onclick = async function(){

  const notes = [
    261.63,
    329.63,
    392.00,
    523.25,
    392.00,
    329.63,
    261.63
  ];

  document.getElementById(
    'status'
  ).textContent =
    'Playing melody...';

  for(
    let i = 0;
    i < notes.length;
    i++
  ){

    playTone(
      notes[i],
      0.22,
      'sine'
    );

    await new Promise(
      function(resolve){
        setTimeout(
          resolve,
          260
        );
      }
    );

  }

  document.getElementById(
    'status'
  ).textContent =
    'Melody selesai';

};

</script>
`;

        const data = {
            response_id: "4db57b2c-8393-484d-8b9a-8e6d1a14b349",
            sections: [
                {
                    view_model: {
                        primitive: {
                            __typename: "GenAIaeacdsnwHtmlPrimitive",
                            payload: html,
                            trusted_sources: []
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                }
            ]
        };

        const unifiedResponse = Buffer.from(JSON.stringify(data)).toString('base64');

        await naze.relayMessage(
            m.chat,
            {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata: {}
                },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1,
                            submessages: [
                                {
                                    messageType: 2,
                                    messageText: "Offline Sound Test"
                                }
                            ],
                            unifiedResponse: {
                                data: unifiedResponse
                            },
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedAiBotMessageInfo: {
                                    botJid: "867051314767696@bot"
                                },
                                forwardOrigin: 4
                            }
                        }
                    }
                }
            },
            {}
        );
    }
};
