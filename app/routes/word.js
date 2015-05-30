// app/routes/word.js
module.exports = function(app,wordRoutes) {

    // used to create, sign, and verify tokens
    var jwt         = require('jsonwebtoken');  //https://npmjs.org/package/node-jsonwebtoken
    var expressJwt  = require('express-jwt'); //https://npmjs.org/package/express-jwt

    var Word        = require('../models/word'); // get our mongoose model


    // http://localhost:8080/api/words
    wordRoutes.route('/words')

        // get all the words (accessed at GET http://localhost:8080/api/words)
        .get(function(req, res) {
            Word.find(function(err, words) {
                if (err)
                    res.send(err);

                res.json(words);
            });
            
        })

        // create a word (accessed at POST http://localhost:8080/api/words)
        .post(function(req, res) {
            console.log('I\'m starting to create a new word');
            var word = new Word();
            console.log("I created the object");
            word.text = req.body.text;
            word.feeling = req.body.feeling;
            word.enabled = true;
            word.last_user_id = null;
            word.word_type = req.body.word_type;
            console.log("apparently, I did it");
            console.log(word.text,word.feeling,word.word_type);

            // save the word and check for errors
            word.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Word created!' });
            });
        });


    // on routes that end in /words/:word_text
    // ----------------------------------------------------
    wordRoutes.route('/words/:word_text')

        // get the word with that id (accessed at GET http://localhost:8080/api/word/:word_text)
        .get(function(req, res) {
            Word.findOne({text: req.params.word_text}, function(err, word) {
                if (err)
                    res.send(err);
                res.json(word);
            });
        })

        // update the word with this id (accessed at PUT http://localhost:8080/api/word/:word_text)
        .put(function(req, res) {

            // use our word model to find the word we want
            Word.findOne({text: req.params.word_text}, function(err, word) {

                if (err)
                    res.send(err);

                //word.text = req.body.text;
                word.feeling = req.body.feeling;
                word.enabled = req.body.enabled;
                word.last_user_id = req.user._id;
                console.log(word.text,word.feeling,word.word_type);

                // save the word
                word.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Word updated!' });
                });

            });
        })

        // delete the word with this id (accessed at DELETE http://localhost:8080/api/word/:word_text)
        .delete(function(req, res) {
            Word.remove({
                text: req.params.word_text
                //_id: req.params.word_id
            }, function(err, word) {
                if (err)
                    res.send(err);

                res.json({ message: 'Word successfully deleted' });
            });
        });
    
    // We are going to protect /api/words routes with JWT
    app.use('/api/words', expressJwt({secret: app.get('superSecret')}));

}