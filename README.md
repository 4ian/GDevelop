<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>เกมถามแฟน ❤️</title>
<style>
body{
    font-family: sans-serif;
    text-align:center;
    background:#ffe6f2;
    padding-top:100px;
}
button{
    padding:10px 20px;
    font-size:20px;
    margin:10px;
    cursor:pointer;
}
#result{
    font-size:24px;
    color:red;
    margin-top:20px;
}
</style>
</head>
<body>

<h1>❤️ เกมถามแฟน ❤️</h1>
<h2>ที่รัก รักเค้าไหม?</h2>

<button onclick="love()">รัก ❤️</button>
<button id="noBtn" onmouseover="moveBtn()">ไม่รัก 💔</button>

<div id="result"></div>

<script>
function love(){
    document.getElementById("result").innerHTML =
    "เย้! เค้าก็รักเธอเหมือนกัน ❤️🥰";
}

function moveBtn(){
    let btn = document.getElementById("noBtn");
    btn.style.position = "absolute";
    btn.style.left = Math.random()*80 + "%";
    btn.style.top = Math.random()*80 + "%";
}
</script>

</body>
</html>
