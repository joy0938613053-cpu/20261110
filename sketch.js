const STOP_FRAME_COUNT = 10; // 設定待機精靈圖中的動畫影格數量
const WALK_FRAME_COUNT = 9; // 設定走路精靈圖中的動畫影格數量
const MAGIC_FRAME_COUNT = 4; // 設定施法精靈圖中的動畫影格數量
const EFFECT_FRAME_COUNT = 5; // 設定魔法特效精靈圖中的動畫影格數量
const FRAME_DURATION = 100; // 設定每個影格顯示的毫秒數
let stopSprite; // 宣告角色待機精靈圖變數
let walkSprite; // 宣告角色走路精靈圖變數
let magicSprite; // 宣告角色施法精靈圖變數
let effectSprite; // 宣告魔法飛行特效精靈圖變數
let characterX = 0; // 記錄角色目前的水平位置
let facingLeft = false; // 記錄角色目前是否朝向左方
let isCasting = false; // 記錄角色是否正在播放施法動畫
let castStartedAt = 0; // 記錄施法動畫開始的時間
let castFacingLeft = false; // 記錄施法開始時角色面向的方向
let spaceReady = true; // 記錄空白鍵是否已放開並可再次觸發
let effectActive = false; // 記錄畫布上是否有移動中的魔法特效
let effectX = 0; // 記錄魔法特效目前的水平位置
let effectY = 0; // 記錄魔法特效目前的垂直位置
let effectDirection = 1; // 記錄魔法特效的移動方向

function preload() { // 在畫布啟動前載入角色圖片
  stopSprite = loadImage("1/stop/all.png"); // 載入角色一的十格待機精靈圖
  walkSprite = loadImage("1/walk/all.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/ALL.png"); // 載入角色一的四格施法精靈圖
  effectSprite = loadImage("1/魔法特效/ALL.png"); // 載入五格魔法飛行特效精靈圖
} // 結束圖片預載函式

function setup() { // 初始化全螢幕畫布
  createCanvas(windowWidth, windowHeight); // 建立與視窗同寬高的畫布
  imageMode(CORNER); // 使用圖片左上角作為繪製座標
  frameRate(60); // 設定畫布更新率以保持動畫流暢
  const stopFrameWidth = stopSprite.width / STOP_FRAME_COUNT; // 計算待機精靈圖單格寬度
  const stopScaleFactor = min((height * 0.48) / stopSprite.height, (width * 0.42) / stopFrameWidth); // 依畫布尺寸計算待機角色比例
  characterX = width * (2 / 3) - (stopFrameWidth * stopScaleFactor) / 2; // 將角色初始中心放在畫布寬度的三分之二處
} // 結束畫布初始化函式

function draw() { // 每次畫布更新時繪製背景與角色
  background("#148b91"); // 使用藍綠色填滿畫布背景
  const movingRight = !isCasting && keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW); // 判斷施法以外是否只按住右方向鍵
  const movingLeft = !isCasting && keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW); // 判斷施法以外是否只按住左方向鍵
  const isWalking = movingRight || movingLeft; // 判斷角色目前是否正在走路
  const characterSprite = isCasting ? magicSprite : isWalking ? walkSprite : stopSprite; // 依狀態選擇施法、走路或待機精靈圖
  const frameCount = isCasting ? MAGIC_FRAME_COUNT : isWalking ? WALK_FRAME_COUNT : STOP_FRAME_COUNT; // 取得目前角色動畫的影格數量
  const frameWidth = characterSprite.width / frameCount; // 計算目前精靈圖單格的寬度
  const frameHeight = characterSprite.height; // 取得目前精靈圖單格的高度
  const scaleFactor = min((height * 0.48) / frameHeight, (width * 0.42) / frameWidth); // 依畫布高寬等比放大或縮小角色
  const displayWidth = frameWidth * scaleFactor; // 計算角色顯示寬度
  const displayHeight = frameHeight * scaleFactor; // 計算角色顯示高度
  if (movingRight) facingLeft = false; // 按下右鍵時讓角色面向右方
  if (movingLeft) facingLeft = true; // 按下左鍵時讓角色面向左方
  const movementSpeed = max(2, width * 0.012); // 依畫布寬度設定角色移動速度
  if (movingRight) characterX += movementSpeed; // 按住右鍵時持續向右移動
  if (movingLeft) characterX -= movementSpeed; // 按住左鍵時持續向左移動
  characterX = constrain(characterX, 0, max(0, width - displayWidth)); // 限制角色不超出畫布左右邊界
  const positionY = height - displayHeight; // 將角色圖片底端貼齊畫布底端
  const elapsedCastTime = millis() - castStartedAt; // 計算施法動畫已播放的時間
  const frameIndex = isCasting ? min(floor(elapsedCastTime / FRAME_DURATION), MAGIC_FRAME_COUNT - 1) : floor(millis() / FRAME_DURATION) % frameCount; // 施法影格只播放一次，其餘動畫循環播放
  const sourceX = frameIndex * frameWidth; // 計算目前影格在精靈圖中的水平位置
  const effectFrameWidth = effectSprite.width / EFFECT_FRAME_COUNT; // 計算魔法特效精靈圖單格寬度
  const effectScaleFactor = min((height * 0.07) / effectSprite.height, (width * 0.22) / effectFrameWidth); // 依畫布尺寸調整魔法特效大小
  const effectDisplayWidth = effectFrameWidth * effectScaleFactor; // 計算魔法特效單格顯示寬度
  const effectDisplayHeight = effectSprite.height * effectScaleFactor; // 計算魔法特效顯示高度
  if (effectActive) { // 更新並繪製已發射的魔法特效
    effectX += effectDirection * movementSpeed * 1.8; // 讓魔法特效朝角色面向的方向前進
    if (effectX > width || effectX + effectDisplayWidth < 0) effectActive = false; // 特效完全離開畫布時將其移除
    if (effectActive) { // 確認特效仍在畫布範圍內再繪製
      const effectFrameIndex = floor(millis() / FRAME_DURATION) % EFFECT_FRAME_COUNT; // 循環選取魔法特效動畫影格
      const effectSourceX = effectFrameIndex * effectFrameWidth; // 計算特效影格在精靈圖中的水平位置
      push(); // 儲存目前畫布繪圖狀態
      if (effectDirection < 0) { // 判斷特效是否朝畫面左側移動
        translate(effectX + effectDisplayWidth, effectY); // 將繪圖原點移至特效右上角
        scale(-1, 1); // 水平翻轉特效使其朝向左側
        image(effectSprite, 0, 0, effectDisplayWidth, effectDisplayHeight, effectSourceX, 0, effectFrameWidth, effectSprite.height); // 繪製朝左移動的特效影格
      } else { // 處理特效朝畫面右側移動的繪製方式
        image(effectSprite, effectX, effectY, effectDisplayWidth, effectDisplayHeight, effectSourceX, 0, effectFrameWidth, effectSprite.height); // 繪製朝右移動的特效影格
      } // 結束特效方向判斷
      pop(); // 還原畫布繪圖狀態
    } // 結束特效範圍檢查
  } // 結束移動中特效更新
  push(); // 儲存目前畫布繪圖狀態
  if (facingLeft) { // 判斷角色是否需要朝左繪製
    translate(characterX + displayWidth, positionY); // 將繪圖原點移至角色右上角
    scale(-1, 1); // 水平翻轉畫布使角色面向左方
    image(characterSprite, 0, 0, displayWidth, displayHeight, sourceX, 0, frameWidth, frameHeight); // 繪製翻轉後的角色動畫影格
  } else { // 處理角色面向右方的繪製方式
    image(characterSprite, characterX, positionY, displayWidth, displayHeight, sourceX, 0, frameWidth, frameHeight); // 繪製正常方向的角色動畫影格
  } // 結束角色方向判斷
  pop(); // 還原畫布繪圖狀態
  if (isCasting && elapsedCastTime >= MAGIC_FRAME_COUNT * FRAME_DURATION) { // 確認四格施法動畫已完整播放
    isCasting = false; // 結束施法狀態並切回一般角色動畫
    effectActive = true; // 啟動魔法飛行特效
    effectDirection = castFacingLeft ? -1 : 1; // 依施法時的面向設定特效移動方向
    effectX = castFacingLeft ? characterX + displayWidth * 0.12 - effectDisplayWidth : characterX + displayWidth * 0.88; // 將特效放在角色面向的一側
    effectY = positionY + displayHeight * 0.36; // 將特效對準角色上半身位置
  } // 結束施法並生成特效
} // 結束每幀繪製函式

function keyPressed() { // 處理鍵盤按下事件
  if (keyCode === 32 && spaceReady) { // 確認按下可觸發的空白鍵
    spaceReady = false; // 避免長按空白鍵重複觸發施法
    if (!isCasting && !effectActive) { // 僅在沒有施法或飛行特效時開始施法
      isCasting = true; // 啟動施法動畫
      castStartedAt = millis(); // 記錄施法動畫開始時間
      castFacingLeft = facingLeft; // 記錄施法時角色的面向
    } // 結束施法觸發條件
    return false; // 阻止空白鍵造成瀏覽器頁面捲動
  } // 結束空白鍵按下判斷
} // 結束鍵盤按下事件

function keyReleased() { // 處理鍵盤放開事件
  if (keyCode === 32) spaceReady = true; // 放開空白鍵後允許下次施法
} // 結束鍵盤放開事件

function windowResized() { // 在瀏覽器視窗尺寸改變時重新調整畫布
  resizeCanvas(windowWidth, windowHeight); // 讓畫布繼續填滿整個視窗
  characterX = constrain(characterX, 0, max(0, width - stopSprite.width / STOP_FRAME_COUNT)); // 調整角色位置避免視窗變窄後超出畫布
} // 結束視窗尺寸更新函式
