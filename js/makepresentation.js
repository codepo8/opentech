(function(){

  var slides = document.querySelectorAll( 'body > section' );
  var newidx = ~~window.location.hash.split( "#" )[ 1 ];

  for(var i = 1; slides[i]; i++) {
    slides[i].innerHTML += '<input type="checkbox" checked class="check">';
    slides[i].className += ' active';
  }

  slides[0].innerHTML += ''+
    '<p class="presentationinfo">Uncheck the slides below that you don\'t '+
    'want to include and press the button below to start the presentation.'+
    ' In presentation mode press the N key to toggle the display of notes.'+
    ' <button>Start Presentation</button></p>'; 

  var button = slides[ 0 ].querySelector( 'button' );
  button.addEventListener( 'click', setup ,false );
  if ( newidx ) {
    setup();
  } 
  function setup( ev ) {

    for ( var i = 1; slides[i]; i++ ) {
      if ( slides[ i ].className.indexOf( 'remove' ) !== -1 ) {
        slides[ i ].parentNode.removeChild( slides[ i ] );
      }
    }

    document.querySelector( 'link' ).disabled = true;

    var link = document.createElement( 'link' );
    link.href = 'styles/styles.css';
    link.rel = 'StyleSheet';
    document.querySelector( 'head' ).appendChild( link );

    var s = document.createElement( 'script' );
    s.src = 'js/dzslides.js';
    document.querySelector( 'head' ).appendChild( s );

    if(ev){ ev.preventDefault(); }

  }

  document.addEventListener( 'click', function( ev ) {

    var t = ev.target;
    if( t.tagName === 'INPUT' && t.className.indexOf( 'check' ) !== -1 ) {
      var mom = t.parentNode;
      if( mom.className.indexOf( 'active' ) !== -1 ) {
        mom.className = mom.className.replace( 'active', 'remove' );
      } else {
        mom.className = mom.className.replace( 'remove', 'active' );
      }
    }

  }, false );
  
})();