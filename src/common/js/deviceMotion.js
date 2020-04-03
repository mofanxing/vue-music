function setDevice(callBack, errCallBack) {
    if (!window.DeviceMotionEvent) {
       errCallBack&&errCallBack('抱歉，您的设备不支持该功能！')
        return
    } 
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then((permissionState) => {
            if (permissionState === 'granted') {
                window.addEventListener('devicemotion', callBack)
            } else {
                errCallBack&&errCallBack('请同意权限使用，否则将无法使用该功能！')
            }
        }).cath((err) => {
            errCallBack&&errCallBack(err)
        })
    } else {
        let timer = setTimeout(function() {
            errCallBack&&errCallBack('请开启您的设备动作与方向权限')
        },1000)
        window.addEventListener('devicemotion', () => {
            clearTimeout(timer)
        },{once:true})
        window.addEventListener('devicemotion', callBack)
    }

}

function getIos() {
    let u = window.navigator.userAgent
    return !!u.match(/\(i[^;]+;(U;)? CPU.+Mac OS X/)
}



//节流函数
function throttle(fn, interval = 200, start = true) {
    if (typeof fn !== 'function') {
        return console.error('请传入一个函数')
    }
    let timer = 0
    return function(...arg) {
        let _this = this
        if (timer) {
            return
        }
        start && fn.apply(_this, arg)
        timer = setTimeout(() => {
            (!start) && fn.apply(_this, arg)
            timer = 0
        }, interval)
    }
}

export  function addShake(callBack) {
    const maxRange = 60
    const minRange = 10
    let lastX = 0
    let lastY = 0
    let lastZ = 0
    let isShake = false
    function toShake() {
        let motion = e.acceleration
        let { x, y, z } = motion
        if (!getIos()) {
            x = -x
            y = -y
            z = -z
        }
        let range = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ)
        if (range > maxRange) {
            isShake = true
        } else if(range < minRange && isShake) {
            callBack&&callBack(e)
        }
        lastX = x
        lastY = y
        lastZ = z
    }
    if (!window.shakeEvent) {
        window.shakeEvent = []
    }
    toShake = throttle(toShake)
    window.shakeEvent.push(toShake)
    
    setDevice(toShake, (message) => {
        alert(message)
    })
    return window.shakeEvent.length - 1
}

export  function removeShake(index) {
    window.removeEventListener('devicemotion', window.shakeEvent[index])
}