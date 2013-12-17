var accesser = function( firebaseInst ) {
    console.log('accesser init');
    this.firebaseInst    = firebaseInst;
    this.userData        = null;
};


accesser.prototype.getUser = function ( ) {
    console.log('accesser getUser');
    return this.userData;
}


accesser.prototype.authLogin = function ( error, user, callBackSuccess, callBackFail, callBackLogout ) {
    console.log('accesser callback');

    if ( (error !== 'null') && (this.userData !== 'null') ) {
        if (error) {
            // an error occurred while attempting login
            console.log('accesser callback - auth error %o', error);
            this.userData      = null;
            callBackFail( error );
            
        } else if (user) {
            // user authenticated with Firebase
            console.log('accesser callback - auth success - user %o', user);
            console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
            
            this.userData      = user;
            callBackSuccess( user );
            
            //accessToken - The Facebook access token (string).
            //displayName - The user's display name (string).
            //firebaseAuthToken - The Firebase authentication token for this session (string).
            //id - The user's Facebook id (string).
            //provider - The authentication method used, in this case: 'facebook' (string).
            //thirdPartyUserData - User account data returned by Facebook (object).
            //uid - A unique id combining the provider and uid, intended as the unique key for user data (string).
    
        } else {
            console.log('accesser callback - auth logged out');
            // user is logged out
            this.userData      = null;
            callBackLogout( );
    
        }
    } else {
        console.log('accesser callback - already logged in - userdata %o error %o user %o', this.userData, error, user);
        // already logged in
    }
};


accesser.prototype.login  = function ( provider, callBackSuccess, callBackFail, callBackLogout ) {
    this.prepare( callBackSuccess, callBackFail, callBackLogout );
    this.commit(  provider );
};


accesser.prototype.prepare  = function ( callBackSuccess, callBackFail, callBackLogout ) {
    console.log('accesser login');
    var self = this;
    
    if ( this.firebaseInst ) {
        this.auth            = new FirebaseSimpleLogin(this.firebaseInst, function ( error, user ) { self.authLogin(error, user, callBackSuccess, callBackFail, callBackLogout ); } );
    
        console.log( 'accesser login - loggin in - auth %o', this.auth );
    }
};


accesser.prototype.commit  = function ( provider ) {
    if ( this.firebaseInst && this.auth ) {
        if ( provider == 'facebook' ) {
            this.auth.login(provider, {
                rememberMe: true,
                scope: 'email'
            });
            
        } else {
            this.auth.login(provider, {
                rememberMe: true
            });
        }
    }
};


accesser.prototype.logout = function ( ) {
    console.log('accesser logout');
    if ( this.auth ) {
        console.log('accesser logout - logging out');
        this.auth.logout();
        this.auth          = null;
        this.userData      = null;
    }
};
