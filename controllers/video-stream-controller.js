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
  const index_file = `<input type="checkbox" id="darkmode">
    <label for="darkmode"></label>
    <div class="wrapper">
      <header class="myheader">
        <div class="myheader-inner">
          <h1  class="logo">Videóoldal</h1>
        </div>
      </header>
      <main>
        <center><body>
<!-- Docs styles -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/CDNSFree2/Plyr/plyr.css" />

<!--Add a Simple HTML5 Video tag-->
<div id="container">
  <video controls data-poster="" class="vid1">
    <!-- Video files -->
    <source src="/video/`+ storedFileName +`/play" type="video/mp4" size="720" />
    
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
          <h2>`+ videoName + `</h2>
          <h4>`+ videoDetails + `</h4>
          <h3>Megosztási lehetőségek</h3>
          <p id="demo"></p>

<script>
document.getElementById("demo").innerHTML = 
"" + window.location.href;
</script>
      </main>
      <footer class="footer">
        <div class="footer-inner">
          <h1 class="logo">Videóoldal szabad reklám megjelenítő sáv</h1>
        </div>
      </footer>
    </div>
<style>@import url("https://fonts.googleapis.com/css?family=Raleway:400,400i,700");
body {
  margin: 0;
  padding: 0;
  position: relative;
  background-color: #777;
}
.wrapper {
  font-family: Raleway, sans-serif;
  font-size: 18px;
  line-height: 1.7;
  background-color: #eaeaea;
  color: #333;
  transition: background-color 800ms ease;
}
input[type="checkbox"] {
  display: none;
}
input[type="checkbox"] + label {
  z-index: 10;
  position: fixed;
  margin: 2.4rem;
  right: 1rem;
  display: inline-flex;
  float: right;
  cursor: pointer;
  font-family: sans-serif;
  font-size: 24px;
  line-height: 1.3;
}

input[type="checkbox"] + label:before {
  width: 80px;
  height: 30px;
  border-radius: 30px;
  border: 2px solid #777;
  content: "Dark";
  text-align: center;
  background: #333;
  transition: background 200ms ease;
  color: #eaeaea;
}

input[type="checkbox"]:checked + label:before {
  background-color: #eaeaea;
  color: #333;
  content: "Light";
  font-weight: bold;
}

#darkmode:checked ~ .wrapper {
  background-color: #222;
  color: #eaeaea;
}
/*
#darkmode:checked ~ .wrapper .content {
  background-color: #222;
  color: #eaeaea;
}
*/
#darkmode:checked ~ .wrapper .myheader,
#darkmode:checked ~ .wrapper .footer {
  background-color: #121212;
  color: #eaeaea;
}

#darkmode:checked ~ .wrapper img {
  filter: brightness(70%);
}

h2 {
  font-size: 3rem;
  line-height: 1.2;
}

img {
  width: 100%;
}
img.small {
  width: 60%;
  float: right;
  padding: 1rem;
}

.myheader {
  position: sticky;
  width: 100vw;
  top: 0;
  z-index: 9;
}

.myheader,
.footer {
  background-color: #ddd;
  transition: background-color 800ms ease;
}

.myheader-inner,
.footer-inner {
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: auto;
}

main {
  padding: 1rem;
  max-width: 900px;
  margin: auto;
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

