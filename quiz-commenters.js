(function() { // begin immediately-invoked function expression
    document.addEventListener('DOMContentLoaded', function(){

        var parseQuiz = function ( str ) {
            try {
                return JSON.parse( decodeURIComponent( str || '' ) );
            } catch ( err ) {
                return [];
            }
        };

        var buildAnswer = function (text, name, value) {
            var label = document.createElement( 'label' );
            label.className = 'answer';
            var input = label.appendChild( document.createElement( 'input' ) );
            var title = label.appendChild( document.createTextNode( text ) );

            input.type = 'radio';
            input.name = name;
            input.value = value;
            return label;
        };
      
        var buildQuiz = function(quizNode){
            var formNode = quizNode.parentNode;
            var errorText = quizNode.getAttribute( 'data-quizcommenters-error' );
            var correctText = quizNode.getAttribute( 'data-quizcommenters-correct' );
            var questions = parseQuiz( quizNode.getAttribute( 'data-quizcommenters' ) );
            var correctId = 'quizcommenters' + location.pathname + questions.map( function( q ) {
                return q.correct;
            } ).join( '' );
            var errorNode = document.createElement( 'p' ).appendChild( document.createTextNode( errorText ) ).parentNode;
            errorNode.className = 'error';
            var correctNode = document.createElement( 'p' ).appendChild( document.createTextNode( correctText ) ).parentNode;
            correctNode.className = 'correct';
            var container = document.createElement( 'div' );
        
            // Skip quiz if already solved
            if ( localStorage.getItem( correctId ) === correctId ) {
                return quizNode.parentNode.removeChild( quizNode );
            }

            questions.forEach( function( question, index ) {
                container.appendChild( document.createElement( 'h2' ) ).textContent = question.text;
                question.answer
                    .map( function( key, val ) {
                        return key && buildAnswer( key, 'quizcommenters' + index, val )
                    } ).sort( function() {
                        return 0.5 - Math.random();
                    } ).forEach( function( node ) {
                        node && container.appendChild(node)
                    } );
            } );

            // Disable form textareas until quiz is answered correctly.
            var el;
            formNode.querySelectorAll( 'textarea' ).forEach( function ( el ) {
                el.setAttribute( 'disabled', 'disabled' );
            } );

            quizNode.appendChild( container );
            quizNode.addEventListener( 'change', function() {
                var checked = questions.map( function( q, i ) {
                    return container.querySelector( 'input[name="quizcommenters' + i + '"]:checked');
                } );
                var correct = questions.every( function( q, i ) {
                    return checked[i] && Number( checked[i].value ) === Number( q.correct );
                } );
                var failure = ! correct && checked.filter( Boolean ).length === questions.length;

                if ( correct ) {
                    if ( el = quizNode.querySelector( '.error' ) ) {
                        el.parentNode.removeChild( el );
                    }
                    localStorage.setItem( correctId, correctId );
                    container.appendChild( correctNode );
                    formNode.querySelectorAll( 'textarea' ).forEach( function ( el ) {
                        el.removeAttribute( 'disabled' );
                    } );
                } else if ( failure ) {
                    if ( el = quizNode.querySelector( '.correct' ) ) {
                        el.parentNode.removeChild( el );
                    }
                    container.appendChild( errorNode );
                }
            } );
        };
      
        [].forEach.call( document.querySelectorAll( '.quizcommenters' ), buildQuiz );

    });
})(); // end IIFE
