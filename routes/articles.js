const express = require('express');
const router = express.Router();

//Article Model
let Article=require('../models/article');
//User Model
let User = require('../models/user');

//add route
router.get('/add',ensureAuthenticated,function(req,res){
  res.render('add_article',{
    title:'Add article'
  })
})

//Add submit POST route
router.post('/add',function(req,res){
  req.checkBody('title','Title is required').notEmpty();
  //req.checkBody('author','Author is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article',{
      title:'Add Article',
      errors: errors
    })
  }else{
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
        req.flash('success','Article added');
        res.redirect('/');
      }
    });
  }
});

//get edit single article page
router.get('/edit/:id',ensureAuthenticated, function(req,res){
  Article.findById(req.params.id,function(err,article){
    if(article.author != req.user._id){
        req.flash('danger','Not authorised');
        res.redirect('/');
    }else{
      res.render('edit_article',{
        title:'Edit article',
        article:article
    });
    }
  });
});

//Update submit POST route
router.post('/edit/:id',function(req,res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      req.flash('success','Article updated');
      res.redirect('/');
    }
  });
});

//delete article
router.delete('/:id', function(req,res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id,function(err,article){
    if(article.author != req.user._id){
      res.status(500).send();
    }else{
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash('success','deleted successfully');
        res.send('successs');
      })
    }
  })
})

//get single article
router.get('/:id',function(req,res){
  Article.findById(req.params.id,function(err,article){
    User.findById(article.author,function(err,user){
      res.render('article',{
        article:article,
        author:user.name
      });
    });
  });
});

//Access control
function ensureAuthenticated(req, res ,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
}

//to make router accesible outside
module.exports = router;
