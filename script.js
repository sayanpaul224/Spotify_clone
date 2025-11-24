console.log("FUCK");
let currentSong = new Audio;
let songs;
let currfolder;

function formatTime(seconds) {
    // Drop decimals, keep only whole seconds
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as);

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`${folder}/`)[1]);   // ✅ FIX

        }
    }
    //Show all songs in playlist

    let songList = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songList.innerHTML = "";
    for (const song of songs) {
        songList.innerHTML = songList.innerHTML + `<li> 
                                <img class="invert" src="/img/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Yapper Master</div>
                                </div>
                                <div class="playNow">
                                    <span>Play Now</span>
                                    <img class="invert" src="/img/play.svg" alt="">
                                </div>
                            </li>`;
    }

    //evenlistener for music to play

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            //console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });
}

const playMusic = (track, pause = false) => {
    //let audio = new Audio("/songs/" + track);
    currentSong.src = `${currfolder}/` + track;
    if(!pause){
        currentSong.play();
        play.src = "/img/pause.svg"
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"

}

async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        // e.href is the full URL, e.g. "http://127.0.0.1:5500/songs/Bangla/"
        const url = new URL(e.href);
        const parts = url.pathname.split("/").filter(Boolean); 
        // examples:
        //  "/songs/"           -> ["songs"]
        //  "/songs/Bangla/"    -> ["songs", "Bangla"]
        //  "/songs/Phonk/"     -> ["songs", "Phonk"]

        // Only keep things that are *direct children* of /songs
        if (parts[0] === "songs" && parts.length === 2) {
            let folder = (parts[1]);   // "Bangla", "Phonk"
            //console.log(folder)
            //get metadata of folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            //console.log(response);
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" fill="rgb(0, 157, 42)" />
                                <path d="M9 7v10l8-5-8-5z" fill="black" />
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.webp" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.Description}</p>
                    </div>`
        }
    };

    //card clicked, load playlist

    Array.from(document.getElementsByClassName("card")).forEach( e=>{
        //console.log(e)                                                         //list of all folders
        e.addEventListener("click", async item=>{
            console.log(item, item.currentTarget, item.currentTarget.dataset)
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
        })
    })
}


async function main() {
    
    await getSongs("songs/Bangla"); 
    playMusic(songs[0], true)

    //display all new albyums if added

    displayalbums();

    //evenlistener for music to play or pause

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "/img/play.svg"
        }
    })

    //time update

    currentSong.addEventListener("timeupdate", () => {
        //console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //hamburger event

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left= "0";
    })

    //close event

    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%";
    })

    //prev and next

    prev.addEventListener("click",() =>{
        currentSong.pause();
        console.log("prev clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })

    next.addEventListener("click",() =>{
        currentSong.pause();
        console.log("next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    //volume control

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e =>{
        console.log("Setting volume to", e.target.value, "%");
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    //mute

    document.querySelector(".volume>img").addEventListener("click", e=>{
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg","mute.svg") 
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })


}

main();