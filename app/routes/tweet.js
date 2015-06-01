// app/routes/tweet.js
module.exports = function(app,tweetRoutes) {

    // used to create, sign, and verify tokens
    var jwt         = require('jsonwebtoken');  //https://npmjs.org/package/node-jsonwebtoken
    var expressJwt  = require('express-jwt'); //https://npmjs.org/package/express-jwt
    var async       = require('async');

    var Tweet       = require('../models/tweet'); // get our mongoose model
    var User        = require('../models/user');
    var Word        = require('../models/word');

    tweetRoutes.get('/dual', function(req, res) {

        Tweet.find(function(err, tweets) {
            if (err)
                res.send(err);

            console.log(tweets);
            res.json(tweets);
        });
    });
    
    // http://localhost:8080/api/users/:username/tweets
    tweetRoutes.route('/users/:username/tweets')

        // get all the tweets
        .get(function(req, res) {
            Tweet.find({user_id: req.user._id}, function(err, tweets) {
                console.log(req.user._id);
                if (err)
                    res.send(err);
                res.json(tweets);
            });
            
        })

        // create a tweet 
        .post(function(req, res) {
            
            var content = req.body.content;
            var scs = true;
            var msg = 'Tweet created!';
            var words = content.split(' '); // separate by space
            words = words.filter(function(value){return value!='';}); // remove extra spaces

            console.log(words);

            size = words.length;
              
            // Array to hold async tasks
            var asyncTasks = [];
             
            // Loop through words
            words.forEach(function(word){
                // We don't actually execute the async action here
                // We add a function containing it to an array of "tasks"
                asyncTasks.push(function(callback){
                    // Call an async function, often a save() to DB
                    Word.findOne({text: word}, function(err, w) {
                        if (err)
                            res.send(err);
                        // if word is found
                        console.log(w);
                        if (w == null){
                            //console.log(msg);
                            scs = false;
                            msg = "Inexistent word(s) in tweet";
                        }
                        callback();
                    });
                });
            });
             
            // At this point, nothing has been executed.
            // We just pushed all the async tasks into an array.
             
            // Then, whe add another task after iterations
            asyncTasks.push(function(callback){
                // Set a timeout for 3 seconds
                if (scs){
                    var tweet = new Tweet(); // creating tweet
                    tweet.user_id = req.user._id;
                    tweet.content = words.join(' ');
                    tweet.date = Date.now();
                    tweet.save(function(err) {
                        if (err)
                            res.send(err);
                    });
                }
                callback();
            });
             
            // Now we have an array of functions doing async tasks
            // Execute all async tasks in the asyncTasks array
            async.series(asyncTasks, function(){
                // All tasks are done now
                res.json({ success: scs, message: msg });
            });
        });

    
    // on routes that end in /users/:username/tweets/:tweet_id
    // ----------------------------------------------------
    tweetRoutes.route('/users/:username/tweets/:tweet_id')

        // get the tweet with that id (accessed at GET http://localhost:8080/api/users/:username/tweets/:tweet_id)
        .get(function(req, res) {
            Tweet.findById(req.params.tweet_id, function(err, tweet) {
                if (err)
                    res.send(err);
                res.json(tweet);
            });
        })
        //*
        // update the tweet with this id (accessed at PUT http://localhost:8080/api/users/:username/tweets/:tweet_id)
        .put(function(req, res) {

            var content = req.body.content;
            var scs = true;
            var msg = 'Tweet updated!';
            var words = content.split(' '); // separate by space
            words = words.filter(function(value){return value!='';}); // remove extra spaces

            console.log(words);

            size = words.length;
              
            // Array to hold async tasks
            var asyncTasks = [];
             
            // Loop through words
            words.forEach(function(word){
                // We don't actually execute the async action here
                // We add a function containing it to an array of "tasks"
                asyncTasks.push(function(callback){
                    // Call an async function, often a save() to DB
                    Word.findOne({text: word}, function(err, w) {
                        if (err)
                            res.send(err);
                        // if word is found
                        console.log(w);
                        if (w == null){
                            //console.log(msg);
                            scs = false;
                            msg = "Inexistent word(s) in tweet";
                        }
                        callback();
                    });
                });
            });
             
            // At this point, nothing has been executed.
            // We just pushed all the async tasks into an array.
            
            // Then, whe add another task after iterations
            asyncTasks.push(function(callback){
                
                if (scs){
                    // finding tweet
                    Tweet.findById(req.params.tweet_id, function(err, tweet) {

                        if (err)
                            res.send(err);
                        tweet.content = words.join(' ');

                        // save the tweet
                        tweet.save(function(err) {
                            if (err)
                                res.send(err);
                        });

                    });
                }
                callback();
            });
             
            // Now we have an array of functions doing async tasks
            // Execute all async tasks in the asyncTasks array
            async.series(asyncTasks, function(){
                // All tasks are done now
                res.json({ success: scs, message: msg });
            });

        })
        //*/

        // delete the tweet with this id (accessed at DELETE http://localhost:8080/api/users/:username/tweets/:tweet_id)
        .delete(function(req, res) {

            Tweet.remove({
                _id: req.params.tweet_id
            }, function(err, tweet) {
                if (err)
                    res.send(err);

                res.json({ message: 'Tweet successfully deleted' });
            });
            
        });
    
    // We are going to protect /api/words routes with JWT
    app.use('/api/dual', expressJwt({secret: app.get('superSecret')}));
    app.use('/api/users/tweets', expressJwt({secret: app.get('superSecret')}));    

}