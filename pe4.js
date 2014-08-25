/*
*
*
*   P1X, Krzysztof Jankowski
*   You Are Bacteria
*
*   abstract: Zero-player game game for the Ludum Dare 30 hackathon, 48h
*   engine: P1X Engine V4
*   created: 23-08-2014
*   license: do what you want and dont bother me
*
*   webpage: http://p1x.in
*   twitter: @w84death
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/*
*
*   request animate, force 60fps rendering
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/*
*
*   graphics functions
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Gfx = function(){
    this.layers = [];
    this.screen = {
        width: null,
        height: null,
        scale: 4,
        sprite_size: 8,
    };
    this.screen.width = (window.innerWidth/this.screen.scale)<<0;
    this.screen.height = (window.innerHeight/this.screen.scale)<<0;
    this.tileset = [];
    this.tileset_ids = [];
};
Gfx.prototype.init = function(params){
    this.loaded = 0;
    this.sprites = {
        logo: new Image(),
        pointer: new Image(),
        tileset: new Image()
    };
    this.sprites.logo.src = 'sprites/logo.png';
    this.sprites.pointer.src = 'sprites/pointer.png';
    this.sprites.tileset.src = 'sprites/tileset.png';

    for (var key in this.sprites) {
        this.sprites[key].onload = function(){
            game.gfx.loaded++;
        };
    }

    for (var i = 0; i < params.layers; i++) {
        var canvas = document.createElement('canvas');
        canvas.width = this.screen.width*this.screen.scale;
        canvas.height = this.screen.height*this.screen.scale;

        var ctx = canvas.getContext("2d");
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;

        this.layers.push({
            canvas: canvas,
            ctx: ctx,
            render: false
        });

        document.getElementById('game').appendChild(canvas);
    };
};
Gfx.prototype.load = function(){
    var size = 0, key;
    for (key in this.sprites) {
        if (this.sprites.hasOwnProperty(key)) size++;
    }
    if(this.loaded >= size){
        game.gfx.init_tileset();
        return true;
    }
    return false;
};
Gfx.prototype.clear = function(layer){
    this.layers[layer].ctx.clearRect(
        0, 0,
        this.screen.width*this.screen.scale,
        this.screen.height*this.screen.scale
    );
};
Gfx.prototype.init_tileset = function(){

   for (var y = 0; y < this.sprites.tileset.width/this.screen.sprite_size; y++) {
        for (var x = 0; x < this.sprites.tileset.height/this.screen.sprite_size; x++) {
            this.tileset_ids.push({x:x,y:y});
        }
    }
};
Gfx.prototype.draw_tileset = function(){
    for (var i = 0; i < this.tileset_ids.length; i++) {
        this.put_tile({
            id:i, x:i, y:0, layer:1
        });
        this.layers[1].render = true;
    };
};
Gfx.prototype.put_tile = function(params){
    var sx,sy,
    _w = this.sprites.tileset.width / this.screen.sprite_size,
    _h = this.sprites.tileset.height / this.screen.sprite_size;

    if(params.id > _w){
        sx = params.id % _w;
        sy = (params.id/_w)<<0;
    }else{
        sx = params.id;
        sy = 0;
    }

    this.layers[params.layer].ctx.drawImage(
        this.sprites.tileset,
        sx*this.screen.sprite_size,
        sy*this.screen.sprite_size,
        this.screen.sprite_size,
        this.screen.sprite_size,
        params.x*this.screen.sprite_size*this.screen.scale,
        params.y*this.screen.sprite_size*this.screen.scale,
        this.screen.sprite_size*this.screen.scale,
        this.screen.sprite_size*this.screen.scale
    );
};

/*
*
*   gui functions
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Gui = function(){
    this.layer = null;
    this.bubbles = [];
    this.buttons = [];
};
Gui.prototype.init = function(params){
    this.layer = params.layer;

    this.add_button({
        x: game.world.width-3,
        y: 2,
        sprites: [22,23],
        changer: 'pause',
        fn: function(){
            game.pause = !game.pause;
        }
    });

};
Gui.prototype.zeros = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
};
Gui.prototype.clear = function(){
    game.gfx.layers[this.layer].ctx.clearRect(
        0, 0,
        game.gfx.screen.width*game.gfx.screen.scale,
        game.gfx.screen.height*game.gfx.screen.scale
    );
};
Gui.prototype.draw_logo = function(params){
    var sx = params.x * game.gfx.screen.scale * game.gfx.screen.sprite_size,
        sy = params.y * game.gfx.screen.scale * game.gfx.screen.sprite_size;

    if(params.center){
        sx -= game.gfx.sprites.logo.width * 0.5 * game.gfx.screen.scale;
        sy -= game.gfx.sprites.logo.height * 0.5 * game.gfx.screen.scale;
    }

    game.gfx.layers[this.layer].ctx.drawImage(
        game.gfx.sprites.logo,
        0,0,
        game.gfx.sprites.logo.width,
        game.gfx.sprites.logo.height,
        sx,
        sy,
        game.gfx.sprites.logo.width * game.gfx.screen.scale,
        game.gfx.sprites.logo.height * game.gfx.screen.scale
    );
};
Gui.prototype.draw_intro = function(params){
    var ctx = game.gfx.layers[this.layer].ctx,
        _w = game.gfx.screen.width*game.gfx.screen.scale,
        _h = game.gfx.screen.height*game.gfx.screen.scale;

    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = "900 "+(4*game.gfx.screen.scale)+"px 'Source Code Pro', monospace,serif";
    ctx.strokeStyle = '#fff';

    ctx.fillText('P1X PRESENTS',
        _w*0.5 << 0,
        (_h*0.5 << 0) - 136
    );

    this.draw_logo({
        x:(game.world.width*0.5 << 0),
        y:(game.world.height*0.5 << 0)-2,
        center: true
    });

    ctx.beginPath();
    ctx.moveTo(24,(_h*0.5 << 0)-12);
    ctx.lineTo(_w-24,(_h*0.5 << 0)-12);
    ctx.stroke();

    ctx.fillText('8X8 SPRITES; 16 COLOUR PALETTE',
        (_w*0.5 << 0),
        (_h*0.5 << 0)+18
    );

    game.gfx.layers[this.layer].ctx.fillText('P1X ENGINE V4; HTTP://P1X.IN',
        (_w*0.5 << 0),
        (_h*0.5 << 0)+32
    );

    ctx.fillText('@W84DEATH',
        (_w*0.5 << 0),
        (_h*0.5 << 0)+48
    );

    ctx.beginPath();
    ctx.moveTo(24,(_h*0.5 << 0)+ 56);
    ctx.lineTo(_w-24,(_h*0.5 << 0)+ 56);
    ctx.stroke();

    if(game.timer % 2 == 1){
        ctx.fillText('CLICK TO START',
            _w*0.5 << 0,
            (_h*0.5 << 0) + 84
        );
    }
};
Gui.prototype.draw_game_over = function(){
    var ctx = game.gfx.layers[this.layer].ctx;

    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = "900 11px 'Source Code Pro', monospace,serif";
    ctx.strokeStyle = '#fff';

    ctx.drawImage(game.gfx.sprites.logo,
        (game.gfx.screen.width*0.5 << 0)-(game.gfx.sprites.logo.width*0.5),
        ((game.gfx.screen.height*0.5 << 0)-(game.gfx.sprites.logo.height*0.5))-20
    );

    ctx.beginPath();
    ctx.moveTo(24,(game.gfx.screen.height*0.5 << 0));
    ctx.lineTo(game.gfx.screen.width-24,(game.gfx.screen.height*0.5 << 0));
    ctx.stroke();

    ctx.fillText('GAME OVER',
        (game.gfx.screen.width*0.5 << 0 ) * game.gfx.screen.scale,
        ((game.gfx.screen.height*0.5 << 0)+18)*game.gfx.screen.scale
    );

    ctx.beginPath();
    ctx.moveTo(24,(game.gfx.screen.height*0.5 << 0) + 36);
    ctx.lineTo(game.gfx.screen.width-24,(game.gfx.screen.height*0.5 << 0) + 36);
    ctx.stroke();

    if(game.timer % 2 == 1){
        ctx.fillText('CLICK TO START',
            game.gfx.screen.width*0.5 << 0,
            (game.gfx.screen.height*0.5 << 0) + 54
        );
    }
};
Gui.prototype.draw_fps = function(){
    var ctx = game.gfx.layers[this.layer].ctx;
    ctx.font = "900 "+(5* game.gfx.screen.scale)+"px 'Source Code Pro', monospace,serif";
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';
    ctx.fillText('FPS '+game.fps,
        (game.world.width  - 2) * game.gfx.screen.scale * game.gfx.screen.sprite_size,
        (game.world.height  -1 ) * game.gfx.screen.scale * game.gfx.screen.sprite_size
    );
};
Gui.prototype.draw_pointer = function(){
    var x = (game.input.pointer.pos.x ) << 0,
        y = (game.input.pointer.pos.y ) << 0;

    game.gfx.layers[this.layer].ctx.drawImage(
        game.gfx.sprites.pointer,
        game.input.pointer.enable? 8 : 0, // x cut
        0, // y cut
        8,8,x,y,8*game.gfx.screen.scale,8*game.gfx.screen.scale // cut size, position, sprite size
    );
};
Gui.prototype.draw_bacteria_brain = function(){
    var i,x,y,tile, width, height;

    width = game.settings.brain.size + 2;
    height = game.settings.brain.size + 2;

    for (i = 0; i < 6; i++) {
        game.gfx.put_tile({
            layer: this.layer-1,
            id: 16+i,
            x: ( ((width-5)*0.5)<<0 ) + game.settings.brain.pos.x + i,
            y: game.settings.brain.pos.y-1
        });
    };

    this.draw_box({
        layer: this.layer-1,
        width: width,
        height: height,
        x: game.settings.brain.pos.x,
        y: game.settings.brain.pos.y,
        sprites: [
            6,7,8,
            9,false,10,
            11,13,12
        ]
    });
};
Gui.prototype.add_button = function(params){
    this.buttons.push({
        pos: {
            x: params.x,
            y: params.y
        },
        sprites: params.sprites,
        changer: params.changer,
        fn: params.fn
    });
};
Gui.prototype.draw_buttons = function(){
    var key, btn;

    for(key in this.buttons){
        btn = this.buttons[key];

        game.gfx.put_tile({
            layer: this.layer,
            id: game[btn.changer] ? btn.sprites[0] : btn.sprites[1],
            x: btn.pos.x,
            y: btn.pos.y
        });
    }
};
Gui.prototype.button_clicked = function(x,y){
    var key, btn;

    for(key in this.buttons){
        btn = this.buttons[key];
        if(
            x >= btn.pos.x &&
            x < btn.pos.x + 1 &&
            y >= btn.pos.y &&
            y < btn.pos. y + 1
        ){
            btn.fn();
            return true;
        }
    }
    return false;
};
Gui.prototype.draw_box = function(params){
    var x, y,
        width = params.width,
        height = params.height,
        draw = {
            x: params.x,
            y: params.y
        };

    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            if(y===0){
                if(x===0) tile = params.sprites[0];
                if(x>0 && x<width-1) tile = params.sprites[1];
                if(x===width-1) tile = params.sprites[2];
            }
            if(height > 2 && y>0){
                if(x===0) tile = params.sprites[3];
                if(x>0 && x<width-1) tile = params.sprites[4];
                if(x===width-1) tile = params.sprites[5];
            }
            if(y===height-1){
                if(x===0) tile = params.sprites[6];
                if(x>0 && x<width-1) tile = params.sprites[7];
                if(x===width-1) tile = params.sprites[8];
            }

            if(tile){
                game.gfx.put_tile({
                    layer: params.layer,
                    id:tile,
                    x: draw.x + x,
                    y: draw.y + y
                });
            }
        }
    }
};
Gui.prototype.draw_aside = function(){
    var ctx = game.gfx.layers[this.layer].ctx,
        x = game.world.width-5,
        y = 1;

    this.draw_box({
        layer: this.layer-1,
        width: 5,
        height: 5,
        x: x,
        y: y,
        sprites: [
            6,7,8,
            9,14,10,
            11,13,12
        ]
    });

    game.gfx.put_tile({
        layer: this.layer,
        id: 1,
        x: x+3,
        y: y+2
    });

    game.gfx.put_tile({
        layer: this.layer,
        id: 15,
        x: x+3,
        y: y+3
    });


    ctx.fillStyle = '#fff';
    ctx.font = "900 "+(7*game.gfx.screen.scale)+"px 'Source Code Pro', monospace,serif";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(this.zeros(game.count_bacterias(),2) + 'x',
        game.gfx.screen.sprite_size * game.gfx.screen.scale * (x + 1),
        game.gfx.screen.sprite_size * game.gfx.screen.scale *(y + 2)
    );

    ctx.fillStyle = '#fff';
    ctx.font = "900 "+(7*game.gfx.screen.scale)+"px 'Source Code Pro', monospace,serif";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(this.zeros(game.brain_cells,2) + 'x',
        game.gfx.screen.sprite_size * game.gfx.screen.scale * (x + 1),
        game.gfx.screen.sprite_size * game.gfx.screen.scale * (y + 3)
    );
};


/*
*
*   Messages / conversations / tutorials
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

Messages = function(){
    this.layer = null;
    this.bubbles = [];
};
Messages.prototype.init = function(params){
    this.layer = params.layer;
};
Messages.prototype.draw_message = function(params){
    var ctx = game.gfx.layers[this.layer].ctx,
        tile = 0, corner = {}, max_len = 0, len = 0, longest_line,
        width, height, i,x,y;

    ctx.fillStyle = '#000';
    ctx.font = "900 "+(5*game.gfx.screen.scale)+"px 'Source Code Pro', monospace,serif";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    for (i = 0; i < params.msg.length; i++) {
        len = params.msg[i].length;
        if(len > max_len) {
            max_len = len;
            longest_line = i;
        }
    };
    longest_line = ctx.measureText(params.msg[longest_line]).width;
    console.log(longest_line)
    width = ((longest_line/game.gfx.screen.sprite_size/game.gfx.screen.scale)<<0 )+2;
    height = i+1;
    if(width<2) width = 2;

    corner = {
        x: params.x - width,
        y: params.y - height + 1
    };

    game.gui.draw_box({
        layer: this.layer,
        width: width,
        height: height,
        x: corner.x,
        y: corner.y,
        sprites: [
            25,26,27,
            26,26,28,
            29,30,31
        ]
    });


    for (var i = 0; i < params.msg.length; i++) {
        ctx.fillText(params.msg[i],
            (corner.x*game.gfx.screen.sprite_size + 5 )*game.gfx.screen.scale ,
            ((corner.y+i)*game.gfx.screen.sprite_size + 4)*game.gfx.screen.scale
        );
    };
};
Messages.prototype.add_conversation = function(params){
    for (var i = 0; i < params.bubbles.length; i++) {
        this.bubbles.push({
            msg: params.bubbles[i],
            pos: {
                x:params.pos.x,
                y:params.pos.y
            },
            delay: i===0 ? params.delay || false : false,
            time: game.settings.conversation_time
        });
    };
};
Messages.prototype.draw_conversation = function(){
    var msg;

    if(this.bubbles.length > 0){
        bubble = this.bubbles[0];
        if(bubble.delay && bubble.delay < 0){
            if(bubble.time < 0){
                this.draw_message({
                    msg: bubble.msg,
                    x: bubble.pos.x,
                    y: bubble.pos.y
                });
                if(game.input.pointer.enable){
                    this.bubbles.splice(0,1);
                }
            }else{
                bubble.time--;
            }
        }else{
            bubble.delay--;
        }
    }
};

/*
*
*   input function
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Input = function(){
    this.pointer = {
        enable: false,
        pos: {
            x: null,
            y: null
        }
    };
};
Input.prototype.init = function(){
    document.body.addEventListener('mousedown', this.enable_pointer, false);
    document.body.addEventListener('mouseup', this.disable_pointer, false);
    document.body.addEventListener('mousemove', this.track_pointer, false);
    document.body.addEventListener("contextmenu", function(e){
        e.preventDefault();
    }, false);
};
Input.prototype.enable_pointer = function(e){
    e.preventDefault();
    var x,y;
    if(e.touches){
        x = e.touches[0].pageX;
        y = e.touches[0].pageY;
    }else{
        x = e.pageX;
        y = e.pageY;
    }
    game.input.pointer.enable = true;
    game.select_bacteria();
};
Input.prototype.disable_pointer = function(){
    game.input.pointer.enable = false;
};
Input.prototype.track_pointer = function(e){
    e.preventDefault();
    var x,y;
    if(e.touches){
        x = e.touches[0].pageX;
        y = e.touches[0].pageY;
    }else{
        x = e.pageX;
        y = e.pageY;
    }
    game.input.pointer.pos.x = x;
    game.input.pointer.pos.y = y;
};


/*
*
*   sound generation
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


Moog = function(){
    this.audio = new (window.AudioContext || window.webkitAudioContext)();
};
Moog.prototype.play = function(params){
    if(params.pause) return;
    var vol = params.vol || 0.2,
        attack = params.attack || 20,
        decay = params.decay || 300,
        freq = params.freq || 30,
        oscilator = params.oscilator || 0;
        gain = this.audio.createGain(),
        osc = this.audio.createOscillator();

    // GAIN
    gain.connect(this.audio.destination);
    gain.gain.setValueAtTime(0, this.audio.currentTime);
    gain.gain.linearRampToValueAtTime(params.vol, this.audio.currentTime + attack / 1000);
    gain.gain.linearRampToValueAtTime(0, this.audio.currentTime + decay / 1000);

    // OSC
    osc.frequency.value = freq;
    osc.type = oscilator; //"square";
    osc.connect(gain);

    // START
    osc.start(0);

    setTimeout(function() {
        osc.stop(0);
        osc.disconnect(gain);
        gain.disconnect(game.moog.audio.destination);
    }, decay)
};

/*
*
*   entities
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var Entity = function(params){
    this.life = params.life;
    this.sprites = params.sprites;
    this.fps_limit = 6;
    this.frame = 0;
    this.frame_counter = 0;
    this.pos = {
        x: params.x,
        y: params.y
    };
    this.last_move = game.timer;
    this.distance = 0;
    this.brain = [];
    this.gol_init();
};
Entity.prototype.gol_init = function(params){
    var x, y, r;
    this.brain = [game.settings.brain.size];
    for (x = 0; x < game.settings.brain.size; x++) {
        this.brain[x] = [game.settings.brain.size];
        for (y = 0; y < game.settings.brain.size; y++) {
            r = (Math.random()<game.settings.brain.init_populaton) ? true : false;
            this.brain[x][y] = r;
        };
    };
};
Entity.prototype.gol = function(params){
    var temp = [game.settings.brain.size],
        x,y,n, changed,live_cells;

    if(this.last_move < game.timer){
        for (x = 0; x < game.settings.brain.size; x++) {
            temp[x] = [game.settings.brain.size];
            for (y = 0; y < game.settings.brain.size; y++) {
                n = 0;

                temp[x][y] = false;

                if(this.brain[x-1] && this.brain[x-1][y-1]) n++;
                if(this.brain[x+1] && this.brain[x+1][y-1]) n++;

                if(this.brain[x][y-1]) n++;
                if(this.brain[x][y+1]) n++;
                if(this.brain[x-1] && this.brain[x-1][y]) n++;
                if(this.brain[x+1] && this.brain[x+1][y]) n++;

                if(this.brain[x-1] && this.brain[x-1][y+1]) n++;
                if(this.brain[x+1] && this.brain[x+1][y+1]) n++;

                // Conway's Game of Life Rules
                if(this.brain[x][y] && n<2) temp[x][y] = false;
                if(this.brain[x][y] && n===2 || n===3) temp[x][y] = true;
                if(!this.brain[x][y] && n===3) temp[x][y] = true;
                if(this.brain[x][y] && n>3) temp[x][y] = false;
            };
        };

        changed = 0;
        live_cells = 0;
        for (x = 0; x < game.settings.brain.size; x++) {
            for (y = 0; y < game.settings.brain.size; y++) {
                if(this.brain[x][y] !== temp[x][y]) changed++;
                this.brain[x][y] = temp[x][y] ? true : false;
                if(this.brain[x][y]){
                    live_cells++;
                }
            };
        };

        this.brain_interpreter({
            changed: changed,
            live_cells: live_cells
        });

        game.gfx.layers[2].render = true;
    }
};
Entity.prototype.brain_interpreter = function(params){
    if(params.live_cells === 0){
        this.life = false;
        this.sprites = [3,3];
        game.moog.play({
            freq: 100,
            attack: 10,
            decay: 400,
            oscilator: 3,
            vol: 0.2
        });
    }

    if(params.changed > 0){
        this.move();
    }

    if(params.live_cells > Math.pow(this.brain.length,2) * 0.4){
        game.world.entities.push(new Entity({
            life: true,
            sprites: [1,2],
            x: this.pos.x,
            y: this.pos.y
        }));
        game.moog.play({
            freq: 220,
            attack: 80,
            decay: 400,
            oscilator: 3,
            vol: 0.2
        });
    }
};
Entity.prototype.distance_to = function(params){
    var xs = 0;
    var ys = 0;

    xs = params.x - this.pos.x;
    xs = xs * xs;

    ys = params.y - this.pos.y;
    ys = ys * ys;

    return Math.sqrt( xs + ys )<<0;
};
Entity.prototype.move = function(){
    var dir = (Math.random()*4)<<0;

    if(this.life && this.last_move < game.timer){
        switch(dir){
            case 0:
                if(this.distance_to({
                    x:game.world.center.x - 1,
                    y:game.world.center.y }) < game.settings.max_distance) {
                    if(!game.bacteria_in_this_space(this.pos.x+1,this.pos.y)){
                        this.pos.x++;
                    }
                }
            break;
            case 1:
                if(this.distance_to({
                    x:game.world.center.x + 1,
                    y:game.world.center.y }) < game.settings.max_distance) {
                    if(!game.bacteria_in_this_space(this.pos.x-1,this.pos.y)){
                        this.pos.x--;
                    }
                }
            break;
            case 2:
                if(this.distance_to({
                    x:game.world.center.x,
                    y:game.world.center.y - 1 }) < game.settings.max_distance) {
                    if(!game.bacteria_in_this_space(this.pos.x,this.pos.y+1)){
                        this.pos.y++;
                    }
                }
            break;
            case 3:
                if(this.distance_to({
                    x:game.world.center.x,
                    y:game.world.center.y + 1 }) < game.settings.max_distance) {
                    if(!game.bacteria_in_this_space(this.pos.x,this.pos.y-1)){
                        this.pos.y--;
                    }
                }
            break;
        }
        this.last_move = game.timer;
        this.distance = this.distance_to({
            x:game.world.center.x,
            y:game.world.center.y
        });
        game.gfx.layers[1].render = true;
    }

};
Entity.prototype.animate = function(){
    if(this.life && this.frame_counter++ > this.fps_limit){
        this.frame++;
        if(this.frame >= this.sprites.length){
            this.frame = 0;
        }
        this.frame_counter = 0;
        game.gfx.layers[1].render = true;
    }
};

/*
*
*   main game mechanics
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


var game = {

    gfx: new Gfx(),
    gui: new Gui(),
    input: new Input(),
    moog: new Moog(),
    messages: new Messages(),

    fps: 0,
    state: 'loading',
    timer: 0,
    settings:{
        water_animates: 36,
        conversation_time: 30,
        max_distance: 0,
        brain:{
            size: 6,
            init_populaton: 0.3,
            pos: {
                x: 2,
                y: 2
            }
        }
    },

    world: {
        width: null,
        height: null,
        center: {
            x: null,
            y: null
        },
        data: [],
        entities: []
    },

    brain_cells: 10,
    selected_bacteria: false,
    pause: true,
    tutorial: true,

    /*
    *   init the engine
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    init: function(){
        // game world size (for now as big as screen)
        this.world.width = (this.gfx.screen.width/this.gfx.screen.sprite_size)<<0;
        this.world.height = (this.gfx.screen.height/this.gfx.screen.sprite_size)<<0;
        this.world.center.x = (this.world.width*0.5)<<0;
        this.world.center.y = (this.world.height*0.5)<<0;


        if(this.world.height > this.world.width){
            this.settings.max_distance = this.world.height*0.25;
        }else{
            this.settings.max_distance = this.world.width*0.25;
        }

        // init game timer
        window.setInterval(game.inc_timer,500);

        this.gfx.init({
            layers: 4
        });

        this.gui.init({
            layer: 3
        });

        this.messages.init({
            layer: 3
        })

        this.input.init();

    },

    /*
    *   game logic
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    inc_timer: function(){
        game.timer++;
        if(
            !game.pause &&
            game.timer % 10 == 0 &&
            game.count_bacterias()>0 &&
            game.brain_cells < 99
        ){
            game.brain_cells++;
        }
    },

    new_game: function(){
        var x, y;

        for (var i = 0; i < 3; i++) {
            this.world.entities.push(new Entity({
                life: true,
                sprites: [1,2],
                x: game.world.center.x + (-8 + (Math.random()*16)<<0),
                y: game.world.center.y + (-8 + (Math.random()*16)<<0)
            }));
        };

        if(this.tutorial){
            x = game.world.center.x + 4;
            y = game.world.center.y - 2;
            this.world.entities.push(new Entity({
                life: true,
                sprites: [1,2],
                x: x,
                y: y
            }));


            this.messages.add_conversation({
                bubbles: [

                    ['Welcome!',
                    'I\'m a bacteria.'],

                    ['You can program my brain',
                    'by simple binary rules.'],

                    ['Select one of us.'],

                    ['Brain works as a ',
                    'Conway\'s Game of Life.',
                    'Google it\'s rules.'],

                    ['You can add new cells',
                    'thus modify the brain.'],

                    ['Lot of active cells will',
                    'result in multiply and new',
                    'bacteria will show.'],

                    ['If there is no active cell',
                    'I will die shortly :('],

                    ['Movement in brain cause my',
                    'movement in this enviroment.'],
                ],
                pos: {
                    x: x,
                    y: y
                },
                delay: 10
            });

            this.messages.add_conversation({
                bubbles: [
                    ['Here You can start the game.',
                    'Or pause it any time.']
                ],
                pos: {
                    x: this.world.width - 3,
                    y: 2,
                },
                delay: 50
            });

            this.messages.add_conversation({
                bubbles: [
                    ['Here You can see how many',
                    'bacterias are alive.']
                ],
                pos: {
                    x: this.world.width - 5,
                    y: 3,
                },
                delay: 10
            });

            this.messages.add_conversation({
                bubbles: [
                    ['Here are cells You can use',
                    'to program bacteria\'s brains.',
                    'Each 10 turns You\'ll gain new cell.']
                ],
                pos: {
                    x: this.world.width - 5,
                    y: 4,
                },
                delay: 10
            });

            this.messages.add_conversation({
                bubbles: [
                    ['Let\s play!']
                ],
                pos: {
                    x: x,
                    y: y
                },
                delay: 10
            });

            this.tutorial = false;
        }
    },

    count_bacterias: function(){
        var total = 0, key;
        for(key in this.world.entities){
            if(this.world.entities[key].life) total++;
        }
        return total;
    },

    bacteria_in_this_space: function(x,y){
        for(key in this.world.entities){
            if(
                this.world.entities[key].life &&
                this.world.entities[key].pos.x === x &&
                this.world.entities[key].pos.y === y
            ){
                return true;
            }
        }
        return false;
    },

    select_bacteria: function(){
        var entity, e,
            p = {
                x: (this.input.pointer.pos.x/this.gfx.screen.sprite_size/this.gfx.screen.scale)<<0,
                y: (this.input.pointer.pos.y/this.gfx.screen.sprite_size/this.gfx.screen.scale)<<0
            };

        if(this.gui.button_clicked(p.x,p.y)){
            this.moog.play({
                freq: 500,
                attack: 10,
                decay: 40,
                oscilator: 1,
                vol: 0.2
            });
        }else
        if(
            this.selected_bacteria &&
            p.x > game.settings.brain.pos.x &&
            p.x < game.settings.brain.pos.x + game.settings.brain.size + 1 &&
            p.y > game.settings.brain.pos.y &&
            p.y < game.settings.brain.pos.y + game.settings.brain.size + 1
        ){
            p.x = p.x - game.settings.brain.pos.x - 1
            p.y = p.y - game.settings.brain.pos.y - 1
            if(this.selected_bacteria.life && this.brain_cells > 0){
                if(!this.selected_bacteria.brain[p.x][p.y]){
                    this.selected_bacteria.brain[p.x][p.y] = true;
                    this.brain_cells--;
                    this.moog.play({
                        freq: 250,
                        attack: 10,
                        decay: 40,
                        oscilator: 1,
                        vol: 0.2
                    });
                }
            }else{
               this.moog.play({
                    freq: 50,
                    attack: 10,
                    decay: 40,
                    oscilator: 1,
                    vol: 0.2
                });
            }
        }else{
            this.selected_bacteria = false;
            for (entity in this.world.entities) {
                e = this.world.entities[entity];
                e.selected = false;
                if(e.pos.x === p.x && e.pos.y === p.y && e.life){
                    e.selected = true;
                    this.selected_bacteria = e;
                    this.moog.play({
                        freq: 1000,
                        attack: 10,
                        decay: 40,
                        oscilator: 1,
                        vol: 0.2
                    });
                }
            };
            if(!this.selected_bacteria){
                this.moog.play({
                    freq: 30,
                    attack: 10,
                    decay: 40,
                    oscilator: 1,
                    vol: 0.2
                });
            }
        }

        this.gfx.layers[2].render = true;
    },

    update: function(delta_time){
        var i,x,y,e,entity;

        switch(this.state){
            case 'loading':
                if(this.gfx.load()){
                    this.gfx.layers[0].render = true;
                    this.state = 'intro';
                }
            break;
            case 'intro':
                if(this.input.pointer.enable){
                    this.new_game();
                    this.state = 'game';
                }
            break;
            case 'game':

                for (entity in this.world.entities) {
                    e = this.world.entities[entity];
                    if(!this.pause && e.life){
                        e.gol();
                    }
                    e.animate();
                };

                if(this.count_bacterias() === 0){
                    this.world.entities = [];
                    this.gfx.layers[1].render = true;
                    this.pause = true;
                    this.state = 'game_over';
                }

            break;
            case 'game_over':
                if(this.input.pointer.enable){
                    this.new_game();
                    this.state = 'game';
                }
            break;
        }

    },

     render: function(delta_time){
        this.gui.clear();
        var i,x,y,e,entity;

        switch(this.state){
            case 'loading':
            break;
            case 'intro':
                if(this.gfx.layers[0].render){
                    for (x = 0; x < this.world.width; x++) {
                        for (y = 0; y < this.world.height; y++) {
                            this.gfx.put_tile({
                                layer:0,
                                id:0,
                                x:x,y:y
                            });
                        };
                    };
                    this.gfx.layers[0].render = false;
                }

                this.gui.draw_intro();
            break;
            case 'game':
                if(this.gfx.layers[1].render){
                    this.gfx.clear(1);
                    for (entity in this.world.entities) {
                        e = this.world.entities[entity];
                        if(!e.life){
                            this.gfx.put_tile({
                                layer:1,
                                id:e.sprites[e.frame],
                                x:e.pos.x,
                                y:e.pos.y
                            });
                        }
                    };

                    for (entity in this.world.entities) {
                        e = this.world.entities[entity];
                        if(e.life){
                            this.gfx.put_tile({
                                layer:1,
                                id:e.sprites[e.frame],
                                x:e.pos.x,
                                y:e.pos.y
                            });
                            if(e.selected){
                                this.gfx.put_tile({
                                    layer:this.gui.layer,
                                    id:5,
                                    x:e.pos.x,y:e.pos.y
                                });
                            }
                        }
                    };
                    this.gfx.layers[1].render = true;
                }
                if(this.selected_bacteria){
                    if(this.gfx.layers[2].render){
                        this.gfx.clear(2);
                        this.gui.draw_bacteria_brain();
                        for (x = 0; x < game.settings.brain.size; x++) {
                            for (y = 0; y < game.settings.brain.size; y++) {
                                game.gfx.put_tile({
                                    layer: 2,
                                    id:this.selected_bacteria.brain[x][y] ? 15 : 14,
                                    x: x + this.settings.brain.pos.x + 1,
                                    y: y + this.settings.brain.pos.y + 1
                                })
                            }
                        }
                        this.gfx.layers[2].render = false;
                    }
                }else{
                    this.gfx.clear(2);
                }

                this.gui.draw_aside();
                this.gui.draw_buttons();
                this.gui.draw_fps();
                this.gui.draw_logo({x:1,y:this.world.height-3});
                this.messages.draw_conversation();
            break;
            case 'game_over':
                this.gui.draw_game_over();
            break;
        }
        this.gui.draw_pointer();
    },


    /*
    *   main loop
    * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    loop: function(delta_time){
        this.update(delta_time);
        this.render(delta_time);
    },

};

game.init();

var time,
    fps = 0,
    last_update = (new Date)*1 - 1,
    fps_filter = 30;

(function game_loop() {
    requestAnimFrame(game_loop);

    var now = new Date().getTime(),
        delta_time = now - (time || now);
    time = now;

    var temp_frame_fps = 1000 / ((now=new Date) - last_update);
    fps += (temp_frame_fps - fps) / fps_filter;
    last_update = now;

    game.fps = fps.toFixed(1);
    game.loop(delta_time);
})();