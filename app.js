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
            src: "Resource/Song/夜に.mp3", 
            cover: "https://p2.music.126.net/3xWlqwYmfwRFebeiONUpGg==/109951164546210608.jpg?param=300x300",
            netease: "https://music.163.com/#/song?id=1409311773",
            kugou: "https://m.kugou.com/share/song.html?chain=9dZz7afFYV2"
        },
        { 
            name: "春よ、来い", 
            artist: "松任谷由実",
            src: "Resource/Song/春.mp3", 
            cover: "https://p1.music.126.net/BtkQkAkVLUjM0rzNBgVnvg==/109951167032274313.jpg?param=300x300",
            netease: "https://music.163.com/#/song?id=27566649",
            kugou: "https://m.kugou.com/share/song.html?chain=9dYrzf3FYV2"
        },
        {
            name: "Lemon",
            artist: "米津玄師",
            src: "Resource/Song/Lemon.mp3",
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

    // Photo
    // --- Photo 画廊逻辑 (修复版) ---
    const artWork = [
        { src: 'Resource/Image/placeholder1.jpg', title: '「 盛夏柠檬汽水的耳语 」', date: '2026.02.21' },
        { src: 'Resource/Image/placeholder2.jpg', title: '「 心动超负荷 」', date: '2026.02.21' },
        { src: 'Resource/Image/placeholder3.jpg', title: '「 塔卫二的晨曦 」', date: '2026.02.21' }
    ];

    let currentIndex = 0;

    // 1. 核心更新函数
    function updateGallery(index) {
        const imgBtn = document.getElementById('gallery-img');
        const titleBtn = document.getElementById('art-title');
        const dateBtn = document.getElementById('art-date');

        if (!imgBtn || !titleBtn || !dateBtn) {
            console.error("画廊元素未找到，请检查 HTML 中的 ID (art-title, art-date) 是否存在");
            return;
        }

        imgBtn.style.opacity = '0';
        imgBtn.style.transform = 'scale(1.05) translateY(5px)';

        setTimeout(() => {
            imgBtn.src = artWork[index].src;
            titleBtn.textContent = artWork[index].title;
            dateBtn.textContent = artWork[index].date;

            imgBtn.style.opacity = '1';
            
            // 修改这里：图片加载后，把 transform 设为空字符串
            // 这样它就会重新听从 CSS (包含 hover 缩放) 的话了
            imgBtn.style.transform = ''; 
        }, 400);
    }

    // 2. 直接获取按钮并绑定 (不要再包裹 DOMContentLoaded)
    const galleryNext = document.querySelector('.next-photo');
    const galleryPrev = document.querySelector('.prev-photo');

    if (galleryNext) {
        galleryNext.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % artWork.length;
            updateGallery(currentIndex);
        });
    }

    if (galleryPrev) {
        galleryPrev.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + artWork.length) % artWork.length;
            updateGallery(currentIndex);
        });
    }

    // 3. 默认加载 Index 0 (同样直接执行)
    const initialImg = document.getElementById('gallery-img');
    const initialTitle = document.getElementById('art-title');
    const initialDate = document.getElementById('art-date');

    if (initialImg && initialTitle && initialDate) {
        initialImg.src = artWork[0].src;
        initialTitle.textContent = artWork[0].title;
        initialDate.textContent = artWork[0].date;
        console.log("画廊初始数据加载成功");
    }

    // --- 8. 点击显示原图逻辑 ---
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const galleryImg = document.getElementById('gallery-img'); // 你的插画 ID

    if (galleryImg && modal) {
        // 点击画框内的图片
        galleryImg.onclick = function() {
            modal.style.display = "flex";
            modal.style.flexDirection = "column";
            modalImg.src = this.src; // 载入当前图片地址
            
            // 获取当前的标题
            const currentTitle = document.getElementById('art-title');
            if (currentTitle) {
                modalCaption.innerHTML = currentTitle.textContent;
            }
        };

        // 点击遮罩层任何地方关闭
        modal.onclick = function(e) {
            // 如果点击的是图片本身，不关闭（可选）
            // 这里设定为点击任何地方都关闭，更符合移动端习惯
            modal.style.display = "none";
        };
    }
} // 这是 init 函数的结尾

// 启动
document.addEventListener("DOMContentLoaded", init);
