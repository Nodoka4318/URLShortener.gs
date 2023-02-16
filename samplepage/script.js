const url = "https://script.google.com/macros/s/AKfycbzqBqd7Tm5rpq6D2lbZ7XH5HSyfoHwA18mNnuK7JA9PzoQ4yX9mslMAgBrdUyYmGOku/exec";
const baseurl = "https://nodoka4318.github.io/URLShortener.gs/samplepage/l.html?q="
var btn = document.getElementById("shorten_button");
var area = document.getElementById("result_area");
var urlbox = document.getElementById("urlbox");

class PostData {
    constructor(url) {
        this.url = url;
    } 
}

function getHeaders() {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
    }
}

btn.addEventListener("click", async (e) => {
    var boxtext = urlbox.value;
    if (boxtext == "") {
        alert("Invalid value");
        return;
    }

    btn.disabled = true; // 連打防止

    var result = "Some thing went wrong!";
    await fetch(url ,{
        method: "POST",
        body: JSON.stringify(new PostData(boxtext))
    }).then((response) => {
        return response.text();
    }).then((data) => {
        var code = JSON.parse(data)["code"];
        if (code != "*") {
            result = baseurl + code;
        }
    }).catch((error) => {
        result = "something went wrong!\nError: " + error;
    });

    console.log(result);
    area.textContent = result;

    btn.disabled = false;
});