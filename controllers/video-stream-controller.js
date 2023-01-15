const path = require('path');
const fs = require('fs');
const url = require('url');
const handleDb = require('../db/handle-db');

function getFile(file_name, callback){
  fs.readFile(path.resolve(process.env.FILE_UPLOAD_PATH, file_name), callback);
}

function streamVideoFile(req, res, video_file){
  const path = process.env.FILE_UPLOAD_PATH + req.params.file_name;
  const total = video_file.length;
  var range = req.headers.range;
  if (range) {
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    var chunksize = (end-start)+1;
    res.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total,
                                       "Accept-Ranges": "bytes",
                                       "Content-Length": chunksize,
                                       "Content-Type":"video/mp4"});
                  res.end(video_file.slice(start, end+1), "binary");

  } else {
    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
    fs.createReadStream(path).pipe(res);
  }

}

module.exports.renderVideo = function(req, res) {
  const fileDetails = handleDb.getFile(req.params.id);
  if(!fileDetails) {
    return res.send('A videó nem található.')
  }
  const storedFileName = fileDetails.path.split('/')[1];
  const videoDetails = fileDetails.details || 'Nincs leírása ennek a videónak.';
  const videoName = fileDetails.name;
  const index_file = `<div class="better">
<style id="custom_skin">
  div.flowplayer .fp-color { background-color: #fff }
  .flowplayer { max-width: 800px }
  .use-controlbar-background .fp-controls { background-color: rgba(0,0,0,.6) }

  /* Force controls to be visible initially. Do not use in production. */
  .flowplayer .fp-controls { visibility: visible; opacity: 1; }
  .flowplayer .fp-footer { display: none }
  .flowplayer .fp-progress { width: 50% }
</style>

<center><body>
<!-- Docs styles -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/CDNSFree2/Plyr/plyr.css" />

<!--Add a Simple HTML5 Video tag-->
<div id="container">
  <video controls data-poster="" class="vid1">
    <!-- Video files -->
    <source src="/video/`+ storedFileName +`/play" type="video/mp4" size="480" />
    
  </video>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/plyr/3.6.7/plyr.min.js"></script>

<script>
  var controls =
[
    'play-large', // The large play button in the center
   // 'restart', // Restart playback
   // 'rewind', // Rewind by the seek time (default 10 seconds)
    'play', // Play/pause playback
    'fast-forward', // Fast forward by the seek time (default 10 seconds)
    'progress', // The progress bar and scrubber for playback and buffering
    'current-time', // The current time of playback
    'duration', // The full duration of the media
    'mute', // Toggle mute
    'volume', // Volume control
    'captions', // Toggle captions
    'settings', // Settings menu
    'pip', // Picture-in-picture (currently Safari only)
    'airplay', // Airplay (currently Safari only)
    'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
    'fullscreen' // Toggle fullscreen
];

  const player = new Plyr('.vid1',{controls});
</script>

<style>
  :root {
  --plyr-color-main: #3A59B3;
    --plyr-video-control-color	:#FFFFFF;
}

</style></center>
  <div class="text">`+ videoName + `</div>
<div class="rubik">
<img src="https://download.flaticon.com/download/icon/42253?icon_id=42253&author=1&team=1&keyword=Calendar+tool+for+time+organization&pack=111031&style=1&style_id=0&format=png&color=%23000000&colored=1&size=32&selection=1&premium=0&type=standard&token=03AGdBq258XTPd1bFs6N4AeEOLwNMKZ0UBODkoMzwsFsqVaOaGKvAzOK0Ol9qWBnVLm6YjEYJ2kZVzhqJVX835I0UjUnRyO0s1RFShppHacurZmin9KLG3VKwOOvEG2cOvaVyYwLrvP7W3cTxVq_u8C59qETHAt763BaFX3uJ28Xo4xDUzmgaRCGCA1ScL6NL6mYVusFOtjeuMJi0xEzkj8G5-KN8lMtZ7ugnVh32bg2QC5fORrgFPX1Vo7EWLXJ0Igd3FomAAaIc3vY1fMPc5TPqNnUCE3K0-dmN6_37cmf4Qrrwv1YJI8tuEeepkE0sjoRsM-uod1ZnMcP3oZgNVg-ASQAKJBcSNM2YBoYcuibGzrOi7TB17szrBV9RIs15_lfG3AoerJOzMglp9RZCbko7kaHJXWb-BHLPpg_YlEQ4LwMc5zUoRTVcyyyfLHOEm3GNxfRqlfQ0zLB0jCbLdagv4gi7O-PYUCs4JaaeN4s9fVlg_Wfo2P1nas27hM2lKjCoYo2GxYe_vj6m7eI4WnTZsuOa1ii5QDbdZuyH3VdsU0SBLhkugxea9wUc6e8qOqF5WnAOHewZfYeDlqXFwGmtN_3IWXHNmsppXAHC2ew-a5RlvkCiAmWpr0jjNarFrtNaiSqXq0-EaPFUtH1gMhSj1gAYK8oCzGtA5YvRj-8t5c8mpSylmhks0DjwQ_gwj_R700Heylu1cW_NFRDvMQn3_IvoB2NuNisIUyY8NfUek6DPmFe2niV7hoK37MEIBGicE20DTREk_L53HseVMHgeo11n_J2exUqG_dAxuPdPeoTQsWTGrepHoPX4fGF7qisLI-o1vhmM5Av0Tg5ympz5lGQlEkSyCk-rBduVZhlIldxzf_6ZQINkyZFw9P483o0ujkSI0gtqg4QtZSBltTJY2pA8L22m8eGbXpNGqBIVwQAgN7ehd2vYPAgHec5wLRHWgNf9DqGFFfCbH-2LV4WPtBzkZaJ-FzCxOcna9MjbBCsxbxO4tAf6FN83L2wx6dp80e34YEgAMdWBP567XbTN1H7WrgSXPSH_hEfrra-em2bsM_5umy0thhUW8eW2rsQrTYyBP-_Aaun8gDOED5CRTfZtc_XxuZBE45xF1LkBWScLDjo8NYp8_c_kffGcUyoarTemdv0kv_udKcBAtz-b047zJKUjM1ZWKjwt5NaSm9X0wOQ3jafvM5eS7-nIhg4mrU4rQVMSalWTZvGJNkddpqiD7weBqBdDZpL1diA553TYPl_uSDoylDZdJ_edXTgtUx-vHCPpsbWTDcqv0f_8y7RO4m6Gqxx6-YgA15Zk2e-5Qu2xshQzRSHynM7Vq6G5mZpCqAtA-DESk32jZb8SGEdiFmFhBchhLIb-5eNIWHMA0ufuM_-ZfLWdOh_fj_5NmrwTs4Qegv4kNOrTsTp3e-_k3vQWj2S_H1hytDZwSoBQXx23PBCTRseerOz44fuV0IMpgGV2DirgCRWLRies0l1zj0ebuKFFx57wXpU_aUfIiFJIeBhSOiBSLZvfgEXS7ppSTr3MWKoalGfoyy2RAUnNwFN1Rz4gB-k2fkGkEK4-r8_YrGcdYXt-S3aUqrdywcIp7ChYp&_gl=1*q0y5yr*_ga*NDA3NTAwODY5LjE2Mjg5MzQwMjI.*_ga_3Q8LH3P0VP*MTYyODkzNDAyMi4xLjEuMTYyODkzNDAyNy4w" width="15">
  <font size="6">`+ videoDetails + `</font>
  <div class="voltaire">
    
         
         
         
         
     
    <a href="https://rave.dj/u/cloneable"><img src="https://d3kjiohsmfpss9.cloudfront.net/avatar/b8bddfb4-aab9-4772-b9d7-083758bbada0-TEYUHDPHMQQN-256.jpeg" width="20"></a>
      
   
    <font size="5">Ismeretlen feltöltő</font>
  </div>
  <!-- LikeBtn.com BEGIN -->
<span class="likebtn-wrapper" data-theme="padded" data-ef_voting="wobble" data-white_label="true" data-identifier="item_1" data-popup_disabled="true" data-popup_dislike="true" data-popup_position="bottom" data-popup_style="dark" data-popup_width="150" data-popup_donate="{&quot;purpose&quot;:&quot;&quot;,&quot;payment_systems&quot;:[]}" data-lazy_load="true" data-loader_show="true"></span>
<script>(function(d,e,s){if(d.getElementById("likebtn_wjs"))return;a=d.createElement(e);m=d.getElementsByTagName(e)[0];a.async=1;a.id="likebtn_wjs";a.src=s;m.parentNode.insertBefore(a, m)})(document,"script","//w.likebtn.com/js/w/widget.js");</script>
<!-- LikeBtn.com END -->
  </div>
  <body>
    <div class="rate">                                  
    <input type="radio" id="star5" name="rate" value="5" />
    <label for="star5" title="text">5 stars</label>
    <input type="radio" id="star4" name="rate" value="4" />
    <label for="star4" title="text">4 stars</label>
    <input type="radio" id="star3" name="rate" value="3" />
    <label for="star3" title="text">3 stars</label>
    <input type="radio" id="star2" name="rate" value="2" />
    <label for="star2" title="text">2 stars</label>
    <input type="radio" id="star1" name="rate" value="1" />
    <label for="star1" title="text">1 star</label>
  </div>
</body>
 <style>@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Voltaire&display=swap');

.voltaire {
  font-family: 'voltaire';
}

.better {
  padding: 35px;
  padding-left: 40px;
}

.text {
  font-family: 'Rubik', sans-serif;
  font-size: 30px;
  font-weight: 600;
}

.rubik {
  font-family: 'Rubik';
}

.rate {
    float: left;
    height: 46px;
}
.rate:not(:checked) > input {
    position:absolute;
    top:-9999px;
}
.rate:not(:checked) > label {
    float:right;
    width:1em;
    overflow:hidden;
    white-space:nowrap;
    cursor:pointer;
    font-size:15px;
    color:#ccc;
}
.rate:not(:checked) > label:before {
    content: '★';
}
.rate > input:checked ~ label {
    color: #ffc700;    
}
.rate:not(:checked) > label:hover,
.rate:not(:checked) > label:hover ~ label {
    color: #deb217;  
}
.rate > input:checked + label:hover,
.rate > input:checked + label:hover ~ label,
.rate > input:checked ~ label:hover,
.rate > input:checked ~ label:hover ~ label,
.rate > label:hover ~ input:checked ~ label {
    color: #c59b08;
}



</style>`;
  res.send(index_file);

}

module.exports.streamVideo = function(req, res) {

  const file_name = req.params.file_name;

  function handleFile(error, file_data){
    if(error) {
      if(error.code === 'ENOENT') {
        return res.status(404).json({
          error: 'No such file found'
        });
      }
      return res.json(error);
    }
    streamVideoFile(req, res, file_data);
  }

  getFile(file_name, handleFile);

}

