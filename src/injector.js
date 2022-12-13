/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 823:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.INNER_HTML_TYPE = exports.STORAGE_KEYS = void 0;
var STORAGE_KEYS;
(function (STORAGE_KEYS) {
    STORAGE_KEYS["LOGIN_PORTAL_STATUS"] = "login_portal_status";
    STORAGE_KEYS["EMPLOYEE_DATA"] = "employee_data";
})(STORAGE_KEYS = exports.STORAGE_KEYS || (exports.STORAGE_KEYS = {}));
var INNER_HTML_TYPE;
(function (INNER_HTML_TYPE) {
    INNER_HTML_TYPE["TIME_INFO"] = "time_info";
    INNER_HTML_TYPE["MESSAGE"] = "message";
})(INNER_HTML_TYPE = exports.INNER_HTML_TYPE || (exports.INNER_HTML_TYPE = {}));


/***/ }),

/***/ 593:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.inject = exports.getCurrentFormattedDate = exports.convertMsToTime = exports.dateToString = exports.normalizeTime = exports.stringToTime = void 0;
const stringToTime = (timeString) => {
    const [hh, mm, ss] = timeString.split(':');
    const time = new Date();
    time.setHours(+hh);
    time.setMinutes(+mm);
    time.setSeconds(+ss);
    return time;
};
exports.stringToTime = stringToTime;
const normalizeTime = (time) => {
    if (time.getHours() < 8) {
        time.setHours(8);
        time.setMinutes(0);
        time.setSeconds(0);
    }
    if ((time.getHours() === 18 && time.getMinutes() > 30) ||
        time.getHours() > 18) {
        time.setHours(18);
        time.setMinutes(30);
        time.setSeconds(0);
    }
    return time;
};
exports.normalizeTime = normalizeTime;
const dateToString = (time) => {
    const hour = String(time.getHours()).padStart(2, '0');
    const minute = String(time.getMinutes()).padStart(2, '0');
    const second = String(time.getSeconds()).padStart(2, '0');
    return `${hour}:${minute}:${second}`;
};
exports.dateToString = dateToString;
const convertMsToTime = (milliseconds) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 24;
    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
};
exports.convertMsToTime = convertMsToTime;
const padTo2Digits = (num) => {
    return num.toString().padStart(2, '0');
};
const getCurrentFormattedDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
};
exports.getCurrentFormattedDate = getCurrentFormattedDate;
const inject = (tabId) => {
    chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/injector.js'],
    }, () => { });
};
exports.inject = inject;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const constance_1 = __webpack_require__(823);
const utils_1 = __webpack_require__(593);
class Injector {
    constructor() {
        this.containerStyle = {
            display: 'flex',
            height: '39px',
            width: '100%',
            paddingLeft: '24px',
            alignItems: 'center',
            fontSize: '14px',
            boxSizing: 'border-box',
            backgroundColor: 'inherit',
            color: 'inherit',
            marginTop: '5px',
        };
        this.inject();
    }
    inject() {
        chrome.storage.local.get(constance_1.STORAGE_KEYS.LOGIN_PORTAL_STATUS, (status) => {
            const toElement = Array.from(document.getElementsByClassName('adZ'))[0];
            let container = document.getElementById('tlcd');
            if (!container) {
                container = document.createElement('div');
                this.setStyle(container, this.containerStyle);
                container.setAttribute('id', 'tlcd');
                toElement.insertBefore(container, toElement.firstChild);
            }
            if (status.login_portal_status) {
                chrome.storage.local.get(constance_1.STORAGE_KEYS.EMPLOYEE_DATA, (data) => {
                    var _a, _b;
                    const userData = (_b = (_a = data.employee_data) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.records[0];
                    if (!userData.check_in) {
                        container.innerHTML = this.getInnerHtml(constance_1.INNER_HTML_TYPE.MESSAGE, {
                            message: `No check-in data yet`,
                        });
                        return;
                    }
                    let checkInTime = (0, utils_1.stringToTime)(userData.check_in.split(' ')[1]);
                    checkInTime.setHours(checkInTime.getHours() + 7);
                    checkInTime = (0, utils_1.normalizeTime)(checkInTime);
                    const checkInText = (0, utils_1.dateToString)(checkInTime);
                    const timeOff = this.getTimeOff(checkInTime);
                    if (container.innerHTML.includes('Check'))
                        return;
                    if (timeOff.getTime() - new Date().getTime() >= 0) {
                        container.innerHTML = this.getInnerHtml(constance_1.INNER_HTML_TYPE.TIME_INFO, {
                            checkIn: checkInText,
                            timeLeft: '0',
                        });
                    }
                    const interval = setInterval(() => {
                        const currentTime = new Date();
                        const millisecondsDiff = timeOff.getTime() - currentTime.getTime();
                        if (millisecondsDiff < 0) {
                            clearInterval(interval);
                            container.style.height = '20px';
                            container.innerHTML = this.getInnerHtml(constance_1.INNER_HTML_TYPE.MESSAGE, {
                                message: `It's time to go home :)`,
                            });
                            return;
                        }
                        const tle = document.getElementById('timeLeft');
                        const timeLeft = (0, utils_1.convertMsToTime)(millisecondsDiff);
                        tle.innerHTML = timeLeft;
                    }, 1000);
                });
            }
            else {
                container.innerHTML = this.getInnerHtml(constance_1.INNER_HTML_TYPE.MESSAGE, {
                    message: `You are not logged in portal!`,
                });
            }
        });
    }
    setStyle(element, style) {
        for (const property in style) {
            element.style[property] = style[property];
        }
    }
    getTimeOff(checkInTime) {
        checkInTime.setHours(checkInTime.getHours() + 9);
        checkInTime.setMinutes(checkInTime.getMinutes() + 30);
        checkInTime = (0, utils_1.normalizeTime)(checkInTime);
        return checkInTime;
    }
    getInnerHtml(type, data) {
        let content = '';
        if (type === constance_1.INNER_HTML_TYPE.TIME_INFO) {
            content = `<div style="height: 39px; width: inherit; box-sizing: border-box;">
      <div style="height: 19px; width: inherit;">
          <div style="display: flex; height: inherit">
              <div style="width: 40%; height: inherit; background-color: #6086a1; border-radius: 2px 0 0 0; display: flex; align-items: center; justify-content: center">Check in</div>
              <div style="width: 60%; height: inherit; background-color: #e7e7e7; border-radius: 0 2px 0 0; display: flex; align-items: center; justify-content: center">${data.checkIn}</div>
          </div>
     </div>
      <div style="height: 19px; width: inherit; margin-top: 1px">
          <div style="display: flex; height: inherit">
              <div style="width: 40%; height: inherit; background-color: #6086a1; border-radius: 0 0 0 2px; display: flex; align-items: center; justify-content: center">Time left</div>
              <div id="timeLeft" style="width: 60%; height: inherit; background-color: #e7e7e7; border-radius: 0 0 2px 0; display: flex; align-items: center; justify-content: center">${data.timeLeft}</div>
          </div>
      </div>
      </div>`;
        }
        if (type === constance_1.INNER_HTML_TYPE.MESSAGE) {
            content = `<div style="width: inherit; height: 20px; background-color: #6086a1; border-radius: 2px; display: flex; align-items: center; justify-content: center">${data.message}</div>`;
        }
        return content;
    }
}
new Injector();
__webpack_unused_export__ = Injector;

}();
/******/ })()
;