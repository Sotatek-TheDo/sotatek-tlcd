/******/ (function () {
  // webpackBootstrap
  /******/ "use strict";
  /******/ var __webpack_modules__ = {
    /***/ 136: /***/ function (
      __unused_webpack_module,
      exports,
      __webpack_require__
    ) {
      var __awaiter =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P
              ? value
              : new P(function (resolve) {
                  resolve(value);
                });
          }
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }
            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : adopt(result.value).then(fulfilled, rejected);
            }
            step(
              (generator = generator.apply(thisArg, _arguments || [])).next()
            );
          });
        };
      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, "__esModule", { value: true });
      const fetch_apis_1 = __importDefault(__webpack_require__(203));
      const utils_1 = __webpack_require__(593);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Background {
        constructor() {
          this.run("constructor");
          this.listener();
          this.tabId = null;
          this.url = null;
        }

        run(caller) {
          if (caller === "constructor") {
            chrome.webNavigation.onCompleted.addListener(
              async (details) => {
                (this.tabId = details.tabId), (this.url = details.url);
                const doneInFirstTime = await this.handler(
                  details.tabId,
                  details.url
                );
                if (!doneInFirstTime) {
                  const callLoop = setInterval(async () => {
                    const success = await this.handler(
                      details.tabId,
                      details.url
                    );
                    if (success) {
                      clearInterval(callLoop);
                    } else {
                    }
                  }, 10000);
                }
              },
              {
                url: [
                  {
                    hostEquals: "chat.google.com",
                  },
                  {
                    urlEquals: "https://mail.google.com/chat",
                  },
                ],
              }
            );
          } else {
            this.handler();
          }
        }

        async handler(tabId = this.tabId, url = this.url) {
          if (!tabId || !url) {
            console.log("Missing tab info");
            return;
          }
          if (url.includes("oi=1")) return;
          await new Promise((resolve) => {
            chrome.storage.local.clear(() => {
              resolve();
            });
          });
          return await new Promise((s, f) => {
            chrome.cookies.getAll(
              { domain: "portal.sotatek.com" },
              function (cookies) {
                const loadedData = __awaiter(
                  this,
                  void 0,
                  void 0,
                  function* () {
                    const portalCookie = cookies[0];
                    if (!portalCookie) {
                      yield chrome.storage.local.set({
                        login_portal_status: "no_cookie",
                      });
                      (0, utils_1.inject)(tabId);
                      return;
                    }
                    const sessionHeader = "session_id=" + portalCookie.value;
                    let needCheck = yield new Promise((resolve, reject) => {
                      chrome.storage.local.get("employee_data", (data) => {
                        var _a;
                        if (data.employee_data === undefined) {
                          resolve(true);
                          return;
                        }
                        const userData =
                          (_a = data.employee_data.result) === null ||
                          _a === void 0
                            ? void 0
                            : _a.records[0];
                        const checkedToday =
                          (userData === null || userData === void 0
                            ? void 0
                            : userData.date_check) ===
                            (0, utils_1.getCurrentFormattedDate)() &&
                          (userData === null || userData === void 0
                            ? void 0
                            : userData.check_in) !== false;
                        if (checkedToday) resolve(false);
                        else resolve(true);
                      });
                    });
                    let loginState = yield new Promise((resolve, reject) => {
                      chrome.storage.local.get(
                        "login_portal_status",
                        (data) => {
                          if (data.login_portal_status !== "session_up")
                            resolve(false);
                          else resolve(true);
                        }
                      );
                    });
                    if (needCheck || !loginState) {
                      yield new Promise((resolve, reject) => {
                        chrome.scripting.executeScript(
                          {
                            target: { tabId: tabId },
                            func: () => {
                              const elements =
                                document.querySelectorAll("script");
                              const emailRegex = /\"[\w.-]+@sotatek.com\"/g;
                              let gb_ie;

                              for (const element of elements) {
                                const elementText =
                                  element.textContent ||
                                  element.innerText ||
                                  "";
                                const elementMatches =
                                  elementText.match(emailRegex);
                                if (elementMatches && elementMatches.length) {
                                  gb_ie = elementMatches[0].slice(1, -1);
                                  break;
                                }
                              }
                              chrome.storage.local.set({ gb_ie });
                            },
                          },
                          () => {
                            resolve();
                          }
                        );
                      });
                      return yield new Promise((resolve, reject) => {
                        chrome.storage.local.get("gb_ie", (gb_ie) => {
                          const fetchApis = new fetch_apis_1.default();
                          fetchApis
                            .fetchUserId(sessionHeader, gb_ie.gb_ie)
                            .then((user) =>
                              __awaiter(this, void 0, void 0, function* () {
                                let success = false;
                                if (
                                  !user ||
                                  user.result === undefined ||
                                  !user.result.length
                                ) {
                                  console.log("Cannot fetch user id");
                                  yield chrome.storage.local.set({
                                    login_portal_status: "session_expired",
                                  });
                                  (0, utils_1.inject)(tabId);
                                  resolve();
                                  return;
                                }
                                yield chrome.storage.local.set({
                                  login_portal_status: "session_up",
                                });
                                const userId =
                                  user.result.records[0].attendance_machine_id;
                                const currentDate = (0,
                                utils_1.getCurrentFormattedDate)();
                                const tomorrow = (0,
                                utils_1.getCurrentFormattedDate)(1);
                                yield fetchApis
                                  .fetchUserData(
                                    sessionHeader,
                                    userId,
                                    currentDate,
                                    tomorrow
                                  )
                                  .then((data) =>
                                    __awaiter(
                                      this,
                                      void 0,
                                      void 0,
                                      function* () {
                                        if (data.result === undefined) {
                                          console.log("Cannot fetch user data");
                                          return;
                                        }
                                        yield chrome.storage.local.set({
                                          employee_data: data,
                                        });
                                        (0, utils_1.inject)(tabId);
                                        success = true;
                                      }
                                    )
                                  );
                                const { firstDay, lastDay } = (0,
                                utils_1.getFormattedMonthRange)();
                                yield fetchApis
                                  .fetchUserData(
                                    sessionHeader,
                                    userId,
                                    firstDay,
                                    lastDay
                                  )
                                  .then((data) =>
                                    __awaiter(
                                      this,
                                      void 0,
                                      void 0,
                                      function* () {
                                        if (data.result === undefined) {
                                          console.log("Cannot fetch user data");
                                          return;
                                        }
                                        yield chrome.storage.local.set({
                                          employee_month_data: data,
                                        });
                                        (0, utils_1.inject)(tabId);
                                      }
                                    )
                                  );
                                resolve(success);
                              })
                            );
                        });
                      });
                    } else {
                      (0, utils_1.inject)(tabId);
                      return true;
                    }
                  }
                );
                s(loadedData);
              }
            );
          });
        }

        listener() {
          chrome.cookies.onChanged.addListener((changeInfo) =>
            __awaiter(this, void 0, void 0, function* () {
              if (changeInfo.cookie.domain === "portal.sotatek.com") {
                const cookie = yield new Promise((resolve, reject) => {
                  chrome.cookies.getAll(
                    { domain: "portal.sotatek.com" },
                    function (cookies) {
                      return __awaiter(this, void 0, void 0, function* () {
                        const portalCookie = cookies[0];
                        resolve(
                          portalCookie === null || portalCookie === void 0
                            ? void 0
                            : portalCookie.value
                        );
                      });
                    }
                  );
                });
                if (!cookie) console.log("No portal cookie");
                if (changeInfo.cookie.value !== cookie) {
                  yield new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                    }, 5000);
                  });
                  this.run("listener");
                }
              }
            })
          );
        }
      }
      new Background();

      /***/
    },

    /***/ 203: /***/ function (__unused_webpack_module, exports) {
      Object.defineProperty(exports, "__esModule", { value: true });
      class FetchApis {
        constructor() {
          this.fetchUserId = (sessionHeader, email) => {
            return fetch("https://portal.sotatek.com/web/dataset/search_read", {
              mode: "cors",
              headers: this.getHeader(sessionHeader),
              method: "POST",
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                  limit: 1,
                  model: "hr.employee",
                  sort: "create_date DESC",
                  domain: [
                    "|",
                    ["work_email", "ilike", email],
                    ["name", "ilike", email],
                  ],
                  context: {},
                  fields: ["attendance_machine_id", "name", "work_email"],
                },
              }),
            })
              .then((response) => response.json())
              .catch((error) => console.log("Error while fetching:", error));
          };
          this.fetchUserData = (sessionHeader, userId, from, to) => {
            return fetch("https://portal.sotatek.com/web/dataset/search_read", {
              mode: "cors",
              headers: this.getHeader(sessionHeader),
              method: "POST",
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                  model: "hr.attendance",
                  domain: [
                    "&",
                    "&",
                    ["date_check", ">=", from],
                    ["date_check", "<", to],
                    ["employee_id.attendance_machine_id", "=", userId],
                  ],
                  fields: [
                    "timekeeping_code",
                    "employee_id",
                    "date_check",
                    "check_in",
                    "check_out",
                  ],
                  limit: 100,
                  sort: "",
                  context: {},
                },
                id: 0,
              }),
            })
              .then((response) => response.json())
              .catch((error) => console.log("Error while fetching:", error));
          };
        }
        getHeader(sessionHeader) {
          return {
            Cookie: sessionHeader,
            "Content-Type": "application/json",
            Accept: "*/*",
            Connection: "keep-alive",
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
            Host: "<calculated when request is sent>",
            "Content-Length": "<calculated when request is sent>",
            Origin: "https://portal.sotatek.com",
            Referer: "https://portal.sotatek.com/web",
            "Access-Control-Allow-Origin": "*",
          };
        }
      }
      exports["default"] = FetchApis;

      /***/
    },

    /***/ 593: /***/ function (__unused_webpack_module, exports) {
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getFormattedMonthRange =
        exports.inject =
        exports.getCurrentFormattedDate =
        exports.convertMsToTime =
        exports.dateToString =
        exports.normalizeTime =
        exports.stringToTime =
          void 0;
      const stringToTime = (timeString) => {
        const [hh, mm, ss] = timeString.split(":");
        const time = new Date();
        time.setHours(+hh);
        time.setMinutes(+mm);
        time.setSeconds(+ss);
        return time;
      };
      exports.stringToTime = stringToTime;
      const normalizeTime = (time) => {
        const normalizeTime = new Date();
        if (time.getHours() < 8) {
          normalizeTime.setHours(8);
          normalizeTime.setMinutes(0);
          normalizeTime.setSeconds(0);
          return normalizeTime;
        }
        if (time.getHours() >= 9 && time.getHours() < 12) {
          normalizeTime.setHours(9);
          normalizeTime.setMinutes(0);
          normalizeTime.setSeconds(0);
          return normalizeTime;
        }
        if (time.getHours() >= 12 && time.getHours() < 17) {
          normalizeTime.setHours(8);
          normalizeTime.setMinutes(30);
          normalizeTime.setSeconds(0);
          return normalizeTime;
        }
        if (
          (time.getHours() === 18 && time.getMinutes() > 30) ||
          time.getHours() > 18
        ) {
          normalizeTime.setHours(18);
          normalizeTime.setMinutes(30);
          normalizeTime.setSeconds(0);
          return normalizeTime;
        }
        return time;
      };
      exports.normalizeTime = normalizeTime;
      const dateToString = (time) => {
        const hour = String(time.getHours()).padStart(2, "0");
        const minute = String(time.getMinutes()).padStart(2, "0");
        const second = String(time.getSeconds()).padStart(2, "0");
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
        return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
          seconds
        )}`;
      };
      exports.convertMsToTime = convertMsToTime;
      const padTo2Digits = (num) => {
        return num.toString().padStart(2, "0");
      };
      const getCurrentFormattedDate = (add) => {
        const currentDate = new Date();
        if (add) {
          currentDate.setDate(currentDate.getDate() + add);
        }
        return formatDate(currentDate);
      };
      exports.getCurrentFormattedDate = getCurrentFormattedDate;
      const inject = (tabId) => {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: ["src/injector.js"],
          },
          () => {}
        );
      };
      exports.inject = inject;
      const getFormattedMonthRange = () => {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return { firstDay: formatDate(firstDay), lastDay: formatDate(lastDay) };
      };
      exports.getFormattedMonthRange = getFormattedMonthRange;
      const formatDate = (date) => {
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
      };

      /***/
    },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ // This entry module is referenced by other modules so it can't be inlined
  /******/ var __webpack_exports__ = __webpack_require__(136);
  /******/
  /******/
})();
