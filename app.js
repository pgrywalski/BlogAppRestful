var bodyParser        = require( "body-parser" );
var methodOverride    = require( "method-override" );
var expressSanitizer  = require( "express-sanitizer" );
var mongoose          = require( "mongoose" );
var express           = require( "express" );
var app               = express();

// APP CONFIG
// Configure Mongoose to connect to DB
mongoose.connect( "mongodb://localhost/restfull_blog_app" );
// Set ejs extension to files
app.set( "view engine", "ejs" );
// Get content of the public directory - serve this content
app.use(express.static( "public" ));
// Change req.body to JS object - need to install body parser
app.use(bodyParser.urlencoded( { extended: true }));
// Use override method to convert POST request to PUT which is not supported by HTML
app.use(methodOverride( "_method" ));
// Use express-sanitizer to put html tags into body post
app.use(expressSanitizer());

// MONGOOSE/MODEL CONFIG
// Create default Schema
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now } // Set default value to current date
});
var Blog = mongoose.model( "Blog", blogSchema );

// RESTFULL ROUTES
// name     path            http verb   mongoose method
// =============================================================
// INDEX    /blogs          GET         Blog.find()
// NEW      /blogs/new      GET         N/A
// CREATE   /blogs/         POST        Blog.create()
// SHOW     /blogs/:id      GET         Blog.findById()
// EDIT     /blogs/:id/edit GET         Blog.findById()
// UPDATE   /blogs/:id      PUT         Blog.finByIdAndUpdate()
// DESTROY  /blogs/:id      DELETE      Blog.findByIdAndRemove()

app.get("/", function( req, res ) {
  res.redirect( "/blogs" );
});

// INDEX ROUTE
app.get("/blogs", function( req, res ) {
  Blog.find( {}, function( err, blogs ) {
    if ( err ) {
      console.log("Something went wrong...");
    } else {
      res.render( "index", { blogs: blogs } );
    }
  });
});

// NEW ROUTE
app.get("/blogs/new", function( req, res ) {
  res.render( "new" );
});

// CREATE ROUTE
app.post("/blogs", function( req, res ) {
  // Create blog
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create( req.body.blog, function( err, newBlog ) {
    if ( err ) {
      res.render( "new" );
    } else {
      // Redirect to index
      res.redirect( "/blogs" );
    }
  });
});

// SHOW ROUTE
app.get("/blogs/:id", function( req, res ) {
  Blog.findById(req.params.id, function( err, foundBlog ) {
    if ( err ) {
      res.redirect("/blogs");
    } else {
      res.render( "show", { blog: foundBlog } );
    }
  });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function( req, res ) {
  Blog.findById(req.params.id, function( err, foundBlog ) {
    if ( err ) {
      res.redirect("/blogs");
    } else {
      res.render( "edit", { blog: foundBlog } );
    }
  });
});

// UPDATE ROUTE
app.put("/blogs/:id", function( req, res ) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function( err, updatedBlog ) {
    if ( err ) {
      res.redirect( "/blogs" );
    } else {
      res.redirect( "/blogs/" + req.params.id );
    }
  });
});

// DELETE ROUTE
app.delete("/blogs/:id", function( req, res ) {
  // Destroy blog
  Blog.findByIdAndRemove(req.params.id, function( err ) {
    if ( err ) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

// Start application
app.listen( 8080, function() {
  console.log("Server is running...");
});