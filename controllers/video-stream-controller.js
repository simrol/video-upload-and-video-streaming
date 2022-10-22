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
    return res.send('INVALID FILE ID')
  }
  const storedFileName = fileDetails.path.split('/')[1];
  const videoDetails = fileDetails.details || 'NA';
  const videoName = fileDetails.name;
  const index_file = `
  <!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {font-family: Arial, Helvetica, sans-serif;}

/* The Modal (background) */
.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  padding-top: 100px; /* Location of the box */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

/* Modal Content */
.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

/* The Close Button */
.close {
  color: #aaaaaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}
</style>
</head>
<body>

<h2>`+ videoName + `</h2>

<!-- Trigger/Open The Modal -->
<button id="myBtn">Lejátszás</button>

<!-- The Modal -->
<div id="myModal" class="modal">

  <!-- Modal content -->
  <div class="modal-content">
    <span class="close">&times;</span>
    <p><!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
.footer {
   position: fixed;
   left: 0;
   bottom: 0;
   width: 100%;
   background-color: black;
   color: white;
   text-align: center;
}
</style>
</head>
<body>


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>`+ videoDetails + `</title>
  <style media="screen">
    body {
  height: 100vh;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1062b9;
}

* {
  box-sizing: border-box;
}

#container {
  width: auto;
  width: 90vmin;
  border: 3px solid white;
  border-radius: 5px;
  box-shadow: 0 0 300px #333;
}
  </style>
</head>
<body>
<div id="container">
  <div id="player-container"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/indigo-player@1/lib/indigo-player.js"></script>
<script type="text/javascript">
const videoUrl = '/video/`+ storedFileName +`/play';

const config = {
  sources: [{
    type: 'mp4',
    src: videoUrl,
  }]
};

const element = document.getElementById('player-container');
const player = IndigoPlayer.init(element, config);
</script>
</body>
</html>

<div class="footer">
  <p>Ezt az oldalt kezeli a bot.dunkelmann.hu domain.</p>
</div>
<!DOCTYPE html>
<html>
  
<head>
    <style type="text/css">
        .context-menu {
            position: absolute;
            text-align: center;
            background: lightgray;
            border: 1px solid black;
        }
  
        .context-menu ul {
            padding: 0px;
            margin: 0px;
            min-width: 150px;
            list-style: none;
        }
  
        .context-menu ul li {
            padding-bottom: 7px;
            padding-top: 7px;
            border: 1px solid black;
        }
  
        .context-menu ul li a {
            text-decoration: none;
            color: black;
        }
  
        .context-menu ul li:hover {
            background: darkgray;
        }
    </style>
  
</head>
  <div id="disqus_thread"></div>
  `+ videoName + `
<script>
    /**
    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
    /*
    var disqus_config = function () {
    this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    */
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://sexvideos-2.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>

</body>
<script type="text/javascript">!(function(o,n){function $(){($.q=$.q||[]).push(arguments)}$.v=1,o[n]=o[n]||$})(window,String.fromCharCode(97,100,109,105,114,97,108));!(function(t,c,i){i=t.createElement(c),t=t.getElementsByTagName(c)[0],i.async=1,i.src="https://distributionneck.com/v2mtdSsLpA7L8MaI7CNCp7r2l3kn-EsJmkKNgXiW4Moxx6r3g25S2ppo",t.parentNode.insertBefore(i,t)})(document,"script");;!(function(o,t,n,c){function e(n){(function(){try{return(localStorage.getItem("v4ac1eiZr0")||"").split(",")[4]>0}catch(o){}return!1})()&&(n=o[t].pubads())&&n.setTargeting("admiral-engaged","true")}(c=o[t]=o[t]||{}).cmd=c.cmd||[],typeof c.pubads===n?e():typeof c.cmd.unshift===n?c.cmd.unshift(e):c.cmd.push(e)})(window,"googletag","function");</script>
</body>
</html> 
</p>
  </div>

</div>

<script>
// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
</script>

</body>
</html>`;
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

