const $ = (x) => document.querySelector(x);
const $$ = (x) => document.querySelectorAll(x);
const esc = (x) => {
    const txt = document.createTextNode(x);
    const p = document.createElement("p");
    p.appendChild(txt);
    return p.innerHTML;
};
let base = null

let allTags = [];


function updateURL(tags) {
    const url = new URL(window.location.href);
    url.searchParams.set("tags", tags.join(","));
    window.history.pushState({}, "", url);
}

function initTagsFromURL() {
    const url = new URL(window.location.href);
    const tags = url.searchParams.get("tags");
    const $tags = $("#tag-container");
    if (tags) {
        let t = tags.split(",");
        allTags = t;
        t.forEach((value) => {
            const tag = document.createElement("div");
            tag.id = "tag";
            tag.innerHTML = `<p><span>${esc(value)}</span> ×</p>`;
            tag.style = "cursor: pointer";

            tag.onclick = () => {
                tag.remove();
                allTags = allTags.filter((x) => x !== tag.getElementsByTagName("span")[0].innerText);
                updateURL(allTags);
            };
            $tags.appendChild(tag);
        });
    }
}


async function getPeopleOnline() {
    const onlineppl = document.getElementById('online');
    const res = await fetch("/online");
    if (!res.ok) {
        return console.error("Couldn't fetch GET /online");
    }
    const { online } = await res.json();
    

    onlineppl.innerText = `🟢 Online: ${online}`; 
}


await getPeopleOnline();
