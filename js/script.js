
let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`/${folder}/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;

    let as = div.getElementsByTagName("a")
    songs = []

    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            let cleanName = decodeURIComponent(element.href)
                .split("/").pop()
                .split("\\").pop()

            songs.push(cleanName)
        }
    }


    let songsUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songsUL.innerHTML = ""
    for (const song of songs) {
        songsUL.innerHTML += `<li data-song="${song}">
                                <img class="invert" src="img/music.svg" alt="music">
                                <div class="info">
                                    <div>${decodeURIComponent(song)}</div>
                                    <div></div>

                                </div>
                                <div class="playNow">
                                    <span>Play now</span>
                                    <img class="invert" src="img/play.svg" alt="">
                                </div> </li>`;
    }

    // event listener to each song 
    Array.from(document.querySelectorAll(".songlist li")).forEach(li => {
        li.addEventListener("click", () => {
            let song = li.dataset.song
            playMusic(song)
        })
    })



    return songs
}



const playMusic = (track, pause = false) => {

    if (!track) {
        console.error("Track undefined");
        return;
    }

    currentIndex = songs.indexOf(track);

    currentSong.src = `/${currFolder}/` + encodeURIComponent(track);

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track;


    // document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        let raw = decodeURIComponent(e.href);
        if (raw.includes("songs") && !raw.includes(".htaccess")) {

            let cleanHref = decodeURIComponent(e.href).replaceAll("\\", "/");
            let folder = cleanHref.split("/").filter(Boolean).slice(-1)[0];

            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}



async function main() {

    songs = await getSongs("songs/cs");
    playMusic(songs[0], true)

    //Display all the albums
    await displayAlbums();


    // event listener to play, previous and next
    play.addEventListener("click", (e) => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //event to time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    }
    )

    //event on seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    }
    )

    //event on hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    }
    )

    //event for close 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    }
    )

    //even on previous and next
    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1]);
        }
    });

    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1]);
        }
    });

    //event on  volume
    document.querySelector(".range").getElementsByTagName('input')[0].addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    }
    )

    //load the plalist whenever card is clicked
    document.querySelector(".cardContainer").addEventListener("click", async (e) => {
        let card = e.target.closest(".card");
        if (card && card.dataset.folder) {
            let folder = card.dataset.folder;
            songs = await getSongs(`songs/${folder}`)
        }
    });

    //Add event listener to mute
    document.querySelector(".volume>img").addEventListener("click",(e) => {
      console.log(e.target)
      if (e.target.src.includes("volume.svg")) {
        e.target.src= e.target.src.replace("volume.svg","mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName('input')[0].value="0"
      }
      else{
        e.target.src=  e.target.src.replace("mute.svg","volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName('input')[0].value="10"
      }
    }
    )

}

main()