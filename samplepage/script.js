const url = "https://script.google.com/macros/s/AKfycbzlfGfQRYULo1W5wdPENkf_3sR7lBynV6s7jOqDi5pfrtsw-GyW8RjgGWFIdLH-tWhV/exec";
var btn = document.getElementById("shorten_button");
var area = document.getElementById("result_area");

class PostData {
    constructor(url) {
        this.url = url;
    } 
}

btn.addEventListener("click", (e) => {
    var result = "";
    fetch(url ,{
        method: "POST",
        body: new PostData(url)
    }).then((response) => {
        if (!response.ok) {
            result = "something went wrong!";
            return;
        }
    }).then((data) => {
        result = data;
    }).then((error) => {
        result = "something went wrong!\nError: " + error;
    });

    area.textContent = result;
});