var urlBase       = 'fundo';
var url           = 'https://'+urlBase+'.firebaseio.com';
var FUbase        = url;
var FDbase        = new Firebase( FUbase );
var access        = new accesser(FDbase);



function initController ( $scope, angularFire, $state ) {
    console.log( 'init SCOPE %o ANGULAR %o STATE %o', $scope, angularFire, $state );
    console.log( 'init ACCESS %o', $scope.access );

    
    var onSuccess = function ( user ) {
        console.log( 'initController success' );
        
        $scope.$apply( function() { $scope.setPage( 'game' ); } );
        
        console.log( 'initController success called game' );
    };

    
    var onFailure = function ( user ) {
        console.log('initController failed to login');
        
        $scope.$apply( function() { $scope.setPage( 'init' ); } );
        
        console.log('initController failed to login called init');
    };

    
    var onLogout   = function ( ) {
        console.log('initController logout');
        
        $scope.$apply( function() { $scope.setPage( 'init' ); } );
        
        console.log('initController logout called init');
    };



    $scope.login = function ( provider ) {
        $scope.access.commit( provider );
    };
    
    $scope.access.prepare( onSuccess, onFailure, onLogout );
}


function gameController ( $scope, angularFire, $state ) {
    $scope.url           = url;
    $scope.versionString = versionString;

    console.log( 'game ACCESS %o', $scope.access );
    

    $scope.logout = function () {
        $scope.access.logout();
    };
    
    $scope.user          = $scope.access.getUser();

    if ( ! $scope.user ) {
        console.log( 'game no user' );
        //$scope.$apply( function() { $scope.setPage( 'init' ); } );
        $scope.setPage('init');

        return;
    }
    
    console.log( 'game has user %o', $scope.user );
    

    var FUboard          = url + '/board';
    var FDboard          = new Firebase( FUboard );
    
    var FUsetup          = url + '/setup';
    var FDsetup          = new Firebase( FUsetup );


    angularFire( FDboard, $scope, 'board' ).then( function(){
        console.log('FDboard %o', $scope.board );
    });

    angularFire( FDsetup, $scope, 'setup' ).then( function(){
        console.log('FDsetup %o', $scope.setup );
        $scope.setup = $scope.setup;
        $scope.size  = $scope.setup.width * $scope.setup.height;
    });

    //var FUuser = url + '/user';
    //var FDuser = new Firebase( FUuser );
    //angularFire( FDuser, $scope, 'user' ).then( function(){
        //console.log('FDuser ' + $scope.user );
        //$scope.user = user;
        //$scope.ctrl.run();
    //});

    
    
    $scope.shipsOpts  = [
        { name: 'boat'     , size: 1, imgStart:  1 },
        { name: 'fragate'  , size: 4, imgStart:  2 },
        { name: 'submarine', size: 4, imgStart:  6 },
        { name: 'destroyer', size: 5, imgStart: 10 },
        { name: 'carrier'  , size: 7, imgStart: 15 }
    ];
    
    
    $scope.shipsSizes  = {};
    for ( var s = 0; s < $scope.shipsOpts.length; s++ ) {
        $scope.shipsSizes[ $scope.shipsOpts[s].name ] = $scope.shipsOpts[s].size;
    }
    
    $scope.ships       = $scope.shipsOpts[0];
    
    $scope.orientation = true;
    


    $scope.getClasses = function ( col       ) {
        if ( $scope.user.uid == col.user ) {
            return 'state-'+col.status+' ship-'+col.shipPos+' ori-'+col.shipOrientation;
        } else {
            return 'state-0 ship-0 ori-true';
        }
    };
    

    $scope.addShip    = function ( x, y      ) {
        var shipName  = $scope.ships.name;
        var shipSize  = $scope.ships.size;
        var shipIndex = $scope.ships.imgStart;
        var shipOri   = $scope.orientation;
        
        var pStart    = $scope.orientation ? y : x;
        var pEnd      = pStart + shipSize; // todo: check border
        
        //console.log( 'adding ship %s size %d orientation %s X %d Y %d S %d E %d', shipName, shipSize, shipOri, x, y, pStart, pEnd );
        
        
        if ( $scope.orientation ) {
            if ( pEnd > $scope.setup.width ) {
                console.log( ' too close to border pEnd %d > width %d', pEnd, $scope.setup.width );
                $scope.result = 'too close to border';
                return;
            }
        } else {
            if ( pEnd > $scope.setup.height ) {
                console.log( ' too close to border pEnd %d > height %d', pEnd, $scope.setup.height);
                $scope.result = 'too close to border';
                return;
            }
        }
        
        
        for ( var p = pStart; p < pEnd; p++ ) {
            if ( $scope.orientation ) { // horiz
                if ( $scope.board[ x ][ p ][ 'status' ] != 0 ) {
                    console.log( ' already used x %d y %d', x, p);
                    $scope.result = 'already taken';
                    return;
                }
                
            } else {
                if ( $scope.board[ p ][ y ][ 'status' ] != 0 ) {
                    console.log( ' already used x %d y %d', p, y);
                    $scope.result = 'already taken';
                    return;
                }
            }
        }

        
        var shipPos = 0;
        for ( var p = pStart; p < pEnd; p++ ) {
            //console.log( '  p %d', p);
            
            var nX     = p;
            var nY     = y;
            
            if ( $scope.orientation ) { // horiz
                nX     = x;
                nY     = p;
            }
            
            //console.log( '    X %d Y %s', nX, nY );
            
            $scope.board[ nX ][ nY ].status          = 1;
            $scope.board[ nX ][ nY ].user            = $scope.user.uid;
            $scope.board[ nX ][ nY ].shipName        = shipName;
            $scope.board[ nX ][ nY ].shipPos         = shipIndex + shipPos;
            $scope.board[ nX ][ nY ].shipOrientation = $scope.orientation;
            $scope.board[ nX ][ nY ].shipZero        = [x, y];
            
            shipPos += 1;
        }
    };
    

    $scope.updateCell = function ( x, y, col ) {
        //console.log('updating x %d y %d cell %o', x, y, col );
        //state-0 { /* sea */
        //state-1 { /* used */
        //state-2 { /* hit */
        //state-3 { /* sunk */
        //
        //
        //
        //td.ship-0{ /* transparent */
        //
        //td.ship-1{ /* boat */
        //
        //td.ship-2{ /* fragate */
        //td.ship-3{ /* fragate */
        //td.ship-4{ /* fragate */
        //td.ship-5{ /* fragate */
        //
        //td.ship-6{ /* submarine */
        //td.ship-7{ /* submarine */
        //td.ship-8{ /* submarine */
        //td.ship-9{ /* submarine */
        //
        //td.ship-10{ /* destroyer */
        //td.ship-11{ /* destroyer */
        //td.ship-12{ /* destroyer */
        //td.ship-13{ /* destroyer */
        //td.ship-14{ /* destroyer */
        //
        //td.ship-15{ /* carrier */
        //td.ship-16{ /* carrier */
        //td.ship-17{ /* carrier */
        //td.ship-18{ /* carrier */
        //td.ship-19{ /* carrier */
        //td.ship-20{ /* carrier */
        //td.ship-21{ /* carrier */

        
        var adding    = $scope.adding;
        //console.log( 'scope %o', $scope );
        console.log( 'colStatus %o adding %s', col['status'], adding );
        
        
        if ( col['status'] == 0 ) { // sea
            if ( adding ) {
                $scope.result = 'adding';
                $scope.addShip(x, y);
            
            } else {
                $scope.result = 'water';
            }
            
        } else
        if ( col['status'] == 1 ) { // used
            var zero             = col.shipZero;
            var shipName         = col.shipName;
            var shipUser         = col.user;
            
            var zX               = zero[0];
            var zY               = zero[1];
            var shipZ            = $scope.board[ zX ][ zY ];
            var shipSize         = $scope.shipsSizes[ shipName ];

            col.status           = 2; //hit
            col.shipPos          = 0; //transparent
            shipZ.shipHits      += 1;
            
            console.log( 'hit ship %s size %d hits %d', shipName, shipSize, shipZ.shipHits);
            
            if ( shipZ.shipHits == shipSize ) {
                $scope.result = 'you\'ve blown a '+shipName+' from '+shipUser+'!!';
                console.log( 'you\'ve blown a '+shipName+' from '+shipUser+'!!' );

                var shipOri   = shipZ.shipOrientation;
                var pStart    = shipOri ? zY : zX;
                var pEnd      = pStart  + shipSize - 1; // todo: check border
                
                for ( var p = pEnd; p >= pStart; p-- ) {
                    console.log( '  p %d', p);
                    
                    var nX     = p;
                    var nY     = zY;
                    
                    if ( shipOri ) { // horiz
                        nX     = zX;
                        nY     = p;
                    }
                    
                    console.log( '    X %d Y %s', nX, nY );
                    
                    $scope.board[ nX ][ nY ].status           = 0;
                    $scope.board[ nX ][ nY ].user             = '';
                    $scope.board[ nX ][ nY ].shipHits         = 0;
                    $scope.board[ nX ][ nY ].shipName         = '';
                    $scope.board[ nX ][ nY ].shipPos          = 0;
                    $scope.board[ nX ][ nY ].shipOrientation  = true;
                    $scope.board[ nX ][ nY ].shipZero         = [-1, -1];
                }
            } else {
                $scope.result = 'hit!';
            }
        }
    };
};





function bodyController ( $scope, angularFire, $state ) {
    $scope.url           = url;
    $scope.versionString = versionString;
    $scope.access        = access;
    console.log( 'bodyController');
    

    $scope.setPage       = function ( page ) {
        console.log( 'bodyController SET PAGE %s scope %o state %o', page, $scope, $state );
        $state.transitionTo( page );
    };    
    
    console.log( 'bodyController going to init');
    $scope.setPage( 'init' );
    console.log( 'bodyController went to init');
}


//var controllers = {};
//    controllers.initController = initController;
//    controllers.gameController = gameController;
//    controllers.bodyController = bodyController;




var demoApp = angular.module( "myModule", ['firebase', 'ui.router'] ); //, 'ngRoute'

demoApp.config(['$stateProvider', function ($stateProvider) {
        var home = {
            name       : 'home',
            url        : '/',
            controller : bodyController,
            templateUrl: 'home.html'
        };
        
        var init = {
            name       : 'init',
            url        : '/init',
            parent     : home,
            controller : initController,
            templateUrl: 'init.html'
        };
            
        var game = {
            name       : 'game',
            url        : '/game',
            parent     : home,
            controller : gameController,
            templateUrl: 'game.html'
        };
    
        $stateProvider.state( home   );
        $stateProvider.state( init   );
        $stateProvider.state( game   );
    }])

    .run(['$state', function ($state) {
        $state.transitionTo( 'home' ); 
    }]);




    //.controller( controllers );

    
//demoApp.config(
//                function ($routeProvider) {
//                    $routeProvider
//                        .when('/init', {
//                            templateUrl: 'init.html',
//                            controller: 'initController',
//                            view: 'body'
//                        })
//                        .when('/game', {
//                            templateUrl: 'game.html',
//                            controller: 'gameController',
//                            view: 'body'
//                        })
//                        .otherwise({
//                            redirectTo: '/init',
//                            view: 'body'
//                        })
//                }
//);


