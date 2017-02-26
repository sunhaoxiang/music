$(function () {
    var viewWidth = $(window).width();
    var viewHeight = $(window).height();
    var desWidth = 640;
    var touchstart = 'touchstart';
    var touchmove = 'touchmove';
    var touchend = 'touchend';
    var id = 0;
    var index = 0;
    var oAudio = $('#audio1').get(0);

    var $main = $('#main');
    var $listContent = $('#listContent');
    var $listContentUl = $('#listContentUl');
    var $listTitle = $('#listTitle');
    var $listAudio = $('#listAudio');
    var $listAudioImg = $('#listAudioImg');
    var $listAudioText = $('#listAudioText');
    var $listAudioBtn = $('#listAudioBtn');

    var $musicDetails = $('#musicDetails');
    var $detailsTitle = $('#detailsTitle');
    var $detailsName = $('#detailsName');
    var $detailsAudioProUp = $('#detailsAudioProUp');
    var $detailsAudioProBar = $('#detailsAudioProBar');
    var $detailsNowTime = $('#detailsNowTime');
    var $detailsAllTime = $('#detailsAllTime');
    var $detailsPlay = $('#detailsPlay');
    var $detailsPrev = $('#detailsPrev');
    var $detailsNext = $('#detailsNext');
    var $detailsLyric = $('#detailsLyric');
    var $detailsLyricUl = $('#detailsLyricUl');

    function init() {  //整个项目的初始化
        device();
        musicList.init();
        musicDetails.init();
        musicAudio.init();
    }

    function device() {  //兼容PC和移动端
//                console.log(navigator.userAgent);
        var isMobile = /Mobile/i.test(navigator.userAgent);
        if (viewWidth > desWidth) {
            $main.css('width','640px');
        }
        if (!isMobile) {
            touchstart = 'mousedown';
            touchmove = 'mousemove';
            touchend = 'mouseup';
        }
    }

    var musicList = (function () {  //音乐列表操作
        var myUrl = 'http://www.shx89.com/';
        var downY = 0;  //touchstart
        var prevY = 0;  //上次Y轴坐标
        var downT = 0;  //上次滑屏的距离
        var parentH = $listContent.height();  //父容器的高
        var childH = $listContentUl.height();  //子集的高
        var onoff1 = true;  //头
        var onoff2 = true;  //尾
        var onoff3 = true;  //区分滑屏和点击
        var timer = null;
        var speed = 0;

        function init() {  //初始
            data();
            bind();
            moveScroll();
        }

        function data() {  //数据
            $.ajax({
                url : 'musicList.php',
                type : 'GET',
                dataType : 'json',
                success : function (data) {
                    $.each(data,function (i,obj) {
                        var $li = '<li musicId="'+(obj.id)+'"><h3 class="title">'+(obj.musicName)+'</h3><p class="name">'+(obj.name)+'</p></li>';
                        $listContentUl.append($li);
                    });
                    childH = $listContentUl.height();
                },
                error : function (err) {
                    console.log(err);
                }
            });
        }

        function bind() {  //事件
            /*$listTitle.on(touchstart,function(){
             window.location = myUrl;
             });*/

            $listContentUl.delegate('li',touchend,function () {
                if (onoff3) {
                    $(this).attr('class','active').siblings().attr('class','');
                    id = $(this).attr('musicId');
                    musicAudio.loadMusic(id);
                    index = $(this).index();
                }
            });

            $listAudio.on(touchstart,function () {
                if (id) {
                    musicDetails.slideUp();
                }
            });
        }

        function moveScroll() {  //滑动列表
            document.addEventListener(touchstart, function(ev) {  //阻止默认行为
                ev.preventDefault();
            }, {passive: false});

            $listContentUl.on(touchstart,function (ev) {
                if (parentH > childH) {  //判断是否需要滑屏
                    return false;
                }
                var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;  //jQuery的event先转换成js的event
                var This = this;
                downY = touch.pageY;
                prevY = touch.pageY;
                downT = $(this).position().top;
                onoff1 = true;
                onoff2 = true;
                onoff3 = true;

                clearInterval(timer);

                $(document).on(touchmove+'.move',function (ev) {
                    onoff3 = false;
                    var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                    var iTop = $(This).position().top;
                    speed = touch.pageY - prevY;
                    prevY = touch.pageY;


                    if (iTop >= 0) {  //头
                        if (onoff1) {
                            onoff1 = false;
                            downY = touch.pageY;
                        }
                        $(This).css('transform','translate3d(0,'+(touch.pageY-downY)/5+'px,0)');
                    } else if(iTop <= (parentH - childH) ) {  //尾
                        if (onoff2) {
                            onoff2 = false;
                            downY = touch.pageY;
                        }
                        $(This).css('transform','translate3d(0,'+( (touch.pageY-downY)/5+(parentH-childH) )+'px,0)');
                    } else {
                        $(This).css('transform','translate3d(0,'+(touch.pageY-downY+downT)+'px,0)');
                    }
                });

                $(document).on(touchend+'.move',function () {
                    $(this).off('.move');
                    if (!onoff3) {
                        clearInterval(timer);
                        timer = setInterval(function () {
                            var iTop = $(This).position().top;
                            if (Math.abs(speed) <= 1 || iTop > 50 || iTop < parentH-childH-50) {
                                clearInterval(timer);
                                if (iTop >=0) {
                                    $(This).css('transition','.2s');
                                    $(This).css('transform','translate3d(0,0,0)');
                                } else if (iTop <= parentH-childH) {
                                    $(This).css('transition','.2s');
                                    $(This).css('transform','translate3d(0,'+(parentH-childH)+'px,0)');
                                }
                            } else {
                                speed *=0.9;
                                $(This).css('transform','translate3d(0,'+(iTop + speed)+'px,0)');
                            }
                        },13);
                    }
                });
                return false;
            });
            $listContentUl.on('transitionend WebkitTransitionEnd',function () {
                $(this).css('transition','');
            });
        }

        function show(sName,sMusicName,sImg) {  //显示
            $listAudioImg.attr('src','img/'+sImg);
            $listAudioText.find('h3').html(sMusicName);
            $listAudioText.find('p').html(sName);
            $listAudioBtn.show();
        }

        return {
            init : init,
            show : show
        }
    }) ();

    var musicDetails = (function () {  //音乐详情页操作
        var re = /\[[^[]+/g;
        var arr = [];
        var $li = null;
        var iLiH = 0;

        function init() {  //初始
            $musicDetails.css('transform','translate3d(0,'+(viewHeight)+'px,0)');
            bind();
        }

        function slideUp() {  //向上展开
            $musicDetails.css('transition','.5s');
            $musicDetails.css('transform','translate3d(0,0,0)');
        }

        function slideDown() {  //向下收缩
            $musicDetails.css('transform','translate3d(0,'+(viewHeight)+'px,0)');
        }

        function bind() {  //事件操作
            $detailsTitle.on(touchstart,function () {
                slideDown();
            });
        }

        function show(sName,sMusicName,sLyric) {  //显示
            $detailsName.html(sMusicName+'<span>'+sName+'</span>');
            $detailsLyricUl.empty().css('transform','translate3d(0,0,0)');
            arr = sLyric.match(re);

            for (var i = 0; i < arr.length; i++) {
                arr[i] = [formatTime(arr[i].substring(0,10)) , arr[i].substring(10).trim()];
            }

            for (var i = 0; i < arr.length; i++) {
                $detailsLyricUl.append('<li>'+arr[i][1]+'</li>');
            }

            $li = $detailsLyricUl.find('li');
            $li.first().attr('class','active');
            iLiH = $li.first().outerHeight(true);
        }

        function formatTime(num) {  //格式化日期
            num = num.substring(1,num.length-1);
            var arr = num.split(':');
            return (parseFloat(arr[0]*60) + parseFloat(arr[1])).toFixed(2);
        }

        function scrollLyric(ct) {  //滚动歌词
            for (var i = 0; i < arr.length; i++) {
                if (i != arr.length - 1 && ct > arr[i][0] && ct < arr[i+1][0]) {
                    $li.eq(i).attr('class','active').siblings().attr('class','');
                    if (i > 3) {
                        $detailsLyricUl.css('transform','translate3d(0,'+(-iLiH*(i-3))+'px,0)');
                    } else {
                        $detailsLyricUl.css('transform','translate3d(0,0,0)');
                    }
                } else if (i == arr.length - 1 && ct > arr[i][0]) {
                    $li.eq(i).attr('class','active').siblings().attr('class','');
                    $detailsLyricUl.css('transform','translate3d(0,'+(-iLiH*(i-3))+'px,0)');
                }
            }
        }

        return {
            init : init,
            slideUp : slideUp,
            show : show,
            scrollLyric : scrollLyric
        }

    }) ();

    var musicAudio = (function () {  //音乐播放器操作
        var onoff = true;
        var timer = null;
        var scale = 0;
        var disX = 0;
        var parentW = $detailsAudioProBar.parent().width();

        function init() {  //初始
            bind();
        }

        function loadMusic(id) {  //载入音乐
            $.ajax({
                url : 'musicAudio.php',
                type : 'GET',
                dataType : 'json',
                data : { id : id},
                async : false,  //同步，兼容Safari自动播放
                success : function (data) {
                    show(data);
                },
                err : function (err) {
                    console(err);
                }
            })
        }

        function show(obj) {  //显示
            var sName = obj.name;
            var sMusicName = obj.musicName;
            var sLyric = obj.lyric;
            var sImg = obj.img;
            var sAudio = obj.audio;

            musicList.show(sName,sMusicName,sImg);
            musicDetails.show(sName,sMusicName,sLyric);
            oAudio.src = 'img/'+sAudio;
            play();

            $(oAudio).one('canplaythrough',function () {
                $detailsAllTime.html( formatTime(oAudio.duration) );
            });

            $(oAudio).one('ended',function () {
                next();
            });
        }

        function play() {  //播放
            onoff = false;
            $listAudioImg.addClass('move');
            $listAudioBtn.css('backgroundImage','url(img/list_audioPause.png)');
            $detailsPlay.css('backgroundImage','url(img/details_pause.png)');
            oAudio.play();
            playing();
            clearInterval(timer);
            timer = setInterval(playing,1000);
        }

        function pause() {  //暂停
            onoff = true;
            $listAudioImg.removeClass('move');
            $listAudioBtn.css('backgroundImage','url(img/list_audioPlay.png)');
            $detailsPlay.css('backgroundImage','url(img/details_play.png)');
            oAudio.pause();
            clearInterval(timer);
        }

        function bind() {  //事件
            $listAudioBtn.add($detailsPlay).on(touchstart,function () {
                if (onoff) {
                    play();
                } else {
                    pause();
                }
                return false;
            });

            $detailsAudioProBar.on(touchstart,function (ev) {
                var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                var This = this;
                disX = touch.pageX - $(this).position().left;
                clearInterval(timer);

                $(document).on(touchmove+'.move',function (ev) {
                    var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                    var L = touch.pageX - disX;

                    if (L <= 0) {
                        L = 0;
                    } else if (L > parentW) {
                        L = parentW;
                    }

                    $(This).css('left',L);
                    scale = L / parentW;
                });

                $(document).on(touchend+'.move',function () {
                    $(this).off('.move');
                    oAudio.currentTime = scale * oAudio.duration;
                    playing();
                    clearInterval(timer);
                    timer = setInterval(playing,1000);
                });

                return false;
            });

            $detailsPrev.on(touchstart,function () {
                prev();
            });

            $detailsNext.on(touchstart,function () {
                next();
            });
        }

        function formatTime(num) {  //时间格式化
            num = parseInt(num);
            var iM = Math.floor(num%3600/60);
            var iS = Math.floor(num%60);
            return toZero(iM) + ':' + toZero(iS);
        }

        function toZero(num) {  //补零
            if (num < 10) {
                return '0'+num;
            } else {
                return ''+num;
            }
        }

        function playing() {  //播放进行中
            scale = oAudio.currentTime / oAudio.duration;
            $detailsNowTime.html( formatTime(oAudio.currentTime) );
            $detailsAudioProUp.css('width',scale * 100 + '%');
            $detailsAudioProBar.css('left',scale * 100 + '%');
            musicDetails.scrollLyric(oAudio.currentTime);
        }

        function next() {  //下一首歌
            var $li = $listContentUl.find('li');
            index = index == $li.length - 1 ? 0 : index + 1;
            id = $li.eq(index).attr('musicId');
            $li.eq(index).attr('class','active').siblings().attr('class','');
            loadMusic(id);
        }

        function prev() {  //上一首歌
            var $li = $listContentUl.find('li');
            index = index == 0 ? $li.length - 1 : index - 1;
            id = $li.eq(index).attr('musicId');
            $li.eq(index).attr('class','active').siblings().attr('class','');//.
            loadMusic(id);
        }

        return {
            init : init,
            loadMusic : loadMusic
        }
    }) ();

    init();
});