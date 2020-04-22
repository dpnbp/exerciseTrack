var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
app.use(express.json());
app.use(express.static('public'));
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 4077);

app.get('/', function(req,res,next){
  var context = {};

  mysql.pool.query("SELECT *, DATE_FORMAT(date, '%m-%d-%Y') as date FROM workouts", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = rows;
    res.render('home', context);
  });
});

app.post('/', function(req,res,next){
  var context = {};
  var insertResponse = "";
  if(req.body.name){
    var dateElements = req.body.date.split('-');
    var dateFormatted = dateElements[2] + "-" + dateElements[0] + "-" + dateElements[1];
    mysql.pool.query("INSERT INTO workouts(name, reps, weight, date, lbs) VALUES (?, ?, ?, ?, ?)", [req.body.name, req.body.reps, req.body.weight, dateFormatted, req.body.lbs], function(err, result){
      if(err){
        next(err);
        return;
      }
      context.newMsg = "Inserted id " + result.insertId + ": " + req.body.name;
      
      mysql.pool.query("SELECT *, DATE_FORMAT(date, '%m-%d-%Y') as date FROM workouts", function(err, rows, fields){
        if(err){
          next(err);
          return;
        }
        context.results = rows;
        insertResponse = JSON.stringify(context);
        res.type('plain/text')
        res.send(insertResponse);
      });
    });
  } else {
    context.newMsg = "Adding exercise failed - no name value provided";
    insertResponse = JSON.stringify(context);
    res.type('plain/text')
    res.send(insertResponse);
  }
});

app.delete('/',function(req,res,next){
  var context = {};
  var deleteResponse = "";
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    console.log("Deleted ID " + req.body.id);
    context.newMsg = "Deleted " + result.affectedRows + " rows.";
    context.delRowId = req.body.id;
    deleteResponse = JSON.stringify(context);
    res.type('plain/text')
    res.send(deleteResponse);
  });
});

app.patch('/', function(req, res, next){
  var context = {};
  var redirectUrl = "/edit?id="+req.body.id;
  res.send(JSON.stringify(redirectUrl));
});

app.get('/edit', function(req,res,next){
  var context = {};

  mysql.pool.query("SELECT *, DATE_FORMAT(date, '%m-%d-%Y') as date FROM workouts WHERE id="+req.query.id, function(err, row, fields){
    if(err){
      next(err);
      return;
    }
    context.results = row;
    res.render('edit', context);
  });
});

app.post('/edit', function(req,res,next){
  var context = {};
  var updateResponse = "";

  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
  
    if(result.length==1){
      var curVals = result[0];
      var dateElements = req.body.date.split('-');
      var dateFormatted = dateElements[2] + "-" + dateElements[0] + "-" + dateElements[1];
      mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?", 
      [req.body.name || curVals.name, req.body.reps, req.body.weight, dateFormatted, req.body.lbs, req.body.id], function(err, result){
        if(err){
          next(err);
          return;
        }
        context.newMsg = "Saved id " + req.body.id + ": " + req.body.name;
        context.redirectUrl = "/";
        updateResponse = JSON.stringify(context);
        res.type('plain/text')
        res.send(updateResponse);
      });
    }
  });
});

///safe-update?id=1&name=The+Task&done=false
app.get('/safe-update',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM todo WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE todo SET name=?, done=?, due=? WHERE id=? ",
        [req.query.name || curVals.name, req.query.done || curVals.done, req.query.due || curVals.due, req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.render('home',context);
      });
    }
  });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    });
    createString = "SELECT "
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
