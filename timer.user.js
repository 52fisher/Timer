// ==UserScript==
// @name        (改)计时器掌控者|视频广告跳过|视频广告加速器
// @name:en      Timer
// @version      1.0
// @description       控制网页计时器速度|加速跳过页面计时广告|视频快进（慢放）|跳过广告|支持几乎所有网页.
// @description:en  it can hook the timer speed to change.
// @description:zh-CN  控制网页计时器速度|加速跳过页面计时广告|跳过广告|支持几乎所有网页.
// @include      *
// @require      https://greasyfork.org/scripts/372672-everything-hook/code/Everything-Hook.js?version=659315
// @author       fisher
// @match        http://*
// @match        https://*
// @run-at       document-end
// @grant        none
// ==/UserScript==

//___________________原作信息（异步维护需要重建描述信息）_____________
//  Cangshi  https://greasyfork.org/zh-CN/scripts/372673-%E8%AE%A1%E6%97%B6%E5%99%A8%E6%8E%8C%E6%8E%A7%E8%80%85-%E8%A7%86%E9%A2%91%E5%B9%BF%E5%91%8A%E8%B7%B3%E8%BF%87-%E8%A7%86%E9%A2%91%E5%B9%BF%E5%91%8A%E5%8A%A0%E9%80%9F%E5%99%A8

~ function(global) {

    var workerURLs = [];

    var generate = function() {
        return function(util) {
            // disable worker
            workerURLs.forEach(function(url) {
                if (util.urlMatching(location.href, 'http.*://.*' + url + '.*')) {
                    window['Worker'] = undefined;
                    console.log('Worker disabled');
                }
            });
            var _this = this;
            var timerHooker = {
                // 用于储存计时器的id和参数
                _intervalIds: {},
                // 计时器速率
                __percentage: 1.0,
                // 劫持前的原始的方法
                _setInterval: window['setInterval'],
                _clearInterval: window['clearInterval'],
                _setTimeout: window['setTimeout'],
                _Date: window['Date'],
                __lastDatetime: new Date().getTime(),
                __lastMDatetime: new Date().getTime(),
                videoSpeedInterval: 1000,
                /**
                 * 初始化方法
                 */
                init: function() {
                    var __this = this;
                    // 劫持循环计时器
                    _this.hookReplace(window, 'setInterval', function(setInterval) {
                        return function() {
                            // 储存原始时间间隔
                            arguments[2] = arguments[1];
                            // 获取变速时间间隔
                            arguments[1] *= __this._percentage;
                            var resultId = setInterval.apply(window, arguments);
                            // 保存每次使用计时器得到的id以及参数等
                            __this._intervalIds[resultId] = {
                                args: arguments,
                                nowId: resultId
                            };
                            return resultId;
                        };
                    });
                    // 劫持循环计时器的清除方法
                    _this.hookBefore(window, 'clearInterval', function(method, args) {
                        var id = args[0];
                        if (__this._intervalIds[id]) {
                            args[0] = __this._intervalIds[id].nowId;
                        }
                        // 清除该记录id
                        delete __this._intervalIds[id];
                    });
                    // 劫持单次计时器setTimeout
                    _this.hookBefore(window, 'setTimeout', function(method, args) {
                        args[1] *= __this._percentage;
                    });
                    var newFunc = function() {
                        if (arguments.length === 1) {
                            Object.defineProperty(this, '_innerDate', {
                                configurable: false,
                                enumerable: false,
                                value: new __this._Date(arguments[0]),
                                writable: false
                            });
                            return;
                        } else if (arguments.length > 1) {
                            Object.defineProperty(this, '_innerDate', {
                                configurable: false,
                                enumerable: false,
                                value: new __this._Date(
                                    arguments[0] || null,
                                    arguments[1] || null,
                                    arguments[2] || null,
                                    arguments[3] || null,
                                    arguments[4] || null,
                                    arguments[5] || null,
                                    arguments[6] || null
                                ),
                                writable: false
                            });
                            return;
                        }
                        var now = __this._Date.now();
                        var passTime = now - __this.__lastDatetime;
                        var hookPassTime = passTime * (1 / __this._percentage);
                        // console.log(__this.__lastDatetime + hookPassTime, now,__this.__lastDatetime + hookPassTime - now);
                        Object.defineProperty(this, '_innerDate', {
                            configurable: false,
                            enumerable: false,
                            value: new __this._Date(__this.__lastMDatetime + hookPassTime),
                            writable: false
                        });
                    };
                    _this.hookClass(window, 'Date', newFunc, '_innerDate', ['now']);
                    Date.now = function() {
                        return new Date().getTime();
                    };
                    _this.hookedToString(__this._Date.now, Date.now);
                    var objToString = Object.prototype.toString;
                    Object.prototype.toString = function() {
                        if (this instanceof __this._mDate) {
                            return '[object Date]';
                        } else {
                            return objToString.call(this);
                        }
                    };
                    _this.hookedToString(__this._setInterval, setInterval);
                    _this.hookedToString(__this._setTimeout, setTimeout);
                    _this.hookedToString(__this._clearInterval, clearInterval);
                    __this._mDate = window.Date;
                    // 设定百分比属性被修改的回调
                    Object.defineProperty(__this, '_percentage', {
                        get: function() {
                            return __this.__percentage;
                        },
                        set: function(percentage) {
                            if (percentage == __this.__percentage) {
                                return percentage;
                            }
                            __this._onChange.call(__this, percentage);
                            __this.__percentage = percentage;
                            return percentage;
                        }
                    });
                    // 界面半圆按钮点击的方法
                    window.changTime = function(anum, cnum, isa, isr) {
                        if (isr) {
                            timer.change(1);
                            return;
                        }
                        if (!timer) {
                            return;
                        }
                        var result;
                        if (!anum && !cnum) {
                            var t = prompt("输入欲改变计时器变化倍率（当前：" + 1 / __this._percentage + "）");
                            if (t == undefined) {
                                return;
                            }
                            if (isNaN(parseFloat(t))) {
                                alert("请输入正确的数字");
                                changTime();
                                return;
                            }
                            if (parseFloat(t) <= 0) {
                                alert("倍率不能小于等于0");
                                changTime();
                                return;
                            }
                            result = 1 / parseFloat(t);
                        } else {
                            if (isa && anum) {
                                if (1 / __this._percentage <= 1 && anum < 0) {
                                    return;
                                }
                                result = 1 / (1 / __this._percentage + anum);
                            } else {
                                if (cnum < 0) {
                                    cnum = 1 / -cnum
                                }
                                result = 1 / ((1 / __this._percentage) * cnum);
                            }
                        }
                        timer.change(result);
                    };
                    var style = `.timer-container{font-size:12px;-webkit-transition:all .5s;-o-transition:all .5s;transition:all .5s;left:-40px;top:20%;position:fixed;-webkit-box-sizing:border-box;box-sizing:border-box;z-index:100000;cursor:pointer}.timer-container:hover{left:-10px}.timer-container .timer-item{position:relative;width:60px;height:30px;background:#09C;color:#eee;border-radius:5px;text-align:center;line-height:30px;list-style:none;-webkit-transition:all .5s;-o-transition:all .5s;transition:all .5s;margin-left:20px;margin-top:5px}.timer-container .timer-item:hover{background:#069}.timer-container .timer-trigger{position:relative;-webkit-transition:all .5s;-o-transition:all .5s;transition:all .5s;height:40px;width:40px;opacity:.3;border-radius:100%;background:#3C9;text-align:center;line-height:40px;margin-left:30px}.timer-container:hover .timer-lists{display:block}.timer-container .timer-lists{display:none}.timer-container:hover .timer-trigger{opacity:.8}.timer-container .timer-trigger:hover{opacity:.8;background-color:#096;color:aliceblue}.timer-show-times{position:fixed;top:0;right:0;width:100%;height:100%;z-index:99999;opacity:1;font-weight:900;font-size:30px;color:#4f4f4f;background-color:rgba(0,0,0,.1)}.timer-show-times.timer-hidden{z-index:-1;opacity:0;-webkit-transition:1s all;-o-transition:1s all;transition:1s all}.timer-show-times .timer-current-times{width:80px;height:80px;border-radius:80px;background-color:rgba(127,255,212,.51);text-align:center;line-height:80px;position:absolute;top:50%;right:50%;margin-top:-40px;margin-right:-40px overflow:hidden;}`;

                    // 在页面左边添加一个半圆便于修改
                    var html = `<div class="timer-container" draggable="true"> 
                        <div class="timer-trigger" onclick="changTime()"> 
                            X ${1 / __this._percentage}   
                        </div>
                        <ul class="timer-lists"> 
                            <li class="timer-item timer-x2" onclick="changTime(2,0,true)">慢进  &gt;</li> 
                            <li class="timer-item timer-x-2" onclick="changTime(-2,0,true)">慢退  &lt;</li> 
                            <li class="timer-item timer-x4" onclick="changTime(0,4)">快进 &gt;&gt;</li> 
                            <li class="timer-item timer-x-4" onclick="changTime(0,-4)">快退 &lt;&lt;</li> 
                            <li class="timer-item timer-reset" onclick="changTime(0,0,false,true)">默认 O</li> 
                        </ul>
                        </div>
                        <div class="timer-show-times timer-hidden"> 
                            <div class="timer-current-times">X  ${1 / __this._percentage}  </div> 
                        </div>`;
                    var stylenode = document.createElement('style');
                    stylenode.setAttribute("type", "text/css");
                    if (stylenode.styleSheet) { // IE
                        stylenode.styleSheet.cssText = style;
                    } else { // w3c
                        var cssText = document.createTextNode(style);
                        stylenode.appendChild(cssText);
                    }
                    var node = document.createElement('div');
                    node.innerHTML = html;
                    window.addEventListener('load', function() {
                        document.head.appendChild(stylenode);
                        document.body.appendChild(node);
                    });
                    //增加拖拽事件
                    function drag(s) {
                        try { var obj = document.querySelectorAll(s)[0]; } catch (e) {
                            console.log('拖放功能出现问题');
                        }
                        obj.onmousedown = function(e) {

                            var e = e || arguments.callee.caller.arguments[0] || window.event; // 兼容 IE/FireFox
                            var divX = e.clientX - this.offsetLeft;
                            var divY = e.clientY - this.offsetTop;

                            if (obj.setCapture) {
                                obj.setCapture(); // 修复低版本 IE bug
                            }

                            document.onmousemove = function(e) {

                                var e = e || arguments.callee.caller.arguments[0] || window.event;

                                var disX = e.clientX - divX;
                                var disY = e.clientY - divY;
                                // 移动时重新得到物体的距离，解决拖动时出现晃动现象  
                                obj.style.top = disY + "px";
                                obj.style.left = disX + "px";
                            }
                            document.onmouseup = function() { // 鼠标抬起时不再移动  
                                // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
                                document.onmousedown = document.onmousemove = null;
                                if (obj.releaseCapture) {
                                    obj.releaseCapture(); // 修复低版本 IE bug
                                }
                            }
                        }
                    }

                    try {
                        // document.getElementsByClassName('timer-container')[0].addEventListener('mousedown', function() {
                        document.getElementsByTagName('body')[0].addEventListener('mousedown', function() {
                            drag('.timer-container');
                        })
                    } catch (e) {
                        console.log('debug: ' + document.querySelectorAll('.timer-container').length);
                    }
                    // 快捷键注册
                    window.addEventListener('keydown', function(e) {
                        switch (e.keyCode) {
                            // [=]
                            case 190:
                            case 187:
                                {
                                    if (e.ctrlKey) {
                                        // console.log('+2');
                                        changTime(2, 0, true);
                                    } else if (e.altKey) {
                                        // console.log('x4');
                                        changTime(0, 4);
                                    }
                                    break;
                                }
                                // [-]
                            case 188:
                            case 189:
                                {
                                    if (e.ctrlKey) {
                                        // console.log('-2');
                                        changTime(-2, 0, true);
                                    } else if (e.altKey) {
                                        // console.log('x-4');
                                        changTime(0, -4);
                                    }
                                    break;
                                }
                                // [0]
                            case 48:
                                {
                                    if (e.ctrlKey || e.altKey) {
                                        // console.log('reset');
                                        changTime(0, 0, false, true);
                                    }
                                    break;
                                }
                            default:
                                // console.log(e);
                        }
                    });
                },
                /**
                 * 当计时器速率被改变时调用的回调方法
                 * @param percentage
                 * @private
                 */
                _onChange: function(percentage) {
                    // 改变所有的循环计时
                    util.ergodicObject(this, this._intervalIds, function(idObj, id) {
                        idObj.args[1] = idObj.args[2] * percentage;
                        // 结束原来的计时器
                        this._clearInterval.call(window, idObj.nowId);
                        // 新开一个计时器
                        idObj.nowId = this._setInterval.apply(window, idObj.args);
                    });
                },
                /**
                 * 调用该方法改变计时器速率
                 * @param percentage
                 */
                change: function(percentage) {
                    var _this = this;
                    this.__lastMDatetime = this._mDate.now();
                    // console.log(this._mDate.toString());
                    // console.log(new this._mDate());
                    this.__lastDatetime = this._Date.now();
                    // debugger;
                    //---------------------------------//
                    this._percentage = percentage;
                    var oldNode = document.getElementsByClassName('timer-trigger');
                    var oldNode1 = document.getElementsByClassName('timer-current-times');
                    oldNode[0].innerHTML = 'X' + 1 / this._percentage;
                    oldNode1[0].innerHTML = 'X' + 1 / this._percentage;
                    var a = document.getElementsByClassName('timer-show-times')[0];
                    // console.log(a.className);
                    a.className = 'timer-show-times';
                    this._setTimeout.bind(window)(function() {
                        a.className = 'timer-show-times timer-hidden';
                    }, 100);
                    this.changeVideoSpeed();
                    this.videoSpeedIntervalId = this._setInterval.bind(window)(function() {
                        _this.changeVideoSpeed();
                        var rate = 1 / _this._percentage;
                        if (rate === 1) {
                            _this._clearInterval.bind(window)(_this.videoSpeedIntervalId);
                        }
                    }, this.videoSpeedInterval);
                },
                changeVideoSpeed: function() {
                    var rate = 1 / this._percentage;
                    rate > 16 && (rate = 16);
                    rate < 0.065 && (rate = 0.065);
                    var videos = document.querySelectorAll('video');
                    if (!videos.length) {
                        return;
                    }
                    for (var i = 0; i < videos.length; i++) {
                        videos[i].playbackRate = rate;
                    }
                }
            };
            // 默认初始化
            timerHooker.init();
            return timerHooker;
        }
    };

    if (global.eHook) {
        global.eHook.plugins({
            name: 'timer',
            /**
             * 插件装载
             * @param util
             */
            mount: generate()
        });
    }
}(window);

// ==/UserScript==