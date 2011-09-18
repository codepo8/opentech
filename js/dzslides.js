/*
 * DZSlides by Paul Rouget @paulrouget
 * heavily modified by Chris Heilmann @codepo8
 **/


friendWindows = [];
idx = 1;
slides = null;

/* Handle keys */

function handlekeys( e ) {
    // Don't intercept keyboard shortcuts

  if ( e.altKey || e.ctrlKey || e.metaKey || e.shiftKey ) {
    return;
  }
  if ( e.keyCode == 37 // left arrow
    || e.keyCode == 38 // up arrow
    || e.keyCode == 33 // page up
  ) {
    if( presenting ) {
      e.preventDefault();
      back();
    }
  }
  if ( e.keyCode == 39 // right arrow
    || e.keyCode == 40 // down arrow
    || e.keyCode == 34 // page down
  ) {
    if( presenting ) {
      e.preventDefault();
      forward();
    }
  }

  if ( e.keyCode == 32) { // space
      e.preventDefault();
      toggleContent();
  }

  if ( e.keyCode == 27 ) { // ESC
    e.preventDefault();
    presenting = false;
    document.querySelectorAll( 'link' )[0].disabled = false;
    document.querySelectorAll( 'link' )[1].disabled = true;
    document.body.style.MozTransform = 'scale(1)';
  }

  if ( e.keyCode == 78 ) {
    if(document.body.className.indexOf('shownotes') === -1){
      document.body.className = 'loaded shownotes';
    } else {
      document.body.className = 'loaded';
    }
  }

};

/* Touch Events */

function setupTouchEvents() {

  var orgX, orgY;
  var newX, newY;

  var body = document.body;
  body.addEventListener( "touchstart", start, false );
  body.addEventListener( "touchmove", move, false );
  body.addEventListener( "touchend", end, false );

  function start( e ) {
    e.preventDefault();
    orgX = e.changedTouches[0].pageX;
    orgY = e.changedTouches[0].pageY;
  }

  function move( e ) {
    newX = e.changedTouches[0].pageX;
    newY = e.changedTouches[0].pageY;
  }

  function end( e ) {
    if ( orgX - newX > 10 ) {
      forward();
    } else {
      if ( orgX - newY < 10 ) {
        back();
      }
    }
  }

}

/* Adapt the size of the slides to the window */

function resize() {

  var sx = document.body.clientWidth / window.innerWidth;
  var sy = document.body.clientHeight / window.innerHeight;
  var transform = "scale(" + ( 1 / Math.max(sx, sy ) ) + ")";
  document.body.style.MozTransform = transform;
  document.body.style.WebkitTransform = transform;
  document.body.style.OTransform = transform;
  document.body.style.msTransform = transform;
  document.body.style.transform = transform;

};

function getDetails( idx ) {

  var s = document.querySelector( "section:nth-of-type(" + idx + ")" );
  var d = s.querySelector( "details" );
  return d ? d.innerHTML : "";

}

function messagein( e ) {

  msg = e.data;
  win = e.source;
  if ( msg === "register" ) {
    friendWindows.push( win );
    win.postMessage(
      JSON.stringify({
        method: "registered", 
        title: document.title, 
        count: slides.length
      }), "*" 
    );
    win.postMessage(
      JSON.stringify({
        method: "newslide", 
        details: getDetails( idx ),
        idx: idx
      }), "*" );
    return;
  }
  if ( msg === "back" ) { back(); }
  if ( msg === "forward" ) { forward(); }
  if ( msg === "toggleContent" ) { toggleContent(); }
  var r = /setSlide\((\d+)\)/.exec( msg );
  if ( r ) {
      idx = r[1];
      setSlide();
  }

};

function toggleContent() {

  var s = document.querySelector( "section[aria-selected]" );
  if ( s ) {
      var video = s.querySelector( "video" );
      if ( video ) {
          if ( video.ended || video.paused ) {
              video.play();
          } else {
              video.pause();
          }
      }
  }

}

window.onhashchange = function( e ) {

  var newidx = ~~window.location.hash.split( "#" )[ 1 ];
  if ( !newidx ) { newidx = 1; }
  if ( newidx == idx ) { return; }
  idx = newidx;
  setSlide();

};

function back() {

  if( presenting ) {
    if ( idx == 1 ) { return; }
    idx--;
    setSlide();
  }

}

function forward() {

  if( presenting ) {
    if ( idx >= slides.length ) { return; }
    idx++;
    setSlide();
  }

}

function setSlide() {

  var old = document.querySelector( "section[aria-selected]" );
  var next = document.querySelector( "section:nth-of-type("+ idx +")" );
  if ( old ) {
    old.removeAttribute( "aria-selected" );
    var video = old.querySelector( "video" );
    if ( video ) { video.pause(); }
  }
  if ( next ) {
    next.setAttribute( "aria-selected", "true" );
    video = next.querySelector( "video" );
    if ( video ) { video.play(); }
    var exturl = next.querySelector( ".external" );
    if ( exturl ) { 
      var ifr = document.createElement( 'iframe' );
      ifr.src = exturl.href;
      ifr.style.display = 'none';
      ifr.onload = function() {
        this.style.display = 'block';
      };
      next.appendChild( ifr );
    }
    var bullets = next.querySelector( '.anibullets' );
    if ( bullets ) {
      var lis = bullets.querySelectorAll( 'li' );
      for( var i = lis.length-1; i>0; --i ) {
        lis[ i ].style.display = 'none';
      }
      var counter = 1;
      document.addEventListener( 'click', function( e ) {
        if( lis[ counter ] ){
          lis[ counter ].style.display = 'block';
          counter++;
        }
      },false);
    }
  } else {
    console.warn( "No such slide: " + idx );
    idx = 0;
    for ( i = 0; i < slides.length; i++ ) {
      if ( slides[ i ].hasAttribute( "aria-selected" ) ) {
          idx = i + 1;
      }
    }
  }

  window.location.hash = idx;
  for ( i = 0; i < friendWindows.length; i++ ) {
    friendWindows[ i ].postMessage(
      JSON.stringify(
        {
          method: "newslide",
          details: getDetails(idx),
          idx: idx
        }
      ),"*"
    );
  }

}

function init() {

  slides = document.querySelectorAll( "body > section" );
  onhashchange();
  setSlide();
  document.body.className = "loaded";
  setupTouchEvents();
  window.addEventListener( 'message', messagein, false );
  window.addEventListener( 'keydown', handlekeys, false );
  window.addEventListener( 'resize', resize, false );
  presenting = true;
  resize();

}

init();