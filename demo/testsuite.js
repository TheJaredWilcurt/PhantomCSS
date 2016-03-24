/*
    Require and initialise PhantomCSS module
    Paths are relative to CasperJs directory
*/

var fs = require( 'fs' );
var path = fs.absolute( fs.workingDirectory + '/phantomcss.js' );
var phantomcss = require( path );

casper.test.begin( 'Coffee machine visual tests', function ( test ) {

    phantomcss.init( {
        rebase: casper.cli.get( "rebase" ),
        // SlimerJS needs explicit knowledge of this Casper, and lots of absolute paths
        casper: casper,
        rebase: casper.cli.get("rebase"),
        libraryRoot: '.',
        screenshotRoot: './screenshots',
        failedComparisonsRoot: './screenshots/failures',
        comparisonResultRoot: './screenshots/results',
        //cleanupComparisonImages: true,
        addLabelToFailedImage: false,
        addIteratorToImage: false,
        mismatchTolerance: 0.05,
        outputSettings: {
            errorColor: {
                red: 255,
                green: 0,
                blue: 0
            },
            errorType: 'movement',
            transparency: 0.3
        },
        onFail:     function (test) { console.log(test.filename, test.mismatch); },
        onPass:     function (test) { console.log(test.filename); },
        onNewImage: function (test) { console.log(test.filename); },
        onTimeout:  function (test) { console.log(test.filename); },
        onComplete: function (allTests, noOfFails, noOfErrors) {
           allTests.forEach( function (test) {
               if (test.fail) {
                   console.log(test.filename, test.mismatch);
               }
           });
        }
    } );

    casper.on( 'remote.message', function ( msg ) {
        this.echo( msg );
    } )

    casper.on( 'error', function ( err ) {
        this.die( "PhantomJS has errored: " + err );
    } );

    casper.on( 'resource.error', function ( err ) {
        casper.log( 'Resource load error: ' + err, 'warning' );
    } );
    /*
        The test scenario
    */

    casper.start( 'http://localhost:8000' );

    casper.viewport( 1024, 768 );

    casper.then( function () {
        phantomcss.screenshot( '#coffee-machine-wrapper', 'open coffee machine button' );
    } );

    casper.then( function () {
        casper.click( '#coffee-machine-button' );

        // wait for modal to fade-in
        casper.waitForSelector( '#myModal:not([style*="display: none"])',
            function success() {
                phantomcss.screenshot( '#myModal', 'coffee machine dialog' );
            },
            function timeout() {
                casper.test.fail( 'Should see coffee machine' );
            }
        );
    } );

    casper.then( function () {
        casper.click( '#cappuccino-button' );
        phantomcss.screenshot( '#myModal', 'cappuccino success' );
    } );

    casper.then( function () {
        casper.click( '#close' );

        // wait for modal to fade-out
        casper.waitForSelector( '#myModal[style*="display: none"]',
            function success() {
                phantomcss.screenshot( {
                    'Coffee machine close success': {
                        selector: '#coffee-machine-wrapper',
                        ignore: '.selector'
                    },
                    'Coffee machine button success': '#coffee-machine-button'
                } );
            },
            function timeout() {
                casper.test.fail( 'Should be able to walk away from the coffee machine' );
            }
        );
    } );

    casper.then( function now_check_the_screenshots() {
        // compare screenshots
        phantomcss.compareAll();
    } );

    /*
    Casper runs tests
    */
    casper.run( function () {
        console.log( '\nTHE END.' );
        // phantomcss.getExitStatus() // pass or fail?
        casper.test.done();
    } );
} );
