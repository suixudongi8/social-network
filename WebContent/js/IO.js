﻿
function uploadAndSubmit() {
        var form = document.forms["demoForm"];
        var uploaddiv = document.getElementById("upload");

        if (form["file"].files.length > 0) {
                var file = form["file"].files[0];

                // try sending
                var reader = new FileReader();

                reader.onloadstart = function () {
                        uploaddiv.style.width = "0%";
                        uploaddiv.innerHTML = "0%";
                        console.log("onloadstart");
                }

                reader.onprogress = function (p) {
                        console.log("onprogress");
                        var percent;
                        percent = p.loaded / file.size * 100;

                        uploaddiv.style.width = percent + "%";
                        uploaddiv.innerHTML = percent + "%";
                }

                reader.onload = function () {
                        console.log("load complete");
                }

                reader.onloadend = function () {
                        if (reader.error) {
                                console.log(reader.error);
                        }
                        else {
                                var xhr;

                                if (window.XMLHttpRequest) {
                                        xhr = new XMLHttpRequest();
                                }
                                else if (window.ActiveXObject) {
                                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                                }

                                //var xhr = new XMLHttpRequest();
                                try {
                                        xhr.open(/* method */ "POST", /* target url */ "../upload?fileName=" + encodeURI(encodeURI(file.name)) /*, async, default to true */);
                                        console.log("open: " + file.name);
                                } catch (e) {
                                        warning("上传失败！");
                                        //alert("上传失败！");
                                        uploaddiv.style.width = "0%";
                                        uploaddiv.innerHTML = "0%";
                                        return;
                                }

                                //xhr.overrideMimeType("application/octet-stream");
                                try {
                                        xhr.send(reader.result);
                                } catch (e) {
                                        warning("上传失败！");
                                        //alert("上传失败！");
                                        uploaddiv.style.width = "0%";
                                        uploaddiv.innerHTML = "0%";
                                        return;
                                }

                                xhr.onreadystatechange = function () {
                                        if (xhr.readyState == 4) {
                                                //alert ("请稍等...");
                                                if (xhr.status == 200) {
                                                        success("上传成功！");
                                                        //alert("上传成功！");
                                                        console.log("upload complete");
                                                        console.log("response: " + xhr.responseText);
                                                }
                                                else {
                                                        warning("上传失败！");
                                                        //alert("上传失败！");
                                                        uploaddiv.style.width = "0%";
                                                        uploaddiv.innerHTML = "0%";
                                                }
                                        }
                                }
                        }

                }

                //reader.readAsBinaryString(file);
                //reader.readAsText(file);
                reader.readAsArrayBuffer(file);
        }
        else {
                info("请选择上传文件！");
                //alert("请选择上传文件！");
        }
}
var tipsLastTime = 2500; // 提示存在事件
function tips(msg, tColor) {
        $('#msg').text(msg).addClass(tColor);
        setTimeout(function () {
                $('#msg').text("请上传您要分析的数据：").removeClass(tColor);
        }, tipsLastTime);
}
function success(msg) { tips(msg, "green"); }
function info(msg) { tips(msg, "blue"); }
function warning(msg) { tips(msg, "yellow"); }
function danger(msg) { tips(msg, "red"); }