var versionString = 'v2013_12_17_19_41';
var urlBase       = 'fundo';
var url           = 'https://'+urlBase+'.firebaseio.com';
var FUbase        = url;
var FDbase        = new Firebase( FUbase );
var access        = new accesser( FDbase );






function bodyController ( $scope, $state ) {
    $scope.url           = url;
    $scope.versionString = versionString;
    $scope.access        = access;
    console.log( 'bodyController');
    

    $scope.setPage       = function ( page ) {
        console.log( 'bodyController SET PAGE %s scope %o state %o', page, $scope, $state );
        
        $scope.gotoPage( page );
        
        //try {
        //    $scope.$apply( function() { $scope.gotoPage( page ); } );
        //} catch(e) {
        //    alert(e);
        //}
    };
    
    $scope.gotoPage       = function ( page ) {
        $state.transitionTo( page );
    }
    

    $scope.setPage( 'init' );

    

    
    var onSuccess = function ( user ) {
        console.log( 'initController success' );
        
        $scope.setPage( 'game' );
        
        console.log( 'initController success called game' );
    };

    
    var onFailure = function ( user ) {
        console.log('initController failed to login');
        
        $scope.setPage( 'init' );
        
        console.log('initController failed to login called init');
    };

    
    var onLogout   = function ( ) {
        console.log('initController logout');
        
        $scope.setPage( 'init' );
        
        console.log('initController logout called init');
    };


    $scope.login = function ( provider ) {
        $scope.access.commit( provider );
    };

    
    $scope.access.prepare( onSuccess, onFailure, onLogout );

    
    console.log( 'bodyController going to init');
    console.log( 'bodyController went to init');
}


function initController ( $scope, $state ) {
    console.log( 'init SCOPE %o STATE %o', $scope, $state );
    console.log( 'init ACCESS %o', $scope.access );

    $scope.providers = $scope.access.providers;
    
    $scope.loginIndex = function ( index ) {
        var provider = $scope.providers[index];
        if ( provider[1] ) {
            $scope.login( provider[0] );
        }
    };
}


function gameController ( $scope, $state, gameDB ) {
    $scope.url           = url;
    $scope.versionString = versionString;
    
    $scope.game          = gameDB;
    console.log( 'gameDB %o', gameDB );
    
    console.log( 'game ACCESS %o', $scope.access );
    
    
    $scope.logout = function () {
        $scope.access.logout();
    };
    
    $scope.user          = $scope.access.getUser();

    if ( ! $scope.user ) {
        console.log( 'game no user' );
        $scope.setPage('init');

        return;
    }
    
    console.log( 'game has user %o', $scope.user );
    
    
    $scope.updateShipSizes = function() {
        $scope.shipsSizes  = {};
        console.log("shipsOpts %o", $scope.shipsOpts);
        
        for ( var s = 0; s < $scope.shipsOpts.length; s++ ) {
            $scope.shipsSizes[ $scope.shipsOpts[s].name ] = $scope.game.setup.shipsOpts[s].size;
        }
        
        $scope.ships       = $scope.shipsOpts[0];

        //$scope.game.setup.shipsOpts.on('changed', function(s) {
        //    $scope.updateShipSizes();
        //});
    };
    

    $scope.getClasses = function ( col       ) {
        if ( $scope.user.uid == col.user ) {
            return 'state-'+col.status+' ship-'+col.shipPos+' ori-'+col.shipOrientation;
        } else {
            if ( col.status != 1 ) {
                return 'state-'+col.status+' ship-0 ori-true';
            } else {
                return 'state-0 ship-0 ori-true';
            }
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
            if ( pEnd > $scope.game.setup.width ) {
                console.log( ' too close to border pEnd %d > width %d', pEnd, $scope.game.setup.width );
                $scope.result = 'too close to border';
                return;
            }
        } else {
            if ( pEnd > $scope.game.setup.height ) {
                console.log( ' too close to border pEnd %d > height %d', pEnd, $scope.game.setup.height);
                $scope.result = 'too close to border';
                return;
            }
        }
        
        
        for ( var p = pStart; p < pEnd; p++ ) {
            if ( $scope.orientation ) { // horiz
                if ( $scope.game.board[ x ][ p ][ 'status' ] != 0 ) {
                    console.log( ' already used x %d y %d', x, p);
                    $scope.result = 'already taken';
                    return;
                }
                
            } else {
                if ( $scope.game.board[ p ][ y ][ 'status' ] != 0 ) {
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
            
            $scope.updateRegister ( $scope.game.board[ nX ][ nY ], {
                status         : 1,
                user           : $scope.user.uid,
                shipName       : shipName,
                shipPos        : shipIndex + shipPos,
                shipOrientation: $scope.orientation,
                shipZero       : [x, y]
            } );
            //$scope.game.board[ nX ][ nY ].status          = 1;
            //$scope.game.board[ nX ][ nY ].user            = $scope.user.uid;
            //$scope.game.board[ nX ][ nY ].shipName        = shipName;
            //$scope.game.board[ nX ][ nY ].shipPos         = shipIndex + shipPos;
            //$scope.game.board[ nX ][ nY ].shipOrientation = $scope.orientation;
            //$scope.game.board[ nX ][ nY ].shipZero        = [x, y];
            
            shipPos += 1;
        }
    };
    

    $scope.updateCell = function ( x, y, col ) {
        //console.log('updating x %d y %d cell %o', x, y, col );
        
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
            var shipZ            = $scope.game.board[ zX ][ zY ];
            var shipSize         = $scope.shipsSizes[ shipName ];

      
            if ( shipUser == $scope.user.uid ) {
                return;
            }
            
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
                    
                    $scope.game.board[ nX ][ nY ] = $scope.getNewRegister();
                    
                    $scope.updateLeaderBoard( $scope.user.uid, shipUser, shipName, shipSize );

                    //$scope.game.board[ nX ][ nY ].status           = 0;
                    //$scope.game.board[ nX ][ nY ].user             = '';
                    //$scope.game.board[ nX ][ nY ].shipHits         = 0;
                    //$scope.game.board[ nX ][ nY ].shipName         = '';
                    //$scope.game.board[ nX ][ nY ].shipPos          = 0;
                    //$scope.game.board[ nX ][ nY ].shipOrientation  = true;
                    //$scope.game.board[ nX ][ nY ].shipZero         = [-1, -1];
                }
            } else {
                $scope.result = 'hit!';
            }
        }
    };
    

    $scope.updateLeaderBoard = function ( winner, looser, shipName, shipSize ) {
        console.log('updating leaderboard. winner %s looser %s ship name %s size %d', winner, looser, shipName, shipSize);
        var leader = $scope.game.child( 'leader' );
        leader[ winner ][ 'won'   ][ shipName ] += 1;
        leader[ looser ][ 'lost'  ][ shipName ] += 1;
        leader[ winner ][ 'score' ]             += shipSize;
        leader[ looser ][ 'score' ]             -= shipSize;
    };


    $scope.start = function() {
        console.log( 'game loaded. game %o setup %o ships %o', $scope.game, $scope.game.setup, $scope.game.setup.shipsOpts );
        $scope.game.setup.$on('loaded', function(data) {
            var s   = $scope.game.setup;
            var so  = s.$child('shipsOpts');
            var soc = so.$child('0');
            soc.name = 'bboat';
            console.log(s   );
            console.log(so  );
            console.log(soc );
            $scope.game.setup.$save();
        });
        
        $scope.game.setup.$child('shipsOpts').$on('loaded', function() {
            console.log('loaded ships');
            console.log(chd);
            chd.$bind($scope, 'shipsOpts').then( function(){
                console.log('bounded ships');
                console.log($scope.shipsOpts);
            });
        });
        
        //$scope.game.setup.$bind($scope, 'setup').then( function(unbind) { console.log('bount. setup %o ships %o', $scope.setup, $scope.setup.shipsOpts) } );
        //$scope.game.setup.$bind($scope, 'setup').then( function(unbind) { console.log('bount. setup %o ships %o', $scope.setup, $scope.setup.shipsOpts) } );
    };

    $scope.orientation = true;

    $scope.game.$connect( $scope, $scope.start );
};










function setupController ( $scope, $state, gameDB ) {
    console.log( 'setupController' );
    $scope.game  = gameDB;    
    
    $scope.apply = function() {
        console.log('apply start');
        prevWidth  = $scope.game.setup.width;
        prevHeight = $scope.game.setup.height;
        prevShips  = $scope.game.setup.shipsOpts;

        $scope.game.setup.width     = $scope.currWidth;
        $scope.game.setup.height    = $scope.currHeight;
        $scope.game.setup.shipsOpts = $scope.currShips;
        
        $scope.game.leader          = {};
        
        if ( prevHeight != $scope.currHeight || prevWidth != $scope.currWidth || prevShips != $scope.currShips) {
            $scope.reset();
        }
        console.log('apply end');
    };
    
    
    $scope.reset = function() {
        console.log('reset start');
        console.log('reset zeroing');
        FDbase.child('board').setWithPriority(null, 1, function() {
            console.log('reset zeroed');
            $scope.initBoard();
            $scope.cleanBoard();
        });
        console.log('reset end');
    };  

    
    $scope.initBoard = function( ) {
        console.log('initBoard start');
        
        for ( var x = 0; x < $scope.game.setup.height; x++ ) {
            
            for ( var y = 0; y < $scope.game.setup.width; y++ ) {
                var coord = 'board/' + x + '/' + y;
                //FDbase.child( coord ).set( "" );
                $scope.game.board.$child(coord) = "";
            }
        }
    }
    
    
    $scope.cleanBoard = function() {
        console.log('cleanBoard start');
        
        for ( var x = 0; x < $scope.game.setup.height; x++ ) {
            
            for ( var y = 0; y < $scope.game.setup.width; y++ ) {
                var vars  = $scope.getNewRegister();
                var coord = 'board/' + x + '/' + y;
                //FDbase.child( coord ).set( vars );
                $scope.game.board.$child(coord) = vars;
            }
        }
        
        console.log('cleanBoard end');
    };  


    $scope.resetForm = function() {
        $scope.setPage('setup');
    };

    
    $scope.newShip = function() {
        console.log( 'newShip' );
        $scope.game.setup.shipsOpts.push( { name: ''     , size: 1, imgStart:  1 } );
    };

    
    $scope.deleteShip = function( index ) {
        console.log( 'deleteShip %d', index );
        $scope.game.setup.shipsOpts.splice( index, 1 );
    };

    
    $scope.resetShips = function() {
        console.log( 'resetShips' );
        $scope.game.setup.shipsOpts = [
            { name: 'boat'     , size: 1, imgStart:  1 },
            { name: 'fragate'  , size: 4, imgStart:  2 },
            { name: 'submarine', size: 4, imgStart:  6 },
            { name: 'destroyer', size: 5, imgStart: 10 },
            { name: 'carrier'  , size: 7, imgStart: 15 }
        ];
    };


    $scope.getNewRegister  = function ( ) {
        return {
            'status'         :          0,
            'user'           :         -1,
            'shipHits'       :          0,
            'shipName'       :         '',
            'shipPos'        :          0,
            'shipOrientation':       true,
            'shipZero'       :   [-1, -1],
        };
    
        //$scope.game.board[ nX ][ nY ].status           = 0;
        //$scope.game.board[ nX ][ nY ].user             = '';
        //$scope.game.board[ nX ][ nY ].shipHits         = 0;
        //$scope.game.board[ nX ][ nY ].shipName         = '';
        //$scope.game.board[ nX ][ nY ].shipPos          = 0;
        //$scope.game.board[ nX ][ nY ].shipOrientation  = true;
        //$scope.game.board[ nX ][ nY ].shipZero         = [-1, -1];
    };

    
    $scope.updateRegister = function ( obj, vars ) {
        for ( var key  in vars ) {
            var val = vars[ key ];
            obj[ key ] = val;
        };
    };

    
    console.log( 'finished' );
}






var demoApp = angular.module( "myModule", ['firebase', 'ui.router'] ); //, 'ngRoute'


demoApp.config(['$stateProvider', function ($stateProvider) {
    var home = {
        name       : 'home',
        url        : '/',
        controller : bodyController,
        templateUrl: 'partials/home.html'
    };
    $stateProvider.state( home   );
    
    var init = {
        name       : 'init',
        url        : '/init',
        parent     : home,
        controller : initController,
        templateUrl: 'partials/init.html'
    };
    $stateProvider.state( init   );
        
    var game = {
        name       : 'game',
        url        : '/game',
        parent     : home,
        controller : gameController,
        templateUrl: 'partials/game.html'
    };
    $stateProvider.state( game   );
    
    var setup = {
        name       : 'setup',
        url        : '/setup',
        parent     : home,
        controller : setupController,
        templateUrl: 'partials/setup.html'
    };
    $stateProvider.state( setup  );
}])


.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
})



.factory('gameDB', function($rootScope, $firebase) {
    console.log("FACTORY GAME");
    
    var game        = function( keys ) {
        var self   = this;
        self.$keys = keys;
    };


    game.prototype.$loadedNum = 0;
    game.prototype.$boundNum  = 0;

    game.prototype.$loaded    = function () { this.$loadedNum += 1; if ( this.$loadedNum == this.$keys.length ) { this.$bind();    }; };
    game.prototype.$bound     = function () { this.$boundNum  += 1; if ( this.$boundNum  == this.$keys.length ) { this.$callback(); }; };


    game.prototype.$connect = function ( $scope, callback, bind ) {
        var self       = this;
        self.$scope    = $scope;
        self.$callback = callback;
        self.$doBind   = bind ? true : false;
        
        for ( var k = 0; k < self.$keys.length; k++ ) {
            var key = self.$keys[k];
            console.log('adding key %s', key);

            var fb = $firebase( FDbase.child( key ) );

            fb.$on( 'loaded', self.$load(key, fb) );
        }
    };
    
    game.prototype.$bind      = function ( ) {
        var self = this;
        
        function unb ($scope, key) {
            return function( unbind ) {
                console.log('key %s bound %o', key, $scope[key]);
                //$scope[ key ].$unbind = unbind;
                self.$bound();
            };
        }
        
        for ( var k = 0; k < self.$keys.length; k++ ) {
            var key = self.$keys[k];
            console.log('binding key %s %o', key, self[ key ]);
            if ( self.$doBind ) {
                self[ key ].$bind( self.$scope, key ).then( unb(self.$scope, key) );
            } else {
                self.$bound();
            }
        }
    };
    
    
    game.prototype.$load = function(key, fb) {
        var self = this;
        
        return function( unbind ) {
            console.log('key %s loaded. fb %o', key, fb);
            
            fb.$unbind  = unbind;
            
            self[ key ] = fb;
            
            self.$loaded();
        };
    };


    var db = new game( ['board', 'setup'] );
    
    return db;
    

    //setup: $firebase( FDbase.child('setup') ).$bind( $scope, 'setup' )
    
    //$scope.data.board.$bind($scope.game, 'board')
    //$scope.data.setup.$bind($scope.game, 'setup')
    
    //$scope.data.$on("loaded", function ( ) {
        //console.log('data       %o', $scope.data );
        //console.log('data.setup %o', $scope.data.setup );
        //$scope.data.$bind($scope, 'game').then(function(unbind) {
            //$scope.game.unbind = unbind;
            //console.log('game       %o', $scope.game );
            //console.log('game.setup %o', $scope.game.setup );
            //console.log('game.setup %o', $scope.game.setup );
        //});
    //});
    
    //angularFire( FDbase.child('board'), $scope, 'game.board' );
    //angularFire( FDbase.child('setup'), $scope, 'game.setup' );
    //$scope.game.$on("loaded", function ( ) {
    //    $scope.currWidth  = $scope.game.setup.width;
    //    $scope.currHeight = $scope.game.setup.height;
    //    $scope.currShips  = $scope.game.setup.shipsOpts;
    //});
    //console.log( $scope.data.board );
    //console.log( $scope.data.setup );


    //console.log( $firebase );
})


.run(['$state', function ($state) {
    $state.transitionTo( 'home' ); 
}]);

