document.addEventListener('DOMContentLoaded', function () {
  setTitle("No Music Playing");
  setArtist("");
  setAlbum("");

  

  registerButtonListeners();
  updateCurrentSong();
});

var LEFT = 37;
var SPACE = 32;
var RIGHT = 39;
document.onkeyup=function(e){
	if(e.keyCode===LEFT){
		prev();
	}
	else if(e.keyCode==SPACE){
		play();
	}
	else if(e.keyCode==RIGHT){
		next();
	}
}

function registerButtonListeners() {
  $('#prev').click(function() {
    prev();
  });
  $('#play').click(function() {
    play();
  });
  $('#next').click(function() {
    next();
  });
  $('#shuffle').click(function() {
    shuffle();
  });
  $('#repeat').click(function() {
    repeat();
  });
  $('#radio').click(function() {
    radio();
  });
  $('#thumbsUp').click(function(){
    thumbUp();
  });
  $('#thumbsDown').click(function(){
      thumbDown();
  });
}

// change to find the music tab insta
var musicTab;
function findMusicTab(callback) {
  if (musicTab) {
    return callback(musicTab);
  }
  chrome.tabs.query({url:'https://play.google.com/music/*'}, function(tabs) {
    if (tabs.length > 0) {
      musicTab = tabs[0];
      return callback(musicTab);
    }
  });
} 
function sendMessage(msg, callback) {
  findMusicTab(function(tab) {
    //console.log('tab',tab);
    chrome.tabs.sendMessage(tab.id, msg, callback);
  })
}
function sendAction(action, callback) {
  sendMessage({action: action}, callback);
}

function updateCurrentSong() {
  sendAction('getSongInfo', function(data) {
    updateCurrentSongWithData(data);
  });
}
function updateCurrentSongWithData(data) {
  //console.log(data);
  if (data.status === 'playing') {
    $('#play').attr('src','images/pause.png');
  } else {
    clearTimeout(progressTimeoutID);
    $('#play').attr('src','images/play.png');
  }
  if (data.shuffleStatus === 'ALL_SHUFFLE') {
    $('#shuffle').attr('src','images/shuffleOn.png');
  } else {
    $('#shuffle').attr('src','images/shuffle.png');
  }
  if (data.repeatStatus === 'NO_REPEAT') {
    $('#repeat').attr('src','images/repeat.png');
  } else if (data.repeatStatus === 'LIST_REPEAT') {
    $('#repeat').attr('src','images/repeatList.png');
  } else if (data.repeatStatus === 'SINGLE_REPEAT') {
    $('#repeat').attr('src','images/repeatOne.png');
  }
  if(data.thumbsUpStatus === 'selected') {
      $('#thumbsUp').attr('src','images/thumbUpOn.png');
  } else {
      $('#thumbsUp').attr('src','images/thumbUpOff.png');
  }
  if(data.thumbsDownStatus === 'selected') {
      $('#thumbsDown').attr('src','images/thumbDownOn.png');
  } else {
      $('#thumbsDown').attr('src','images/thumbDownOff.png');
  }
  setTitle(data.title);
  setArtist(data.artist);
  setAlbum(data.album);
  setAlbumArt(data.album_art);
  setProgress(data.progress, data.duration);
}

function prev() {
  sendAction('prev', function(response) {
    updateCurrentSongWithData(response);
  });
}

function play() {
  sendAction('play', function(response) {
    updateCurrentSongWithData(response);
  });
}

function next() {
  sendAction('next', function(response) {
    updateCurrentSongWithData(response);
  });
}

function shuffle() {
  sendAction('shuffle', function(response) {
    updateCurrentSongWithData(response);
  });
}

function repeat() {
  sendAction('repeat', function(response) {
    updateCurrentSongWithData(response);
  });
}

function radio() {
  sendAction('radio', function(response) {
    updateCurrentSongWithData(response);
  });
}

function thumbUp() {
  sendAction('thumbUp', function(response){
      updateCurrentSongWithData(response);
  });
}


function thumbDown() {
  sendAction('thumbDown', function(response){
      updateCurrentSongWithData(response);
  });
}
function setArtist(artist) {
  $("#artist").text(artist);
}

function setTitle(title) {
  $("#title").text(title);
}

function setAlbum(album) {
  $("#album").text(album);
}

function setAlbumArt(art, local) {
  $("#album_art").attr('src',local?'':'https://'+art);
}

var progressTimeoutID;
var now;
var end;
function setProgress(progress, duration) {
  clearTimeout(progressTimeoutID);
  // set current progress
  //console.log(progress, '/', duration);
  var progSplit = progress.split(':');
  var durSplit = duration.split(':');
  console.log(progSplit, '/', durSplit);
  now = parseFloat(progSplit[0])*60+parseFloat(progSplit[1]);
  end = parseFloat(durSplit[0]*60)+parseFloat(durSplit[1]);
  //console.log(now,'/',end);
  var p = Math.round((now/end)*100);
  $('#song_progress').attr('style', 'width: '+p+'%;');

  // setup moving slider
  progressTimeoutID = setTimeout(increaseProgress, 250);
}

function increaseProgress() {
  if (now <= end) {
    now+=0.25;
    var p = (now/end)*100;
    //console.log(p);
    $('#song_progress').attr('style', 'width: '+p+'%;');
    progressTimeoutID = setTimeout(increaseProgress, 250);
  } else {
    updateCurrentSong();
  }
}
