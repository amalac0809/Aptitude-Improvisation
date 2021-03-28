const bcrypt = require('bcrypt');

class Router {

    constructor(app,db) {
        this.login(app,db);
        this.logout(app,db);
        this.isLoggedIn(app,db);

    }

    login(app,db) {
        app.post('/login',(req,res) => {
            let username = req.body.username;
            let password = req.body.password;

            username = username.toLowerCase();

            if(username.length > 12 || password.length >12) {
                res.join({
                    success: false,
                    msg: 'An error occured, please try again'
                })
                return;
            }

            let cols = [username];
            db.query('SELECT * FROM user WHERE username = ? LIMIT 1', cols,(err, data,fields) => {

                if(err) {
                    res.json({
                        success: false,
                        msg: 'An error occured, please try again'
                    })
                    return;
                }

                if(data && data.length ===1) {

                    bcrypt.compare(password, data[0].password, (bcryptErr, verified) => {

                        if(verified) {

                            req.session.userID = data[0].id;
                            res.json({
                                success: true,
                                username: data[0].username
                            })
                            return;
                        }
                        else {
                            res.json({
                                success: false,
                                msg: 'Invalid Password'
                            })
                        }

                    });

                }
                else {
                    res.json({
                        success: false,
                        msg: 'User Not found, please try again'
                    })
                }

            });

        });
    }

    logout(app,db) {

        app.post('/logout',(req,res) => {
            if(req.session.userID) {
                req.session.destroy();
                res.json({
                    success: true
                })
                return true;
            }
            else {
                res.json({
                    success: false
                })
                return false;
            }
        });

    }

    isLoggedIn(app,db) {

        app.post('/isLOggedIN',(req,res) => {

            if(req.session.userID) {

                let cols =[req.session.userID];
                db.query('SELECT * FROM user WHERE id= ? LIMIT 1', cols, (err,data,fields) => {

                    if(data && data.length ===1) {
                        res.json({
                            success: true,
                            username: data[0].username
                        })
                        return true;
                    }

                    else {
                        res.json({
                            success: false
                        })
                    }

                });

            }
            else {
                res.json({
                    success: false
                })
            }

    });

}
}
module.exports = Router;