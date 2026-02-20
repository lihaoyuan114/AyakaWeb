const kuronekoModel = "Resource/Live2D/黑猫/黑猫.model3.json";

async function init() {
    // --- 1. 获取所有 DOM 元素 ---
    const canvas = document.getElementById('live2d-canvas');
    const overlay = document.getElementById('glass-overlay');
    const audio = document.querySelector("#main-audio");
    const playBtn = document.querySelector("#play-btn");
    const nextBtn = document.querySelector("#next-btn");
    const prevBtn = document.querySelector("#prev-btn");
    const progressBar = document.querySelector(".progress-bar");
    const progressFill = document.querySelector(".progress-fill");
    const pawHandle = document.querySelector(".paw-handle");
    const container = document.querySelector(".player-container");

    // --- 2. 歌单配置 ---
    const musicList = [
        { 
            name: "打上花火", 
            artist: "Daoko,米津玄師", 
            // 修复为 https 接口
            src: "https://music.163.com/song/media/outer/url?id=496869422.mp3", 
            cover: "https://p1.music.126.net/ZUCE_1Tl_hkbtamKmSNXEg==/109951163009282836.jpg?param=300x300",
            netease: "https://music.163.com/#/song?id=496869422",
            kugou: "https://m.kugou.com/share/song.html?chain=9dU0N42FYV2"
        },
        { 
            name: "夜に駆ける", 
            artist: "YOASOBI",
            src: "https://cn-gddg-ct-01-12.bilivideo.com/upgcxcode/61/80/293298061/293298061_nb2-1-16.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&gen=playurlv3&os=bcache&og=cos&trid=00002b5124ab27f942d687e336320e0b509h&oi=1782024106&mid=0&nbs=1&uipk=5&deadline=1771604789&platform=html5&upsig=9efcd4246a121e075ed072522cd4594c&uparams=e,gen,os,og,trid,oi,mid,nbs,uipk,deadline,platform&cdnid=61312&bvc=vod&nettype=0&bw=291037&build=0&dl=0&f=h_0_0&agrr=0&buvid=&orderid=0,1", 
            cover: "https://p2.music.126.net/3xWlqwYmfwRFebeiONUpGg==/109951164546210608.jpg?param=300x300",
            netease: "https://music.163.com/#/song?id=1409311773",
            kugou: "https://m.kugou.com/share/song.html?chain=9dZz7afFYV2"
        },
        { 
            name: "春よ、来い", 
            artist: "松任谷由実",
            src: "https://cn-gddg-ct-01-10.bilivideo.com/upgcxcode/16/78/953327816/953327816-1-16.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&oi=1782024106&platform=html5&og=hw&mid=0&deadline=1771604968&nbs=1&trid=0000d55ebbed721d4133b7af42b21e6cb49h&gen=playurlv3&os=bcache&uipk=5&upsig=42dd92ded6c19e97f40bf344e722ea3d&uparams=e,oi,platform,og,mid,deadline,nbs,trid,gen,os,uipk&cdnid=61310&bvc=vod&nettype=0&bw=406669&build=0&dl=0&f=h_0_0&agrr=0&buvid=&orderid=0,1", 
            cover: "https://p1.music.126.net/BtkQkAkVLUjM0rzNBgVnvg==/109951167032274313.jpg?param=300x300",
            netease: "https://music.163.com/#/song?id=27566649",
            kugou: "https://m.kugou.com/share/song.html?chain=9dYrzf3FYV2"
        },
        {
            name: "Lemon",
            artist: "米津玄師",
            src: "https://cn-gddg-ct-01-10.bilivideo.com/upgcxcode/77/91/1029159177/1029159177_nb3-1-16.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&oi=2672555743&platform=html5&uipk=5&trid=000067fe5273b6644666b92f4d3a945e4fah&deadline=1771605048&os=bcache&nbs=1&mid=0&gen=playurlv3&og=ali&upsig=1838bf86ffb64ac21137054e972d3707&uparams=e,oi,platform,uipk,trid,deadline,os,nbs,mid,gen,og&cdnid=61310&bvc=vod&nettype=0&bw=135294&agrr=0&buvid=&build=0&dl=0&f=h_0_0&orderid=0,1",
            cover: "https://p1.music.126.net/jtPZRUFrSS-nRCjW_LYowQ==/109951166521931227.jpg?param=300x300",
            netease: "https://music.163.com/#/song?id=536622304",
            kugou: "https://m.kugou.com/share/song.html?chain=9eop91aFYV2"
        },
        {
            name: "ワールドイズマイン (Anime ver.) [CPK! Remix]",
            artist: "ryo (supercell)",
            src: "https://music.163.com/song/media/outer/url?id=3340107499.mp3",
            cover: "https://p1.music.126.net/otpQWO3_SYzNe7F7wLwbdA==/109951172602512218.jpg?param=300x300",
            netease: "https://music.163.com/#/song?id=3340107499",
            kugou: "https://m.kugou.com/share/song.html?chain=9eD4B82FYV2"
        }
    ];

    let musicIndex = 0;
    let targetSmile = 0.5;

    // --- 3. 辅助函数 ---
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        let min = Math.floor(seconds / 60);
        let sec = Math.floor(seconds % 60);
        return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
    }

    function loadMusic(index) {
        const song = musicList[index];
        document.querySelector("#song-title").innerText = song.name;
        document.querySelector("#artist-name").innerText = song.artist;
        document.querySelector("#current-cover").src = song.cover;
        audio.src = song.src;

        // 动态更新链接按钮
        const neteaseBtn = document.querySelector("#link-netease");
        const kugouBtn = document.querySelector("#link-kugou");
        if (neteaseBtn) neteaseBtn.href = song.netease || "#";
        if (kugouBtn) kugouBtn.href = song.kugou || "#";

        // 重置进度条UI
        if (progressFill) progressFill.style.width = "0%";
        if (pawHandle) pawHandle.style.left = "0%";
    }

    function togglePlay() {
        if (audio.paused) {
            audio.play().then(() => {
                container.classList.add("playing");
                playBtn.innerText = "⏸";
            }).catch(e => console.log("播放被拦截，等待交互"));
        } else {
            audio.pause();
            container.classList.remove("playing");
            playBtn.innerText = "▶";
        }
    }

    // --- 4. 播放器事件监听 ---
    playBtn.addEventListener("click", togglePlay);

    // 切换下一首
    nextBtn.addEventListener("click", () => {
        musicIndex = (musicIndex + 1) % musicList.length;
        loadMusic(musicIndex);
        // 如果当前是播放状态，切歌后直接播放
        if (container.classList.contains("playing")) {
            audio.play();
        } else {
            togglePlay(); // 也可以设定为切歌即播放
        }
    });

    // 切换上一首
    prevBtn.addEventListener("click", () => {
        musicIndex = (musicIndex - 1 + musicList.length) % musicList.length;
        loadMusic(musicIndex);
        if (container.classList.contains("playing")) {
            audio.play();
        } else {
            togglePlay();
        }
    });

    // 元数据加载完毕显示总时长
    audio.onloadedmetadata = function() {
        document.querySelector("#total-time").innerText = formatTime(audio.duration);
    };

    // 播放进度更新 (联动猫爪)
    audio.ontimeupdate = () => {
        const current = audio.currentTime;
        const duration = audio.duration;
        if (duration) {
            const percent = (current / duration) * 100;
            if (progressFill) progressFill.style.width = percent + "%";
            if (pawHandle) pawHandle.style.left = percent + "%";
            document.querySelector("#current-time").innerText = formatTime(current);
        }
    };

    // 进度条点击跳转
    if (progressBar) {
        progressBar.addEventListener("click", (e) => {
            const width = progressBar.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            if (duration) {
                audio.currentTime = (clickX / width) * duration;
            }
        });
    }

    // 自动播放下一首
    audio.onended = () => nextBtn.click();

    // --- 5. 初始化加载 ---
    loadMusic(musicIndex);

    // --- 6. Live2D 初始化 ---
    const app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        transparent: true,
        backgroundAlpha: 0,
        width: 700, 
        height: 900,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true
    });

    try {
        const model = await PIXI.live2d.Live2DModel.from(kuronekoModel);
        app.stage.addChild(model);
        model.scale.set(0.11);
        model.x = -20;
        model.y = 50;

        // 嘴型交互监听
        const panelColumn = document.querySelector('.panels-column');
        if (panelColumn) {
            panelColumn.addEventListener('mouseenter', () => targetSmile = 1);
            panelColumn.addEventListener('mouseleave', () => targetSmile = 0.5);
        }

        app.ticker.add(() => {
            if (model.internalModel && model.internalModel.coreModel) {
                const currentSmile = model.internalModel.coreModel.getParameterValueById('ParamMouthForm');
                const nextSmile = currentSmile + (targetSmile - currentSmile) * 0.1;
                model.internalModel.coreModel.setParameterValueById('ParamMouthForm', nextSmile);
            }
        });
    } catch (error) {
        console.error("Live2D 加载失败:", error);
    }

    // --- 7. 背景滚动模糊效果 ---
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        let blurValue = Math.min(scrollY / (vh * 0.8) * 15, 10); 
        let opacityValue = Math.min(scrollY / (vh * 0.8) * 0.2, 0.3);

        if(overlay) {
            overlay.style.backdropFilter = `blur(${blurValue}px)`;
            overlay.style.webkitBackdropFilter = `blur(${blurValue}px)`;
            overlay.style.background = `rgba(255, 255, 255, ${opacityValue})`;
        }
    });
}

// 启动
document.addEventListener("DOMContentLoaded", init);