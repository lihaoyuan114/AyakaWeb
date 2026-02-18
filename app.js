const kuronekoModel = "Resource/Live2D/黑猫/黑猫.model3.json";

async function init() {
    const canvas = document.getElementById('live2d-canvas');
    let targetSmile = 0.5;

    const app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        transparent: true,
        backgroundAlpha: 0,
        // 修改：这里给足空间，和 CSS 保持比例一致
        width: 700, 
        height: 900,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true
    });

    // 使用 try-catch 捕获可能的路径错误
    try {
        const model = await PIXI.live2d.Live2DModel.from(kuronekoModel);
        
        app.stage.addChild(model);

        // 这里的缩放比例 0.12 可能会让猫非常小或非常大
        // 建议先设为 0.2 看看位置
        model.scale.set(0.11);

        // 重点：不要在加载前计算 model.width，直接给个固定坐标测试
        model.x = -20;
        model.y = 50;

        // 监听每帧更新
        document.querySelector('.panels-column').addEventListener('mouseenter', () => targetSmile = 1);
        document.querySelector('.panels-column').addEventListener('mouseleave', () => targetSmile = 0.5);

        app.ticker.add(() => {
            if (model.internalModel && model.internalModel.coreModel) {
                // 增加一个平滑过渡效果（线性插值）
                const currentSmile = model.internalModel.coreModel.getParameterValueById('ParamMouthForm');
                const nextSmile = currentSmile + (targetSmile - currentSmile) * 0.1;
                
                model.internalModel.coreModel.setParameterValueById('ParamMouthForm', nextSmile);
            }
        }, PIXI.UPDATE_PRIORITY.LOW);

    } catch (error) {
        console.error("无法加载模型，请确认路径是否正确:", error);
    }

    window.addEventListener('scroll', function() {
        const overlay = document.getElementById('glass-overlay');
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        // 当滚动到 0.8 倍屏幕高度时开始明显模糊，到 1.5 倍时达到最大值
        // 你可以根据猫出现的位置调整这些数值
        let blurValue = Math.min(scrollY / (vh * 0.8) * 15, 10); 
        let opacityValue = Math.min(scrollY / (vh * 0.8) * 0.2, 0.3);

        overlay.style.backdropFilter = `blur(${blurValue}px)`;
        overlay.style.webkitBackdropFilter = `blur(${blurValue}px)`;
        overlay.style.background = `rgba(255, 255, 255, ${opacityValue})`;
    });
}

init();