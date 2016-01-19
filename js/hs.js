var Card = function( obj, settings ){

  this.card = {
    o : obj,
    rX : 0,
    rY : 0,
    tX : 0,
    tY : 0,
    scale : 1
  };
  this.mouse = {
    cx : 0, //x click position
    cy : 0, //y click position
    x : ( document.body.offsetWidth / 2 ) - ( obj.offsetWidth / 2 ), //x position
    y : ( document.body.offsetHeight / 2 ) - ( obj.offsetHeight / 2 ), //y position
    py : 0, //previous y position
    px : 0, //previous x position
    vx : 0, //x velocity
    vy : 0,  //y velocity,
    timer : null, // timer to detect stop moving
    moving : false //is moving
  };

  this.speed = ( settings && settings.speed )? settings.speed : 6;
  this.offSpeed = ( settings && settings.offSpeed )? settings.offSpeed : 5;
  this.limit =  ( settings && settings.rotateLimit )? settings.rotateLimit : 60;
  this.sensibility = ( settings && settings.sensibility )? settings.sensibility : 6;
  this.scaling = ( settings && settings.scaling )? settings.scaling : false;
  this.focus = false;
  this.init();

}



Card.prototype.init = function()
{ 
  this.bindClick();

  this.card.x = this.mouse.x - ( this.card.o.offsetWidth / 2 );
  this.card.y = this.mouse.y - ( this.card.o.offsetHeight / 2 );

  this.start();

};


Card.prototype.bindClick = function()
{

  this.bindmove = this.bindMove.bind( this );
  this.card.o.addEventListener('mousedown', this.bindmove );
  this.card.o.addEventListener("touchmove", this.bindmove, false);

};



Card.prototype.bindMove = function(e)
{

  this.mouse.cx = e.layerX;
  this.mouse.cy = e.layerY;
  this.mouse.x = e.clientX;
  this.mouse.y = e.clientY;

  this.move = this.getMouseVars.bind( this );
  document.body.addEventListener('mousemove', this.move );
  this.stop = this.unbindMove.bind( this );
  document.body.addEventListener('mouseup', this.stop );

  this.focus = true;

};

Card.prototype.unbindMove = function()
{
  
  document.body.removeEventListener('mousemove', this.move);
  document.body.removeEventListener('mouseup', this.stop);

  this.focus = false;
  this.card.tX = 0;
  this.card.tY = 0;

};


Card.prototype.getMouseVars = function(e)
{

  this.mouse.moving     = true;
  this.mouse.py       = this.mouse.y; 
  this.mouse.px       = this.mouse.x; 
  this.mouse.y      = e.pageY; 
  this.mouse.x      = e.pageX; 
  this.mouse.vx       = this.mouse.x - this.mouse.px; 
  this.mouse.vy       = this.mouse.y - this.mouse.py;

  this.mstop = this.mouseStop.bind(this);
  clearTimeout( this.mouse.timer );
    this.mouse.timer = setTimeout( this.mstop , 10);

};

Card.prototype.mouseStop = function()
{

  this.mouse.moving     = false;
  this.mouse.vx       = 0; 
  this.mouse.vy       = 0;

};

Card.prototype.getRotation = function()
{

  this.card.tX = this.mouse.vx * this.sensibility;
  this.card.tY = this.mouse.vy * this.sensibility;


  if( this.card.tX > this.limit )
    this.card.tX = this.limit;
  else if ( this.card.tX < -this.limit )
    this.card.tX = -this.limit;

  if( this.card.tY > this.limit )
    this.card.tY = this.limit;
  else if ( this.card.tY < -this.limit )
    this.card.tY = -this.limit;

  this.card.x = this.mouse.x - this.mouse.cx;
  this.card.y = this.mouse.y - this.mouse.cy;

};

Card.prototype.updateRotation = function()
{

  var speed = ( this.mouse.moving ) ? this.speed : this.offSpeed;

  if( this.card.rX > ( this.card.tX + speed ) || this.card.rX < ( this.card.tX - speed ) )
    this.card.rX += ( this.card.rX > this.card.tX ) ? -speed : speed;
  else if( this.card.rX > ( this.card.tX + (speed/10) ) || this.card.rX < ( this.card.tX - (speed/10) ) )
    this.card.rX += ( this.card.rX > this.card.tX ) ? -(speed/10) : (speed/10);
  
  if( this.card.rY > ( this.card.tY + speed ) || this.card.rY < ( this.card.tY - speed ) )
    this.card.rY += ( this.card.rY > this.card.tY ) ? -speed : speed;
  else if( this.card.rY > ( this.card.tY + (speed/10) ) || this.card.rY < ( this.card.tY - (speed/10) ) )
    this.card.rY += ( this.card.rY > this.card.tY ) ? -(speed/10) : (speed/10);

};

Card.prototype.updateScale = function()
{

  if( this.focus && this.card.scale < 1.1 ){
    this.card.scale += 0.03;
  }else if( !this.focus && this.card.scale > 1 ){
    this.card.scale -= 0.03;
  }

};

Card.prototype.update = function() {

  if( this.scaling )  
    this.updateScale();

  this.getRotation();

  this.updateRotation();
  
};


Card.prototype.draw = function() {

  this.card.left = "left: " + this.card.x + "px; ";
  this.card.top = "top: " + this.card.y + "px; ";
  this.card.transform = "transform: ";
  this.card.transform += "rotateY(" + this.card.rX + "deg) ";
  this.card.transform += "rotateX(" + -this.card.rY + "deg) ";
  this.card.transform += ( this.scaling ) ? "scale(" + this.card.scale + ");" : ";";

  
  this.card.o.setAttribute('style', this.card.left + this.card.top + this.card.transform );

};

Card.prototype.start = function()
{

  this.running = true;
  this.run();

}
Card.prototype.stop = function()
{

  this.running = false;

};

Card.prototype.run = function()
{
  this.update();
  this.draw();
  loop = this.run.bind( this );
  if( this.running )
    requestAnimationFrame( loop );
}



var Stars = function( settings ){

  this.focus = false;
  this.mouse = {
    x : 0,
    y : 0
  };
  this.stars = [];
  this.canvas;
  this.ctx;


  this.img    = settings.pattern;
  this.c      = settings.container;
  this.click    = ( settings.clickObj )? settings.clickObj : this.c;
  this.id     = ( settings.id )? settings.id : 'stars' ;
  this.life     = ( settings.life )? settings.life : 5 ;
  this.w      = ( settings.width )? settings.width : this.img.width ;
  this.pop    = ( settings.popDist )? settings.popDist : 2 ;
  this.speed    = ( settings.speed )? settings.speed : 5 ;
  this.gravity  = ( settings.gravity != 'undefined' )? settings.gravity : 2 ;

  this.init();

}

Stars.prototype.init = function()
{ 
  this.bindClick();
  this.buildScene();
  this.start();
};

Stars.prototype.rand = function( min, max ){ return Math.random() * ( max - min) + min; };

Stars.prototype.buildScene = function()
{

  this.canvas     = document.createElement('canvas');
  this.canvas.id    = this.id;
  this.canvas.width   = this.c.clientWidth;
  this.canvas.height  = this.c.clientHeight;
  this.ctx      = this.canvas.getContext('2d');

  this.c.appendChild( this.canvas );

  this.res = this.resize.bind(this);
  window.addEventListener( 'resize', this.res );

};


Stars.prototype.resize = function()
{

  this.canvas.width   = this.c.clientWidth;
  this.canvas.height  = this.c.clientHeight;

};

Stars.prototype.bindClick = function()
{

  this.bindmove = this.bindMove.bind( this );
  //this.click.addEventListener('mousedown', this.bindmove );

};



Stars.prototype.bindMove = function()
{

  this.add = this.addStar.bind( this );
  this.c.addEventListener('mousemove', this.add );
  this.stop = this.unbindMove.bind( this );
  document.body.addEventListener('mouseup', this.stop );

  this.focus = true;

};

Stars.prototype.unbindMove = function()
{
  
  this.c.removeEventListener('mousemove', this.add);
  document.body.removeEventListener('mouseup', this.stop);

  this.focus = false;

};


Stars.prototype.getMouseVars = function(e)
{

  this.mouse.y      = e.clientY; 
  this.mouse.x      = e.clientX; 

};

Stars.prototype.buildStar = function()
{

  return {

    x : this.rand( this.mouse.x - this.pop, this.mouse.x + this.pop ),
    y : this.rand( this.mouse.y - this.pop, this.mouse.y + this.pop ),
    r : this.rand( 0, 360 ),
    w : this.rand( this.w / 3, this.w ),
    a : this.rand( 0, 1.3),
    vx : this.rand( -this.speed, this.speed ),
    vy : this.rand( -this.speed, this.speed ),
    vr : this.rand( -(this.speed*10), (this.speed*10) ),
    life : this.rand( this.life / 2, this.life ),
    update : this.rand( 0, 1 )

  };

}

Stars.prototype.addStar = function(e)
{

  this.getMouseVars( e );

  if( this.focus ) {
    
    this.stars.push( this.buildStar() );
    this.stars.push( this.buildStar() );
    this.stars.push( this.buildStar() );
    this.stars.push( this.buildStar() );
    this.stars.push( this.buildStar() );

  }

};




Stars.prototype.update = function() {

  for (var i = this.stars.length - 1; i >= 0; i--) {

    this.stars[i].x   += this.stars[i].vx;
    this.stars[i].y   += this.stars[i].vy;
    this.stars[i].vy  += this.gravity / 10;
    this.stars[i].vx  += this.gravity / 100;

    if( this.stars[i].life < 0 || this.stars[i].y > this.canvas.height ){

      this.stars[i].a -= 0.06;
      this.stars[i].r += this.stars[i].vr;

      if( this.stars[i].a < 0 )
        this.stars.splice( i, 1 );    

    }else{

      if( this.stars[i].update <= 0 ){
      
        this.stars[i].w     = this.rand( this.w / 3, this.w );
        this.stars[i].a     = this.rand( 0.6, 1.3);
        this.stars[i].r     = this.rand( 0, 360);
        this.stars[i].vr    = this.rand( -(this.speed*10), (this.speed*10));
        this.stars[i].update  = this.rand( -1, 1);
        
      }else{

        this.stars[i].update -= 0.1;

      }

      this.stars[i].r += this.stars[i].vr;

      this.stars[i].life -= 0.1;

    }

    

  };

};

Stars.prototype.draw = function() { 

  this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height);

  this.ctx.globalCompositeOperation = "lighter";

  for (var i = this.stars.length - 1; i >= 0; i--) {
    
    var star = this.stars[i];

    this.ctx.save();

    this.ctx.translate( star.x - ( star.w / 2 ), star.y - ( star.w / 2 ) );
    this.ctx.rotate( star.r * Math.PI / 180 );
    this.ctx.globalAlpha = star.a;
    

    this.ctx.drawImage( 
      this.img,         //Specifies the image, canvas, or video element to use
      0,            //The x coordinate where to start clipping
      0,            //The y coordinate where to start clipping
      this.img.width,     //The width of the clipped image
      this.img.height,    //The height of the clipped image
      0,            //The x coordinate where to place the image on the canvas
      0,            //The y coordinate where to place the image on the canvas
      star.w,         //The width of the image to use (stretch or reduce the image)
      star.w          //The height of the image to use (stretch or reduce the image)
    );
    
    this.ctx.restore();

  };

  this.ctx.globalCompositeOperation = "source-over";

};









Stars.prototype.start = function()
{

  this.running = true;
  this.run();

}
Stars.prototype.stop = function()
{

  this.running = false;

};

Stars.prototype.run = function()
{
  this.update();
  this.draw();
  loop = this.run.bind( this );
  if( this.running )
    requestAnimationFrame( loop );
}










var init = function(){

  var oStars = new Stars({

    id        : 'stars',//id for the created canvas
    clickObj    : document.querySelectorAll('.card')[0], //object to place the click event (optional)
    container     : document.body,//container where to place the canvas (he will fit)
    pattern     : document.getElementById('star'),//the star pattern
    life      : 5,//life of stars
    width       : 22,//max width of stars (will be a rand 0 - 22)
    popDist     : 2,//the max stars pop dist
    speed       : 5,//the speed
    gravity     : 3//the gravity


  });

  var oCard = new Card( document.querySelectorAll('.card')[0], {

    sensibility : 6,//sensibility to the mouse velocity
    rotateLimit : 60,//card rotate limite
    speed : 6,//card rotation speed
    scaling : true

  });

  minimum({mode: 'silent'});
};


window.onload = init;