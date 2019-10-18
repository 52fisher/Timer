# Timer
## 改动/diff
因异步维护需要，此脚本对部分内容进行了修改


- 添加拖放支持 draggable support
- 修复hover事件造成的元素触发问题 hover fixed
- UI改进，不遮挡页面元素ui fixed
- 添加https页面支持 https support

>
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


## 感谢声明

原作者：Cangshi

使用时，原作者未添加 许可协议

原作信息

>
    //___________________原作信息（异步维护需要重建描述信息）_____________
    // ==UserScript==
    // @name        计时器掌控者|视频广告跳过|视频广告加速器
    // @name:en      TimerHooker
    // @name:zh-CN   计时器掌控者|视频广告跳过|视频广告加速器
    // @namespace    https://gitee.com/HGJing/everthing-hook/
    // @version      0.3.0003
    // @description       控制网页计时器速度|加速跳过页面计时广告|视频快进（慢放）|跳过广告|支持几乎所有网页.
    // @description:en  it can hook the timer speed to change.
    // @description:zh-CN  控制网页计时器速度|加速跳过页面计时广告|跳过广告|支持几乎所有网页.
    // @include      *
    // @require      https://greasyfork.org/scripts/372672-everything-hook/code/Everything-Hook.js?version=659315
    // @author       Cangshi
    // @match        http://*/*
    // @run-at       document-start
    // @grant        none
    // ==/UserScript==