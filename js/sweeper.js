var sweeper = function(a,b,c) {
    this.size=30;
    this.x = 20;
    this.y = 20;
    this.m = 50;
    this.f = this.m;
    this.ended = false;
    var $mineBoard = jQuery("#mineBoard");
    var $flagCount = jQuery("#flagCount");
    var $timeCounter = jQuery("#timeCounter");
    var $form = jQuery("#form");
    var $formDimensions = $form.find("#dimensions");
    var $formMines = $form.find("#mines");
    var board;
    var counter=0;
    var counterTimer;

    var v = this;

    this.setBoard = function(){
        board = new Array(v.x);
        for(var i = 0; i < v.x; i++){
            board[i] = new Array(v.y);
            for(var j = 0; j < v.y; j++){
                board[i][j] = 0;
            }
        }
        setMines();
    }

    var setMines = function(){
        for(var i = 0; i < v.m; i++){
            setMine();                            
        }
    }

    var setMine = function(){
        var Rx = Math.floor((Math.random() * v.x));
        var Ry = Math.floor((Math.random() * v.y));
        if(board[Rx][Ry] >= 0){
            setMineNumbers(Rx,Ry)
        } else {
            setMine();
        }
    }

    var setMineNumbers = function(Mx, My){
        board[Mx][My] = -1;

        for(var i = Mx-1; i <= Mx+1; i++){
            for(var j = My-1; j <= My+1; j++){
                if(i>=0 && j>=0 && i<v.x && j<v.y && board[i][j] != -1){
                    board[i][j]++;
                }
            }
        }
    }

    this.drawBoard = function(){
        var $boardString = jQuery('<div class="table"></div>');
        for(var i = 0; i < v.x; i++){
            var $rowString = jQuery('<div class="minerow"></div>'); 
            for(var j = 0; j < v.y; j++){
                var $mineString = jQuery('<div class="mine mine-' +j+ '-' +i+ '"></div>'); 
                $mineString.attr('data-x', i).attr('data-y', j); //.text(board[i][j]);
                $rowString.append($mineString);
            }
            $boardString.append($rowString);
        }
        return $boardString;
    }

    this.updateBoard = function(){
        v.ended = false;
        this.setBoard();
        $flagCount.text(v.f);
        $mineBoard.empty().css({'width':(v.size*v.x)+'px', 'height':(v.size*v.y)+'px'}).append(this.drawBoard());
        $timeCounter.text(0);
        counter = 0;
        clearInterval(counterTimer);
        counterTimer = setInterval(function(){
            counter++;
            $timeCounter.text(counter);
        }, 1000); 
    }

    this.end = function(won){
        v.ended = true;
        if(won === true)
            $mineBoard.find('.mine').addClass("win");
        
        clearInterval(counterTimer);
        for(var i = 0; i < v.x; i++){
            for(var j = 0; j < v.y; j++){
                if(board[i][j] == -1){
                    $mineBoard.find('.mine-' +j+ '-' +i).addClass("bomb").empty().append('<i class="fa fa-certificate"></i>');
                }
            }
        }
    }

    this.spread = function(Mx,My){
        for(var i = Mx-1; i <= Mx+1; i++){
            for(var j = My-1; j <= My+1; j++){
                if(i>=0 && j>=0 && i<v.x && j<v.y && board[i][j] != -1){
                    var $adjacent = $mineBoard.find('.mine-' +j+ '-' +i);
                    if(!($adjacent.hasClass("flag") || $adjacent.hasClass("open"))){
                        $adjacent.addClass("open");
                        v.checkClick($adjacent);
                   }
                }
            }
        }
    }

    this.checkClick = function($that){
        var tempX = $that.data("x");
        var tempY = $that.data("y");

        switch(board[tempX][tempY]){
            case -1 :
                v.end(false);
                break;
            case 0 :
                v.spread(tempX,tempY);
                break;
            default :
                $mineBoard.find('.mine-' +tempY+ '-' +tempX).text(board[tempX][tempY]);
                break;
        }

        if(v.x*v.y - v.m == $mineBoard.find(".open").size()){
            v.end(true);
        }
    }

    this.reset = function(){
        v.ended = false;
        $mineBoard.find(".mine").removeClass("open").removeClass("win").removeClass("flag").removeClass("question").empty();
        v.f = v.m;
        counter = 0;
        $timeCounter.text(counter);
        clearInterval(counterTimer);
        counterTimer = setInterval(function(){
            counter++;
            $timeCounter.text(counter);
        }, 1000); 
    }

    this.init = function(){
        $form.on("click", ".update", function(e){
            e.preventDefault();
            var dim = $formDimensions.val();
            var min = $formMines.val();
            if(!isNaN(parseInt(dim)))
                v.x = v.y = dim;
            if(!isNaN(parseInt(min))){
                v.m = min;
                v.f = min;
            }
            v.updateBoard();
        });

        $form.on("click", ".reset", function(e){
            e.preventDefault();
            v.reset();
        });

        $mineBoard.on("mousedown", ".mine", function(e){
            e.preventDefault();
            if(!v.ended){
                var $that = $(this);
                if( e.button == 2 ) { 
                    if(!($that.hasClass("open"))){
                        if($that.hasClass("flag")){
                            v.f++;
                            $that.removeClass("flag").addClass("question").empty().append('?');
                        } else if($that.hasClass("question")){
                            $that.removeClass("question").empty();
                        } else{ 
                            v.f--;
                            $that.addClass("flag").empty().append('<i class="fa fa-flag"></i>');
                        }
                    }
                } else {
                    if($that.hasClass("flag"))
                        v.f++;
                    $that.addClass("open").removeClass("flag").empty();

                    v.checkClick($that);
                }
                $flagCount.text(v.f);
            }
        });
        this.updateBoard();
    }
}

var s = new sweeper();
s.init();