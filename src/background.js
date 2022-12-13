/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 136:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const fetch_apis_1 = __importDefault(__webpack_require__(203));
const utils_1 = __webpack_require__(593);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Background {
    constructor() {
        this.run();
    }
    run() {
        chrome.webNavigation.onCompleted.addListener((details) => __awaiter(this, void 0, void 0, function* () {
            chrome.cookies.getAll({ domain: 'portal.sotatek.com' }, function (cookies) {
                return __awaiter(this, void 0, void 0, function* () {
                    const portalCookie = cookies[0];
                    if (!portalCookie) {
                        chrome.storage.local.set({ login_portal_status: false });
                        (0, utils_1.inject)(details.tabId);
                        return;
                    }
                    else {
                        chrome.storage.local.set({ login_portal_status: true });
                    }
                    const sessionHeader = 'session_id=' + portalCookie.value;
                    let needCheck = yield new Promise((resolve, reject) => {
                        chrome.storage.local.get('userData', (data) => {
                            if (data.userData === undefined) {
                                resolve(true);
                                return;
                            }
                            const dateCheck = data.userData.date_check;
                            const checkedToday = dateCheck === (0, utils_1.getCurrentFormattedDate)() &&
                                data.userData.check_in !== false;
                            if (checkedToday)
                                resolve(false);
                            else
                                resolve(true);
                        });
                    });
                    if (needCheck) {
                        chrome.scripting.executeScript({
                            target: { tabId: details.tabId },
                            func: () => {
                                const gb_ie = document.getElementsByClassName('gb_ie')[0].children[2]
                                    .innerHTML;
                                chrome.storage.local.set({ gb_ie });
                            },
                        }, () => { });
                        chrome.storage.local.get('gb_ie', (gb_ie) => {
                            const fetchApis = new fetch_apis_1.default();
                            fetchApis
                                .fetchUserId(sessionHeader, gb_ie.gb_ie)
                                .then((user) => {
                                if (user.result === undefined || !user.result.length) {
                                    console.log('Cannot fetch user id');
                                    return;
                                }
                                const userId = user.result.records[0].attendance_machine_id;
                                fetchApis
                                    .fetchUserData(sessionHeader, userId)
                                    .then((data) => {
                                    if (data.result === undefined) {
                                        console.log('Cannot fetch user data');
                                        return;
                                    }
                                    chrome.storage.local.set({ employee_data: data });
                                    (0, utils_1.inject)(details.tabId);
                                });
                            });
                        });
                    }
                    else {
                        (0, utils_1.inject)(details.tabId);
                    }
                });
            });
        }), {
            url: [
                {
                    // Runs on example.com, example.net, but also example.foo.com
                    hostContains: 'chat',
                },
            ],
        });
    }
}
new Background();


/***/ }),

/***/ 203:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const utils_1 = __webpack_require__(593);
class FetchApis {
    constructor() {
        this.fetchUserId = (sessionHeader, email) => {
            return fetch('https://portal.sotatek.com/web/dataset/search_read', {
                mode: 'cors',
                headers: this.getHeader(sessionHeader),
                method: 'POST',
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        limit: 1,
                        model: 'hr.employee',
                        sort: 'create_date DESC',
                        domain: [
                            '|',
                            ['work_email', 'ilike', email],
                            ['name', 'ilike', email],
                        ],
                        context: {},
                        fields: ['attendance_machine_id', 'name', 'work_email'],
                    },
                }),
            })
                .then((response) => response.json())
                .catch((error) => console.log('Error while fetching:', error));
        };
        this.fetchUserData = (sessionHeader, userId) => {
            const currentDate = (0, utils_1.getCurrentFormattedDate)();
            return fetch('https://portal.sotatek.com/web/dataset/search_read', {
                mode: 'cors',
                headers: this.getHeader(sessionHeader),
                method: 'POST',
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        model: 'hr.attendance',
                        domain: [
                            '&',
                            '&',
                            ['date_check', '>=', currentDate],
                            ['date_check', '<=', currentDate],
                            ['employee_id.attendance_machine_id', '=', userId],
                        ],
                        fields: [
                            'timekeeping_code',
                            'employee_id',
                            'date_check',
                            'check_in',
                            'check_out',
                        ],
                        limit: 1,
                        sort: '',
                        context: {},
                    },
                    id: 0,
                }),
            })
                .then((response) => response.json())
                .catch((error) => console.log('Error while fetching:', error));
        };
    }
    getHeader(sessionHeader) {
        return {
            Cookie: sessionHeader,
            'Content-Type': 'application/json',
            Accept: '*/*',
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            Host: '<calculated when request is sent>',
            'Content-Length': '<calculated when request is sent>',
            Origin: 'https://portal.sotatek.com',
            Referer: 'https://portal.sotatek.com/web',
            'Access-Control-Allow-Origin': '*',
        };
    }
}
exports["default"] = FetchApis;


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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(136);
/******/ 	
/******/ })()
;