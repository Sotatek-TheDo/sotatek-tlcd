/******/ (function () {
  // webpackBootstrap
  /******/ "use strict";
  /******/ var __webpack_modules__ = {
    /***/ 823: /***/ function (__unused_webpack_module, exports) {
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.INNER_HTML_TYPE = exports.STORAGE_KEYS = void 0;
      var STORAGE_KEYS;
      (function (STORAGE_KEYS) {
        STORAGE_KEYS["LOGIN_PORTAL_STATUS"] = "login_portal_status";
        STORAGE_KEYS["EMPLOYEE_DATA"] = "employee_data";
      })((STORAGE_KEYS = exports.STORAGE_KEYS || (exports.STORAGE_KEYS = {})));
      var INNER_HTML_TYPE;
      (function (INNER_HTML_TYPE) {
        INNER_HTML_TYPE["TIME_INFO"] = "time_info";
        INNER_HTML_TYPE["MESSAGE"] = "message";
      })(
        (INNER_HTML_TYPE =
          exports.INNER_HTML_TYPE || (exports.INNER_HTML_TYPE = {}))
      );

      /***/
    },

    /***/ 189: /***/ function (
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
      Object.defineProperty(exports, "__esModule", { value: true });
      const constance_1 = __webpack_require__(823);
      const utils_1 = __webpack_require__(593);
      class Injector {
        constructor() {
          this.containerStyle = {
            display: "block",
            padding: "3px 0",
            width: "100%",
            paddingLeft: "24px",
            paddingRight: "24px",
            alignItems: "center",
            fontSize: "14px",
            boxSizing: "border-box",
            backgroundColor: "inherit",
            color: "inherit",
            marginTop: "5px",
          };
          this.collapsedContainerStyle = {
            display: "none",
            margin: "5px auto",
            padding: "2px",
            borderRadius: "4px",
            fontSize: "18px",
          };
          this.inject();
          this.lateMinutesOfMonth = 0;
        }
        inject() {
          chrome.storage.local.get(
            constance_1.STORAGE_KEYS.LOGIN_PORTAL_STATUS,
            async (status) => {
              this.lateMinutesOfMonth = await new Promise((resolve, reject) => {
                chrome.storage.local.get("employee_month_data", (data) => {
                  var _a, _b;
                  const records =
                    (_b =
                      (_a = data.employee_month_data) === null || _a === void 0
                        ? void 0
                        : _a.result) === null || _b === void 0
                      ? void 0
                      : _b.records;
                  if (!records) return;
                  const latestExceptTime = this.getLatestExceptTime();
                  const totalLateTime = Math.floor(
                    records.reduce((total, record) => {
                      let lateMinutes = 0;
                      var _c = record.date_check
                        ? new Date(record.date_check)
                        : null;
                      if (
                        _c &&
                        _c.getDay() !== 6 &&
                        _c.getDay() !== 0 &&
                        record.check_in
                      ) {
                        const checkIn = (0, utils_1.stringToTime)(
                          record.check_in.split(" ")[1]
                        );
                        checkIn.setHours(checkIn.getHours() + 7);
                        checkIn.setSeconds(0);
                        if (checkIn.getHours > 12) return total;
                        lateMinutes =
                          checkIn.getTime() - latestExceptTime.getTime() > 0
                            ? (checkIn.getTime() - latestExceptTime.getTime()) /
                                60000 >
                              60
                              ? 60
                              : (checkIn.getTime() -
                                  latestExceptTime.getTime()) /
                                60000
                            : 0;
                      }
                      return total + lateMinutes;
                    }, 0)
                  );
                  resolve(totalLateTime);
                });
              });
              const toElement = Array.from(
                document.getElementsByClassName("adZ")
              )[0];
              if (!toElement) return;
              let container = document.getElementById("tlcd");
              let collapsedContainer =
                document.getElementById("tlcd-collapsed");
              if (!container) {
                container = document.createElement("div");
                this.setStyle(container, this.containerStyle);
                container.setAttribute("id", "tlcd");
                toElement.insertBefore(container, toElement.firstChild);
              }
              if (!collapsedContainer) {
                collapsedContainer = document.createElement("div");
                this.setStyle(collapsedContainer, this.collapsedContainerStyle);
                collapsedContainer.innerHTML = "&#9201;";
                collapsedContainer.setAttribute("id", "tlcd-collapsed");
                toElement.insertBefore(
                  collapsedContainer,
                  toElement.firstChild
                );
              }
              if (
                status.login_portal_status === "no_cookie" ||
                status.login_portal_status === "session_expired"
              ) {
                container.innerHTML = this.getInnerHtml(
                  constance_1.INNER_HTML_TYPE.MESSAGE,
                  {
                    message: `You're not logged in to portal&nbsp;<a style="text-decoration: none; color: #b0db0a; font-weight: bold; font-style: italic; letter-spacing: 0.8px" href="https://portal.sotatek.com">&#128073; login</a>`,
                  }
                );
              } else {
                chrome.storage.local.get(
                  constance_1.STORAGE_KEYS.EMPLOYEE_DATA,
                  (data) => {
                    var _a, _b;
                    const userData =
                      (_b =
                        (_a = data.employee_data) === null || _a === void 0
                          ? void 0
                          : _a.result) === null || _b === void 0
                        ? void 0
                        : _b.records[0];
                    if (!userData) return;
                    if (!userData.check_in) {
                      container.innerHTML = this.getInnerHtml(
                        constance_1.INNER_HTML_TYPE.MESSAGE,
                        {
                          message: `No check in data yet &#129335;`,
                        }
                      );
                      return;
                    }
                    let checkInTime = (0, utils_1.stringToTime)(
                      userData.check_in.split(" ")[1]
                    );
                    checkInTime.setHours(checkInTime.getHours() + 7);
                    const checkInText = (0, utils_1.dateToString)(checkInTime);
                    const checkInTimeNormalized = (0, utils_1.normalizeTime)(
                      checkInTime
                    );
                    const timeOff = this.getTimeOff(checkInTimeNormalized);
                    if (container.innerHTML.includes("Check")) return;
                    if (timeOff.getTime() - new Date().getTime() >= 0) {
                      container.innerHTML = this.getInnerHtml(
                        constance_1.INNER_HTML_TYPE.TIME_INFO,
                        {
                          checkIn: checkInText,
                          timeLeft: "00:00:00",
                        }
                      );
                    }
                    if (this.lateMinutesOfMonth) {
                      let message;
                      let bgColor = "#185c10";
                      if (
                        this.lateMinutesOfMonth - 90 < 0 &&
                        this.lateMinutesOfMonth - 90 > -60
                      ) {
                        message = `Late allowance period: ${
                          90 - this.lateMinutesOfMonth
                        } minutes remaining`;
                      }
                      if (
                        this.lateMinutesOfMonth - 90 > 0 &&
                        this.lateMinutesOfMonth - 90 < 30
                      ) {
                        message = `You're late ${
                          this.lateMinutesOfMonth - 90
                        } minutes this month &#128184;`;
                        bgColor = "#a57d04";
                      }
                      if (
                        this.lateMinutesOfMonth - 90 > 0 &&
                        this.lateMinutesOfMonth - 90 >= 30
                      ) {
                        message = `Oops! You have been ${
                          this.lateMinutesOfMonth - 90
                        } minutes late this month &#128184;`;
                        bgColor = "#ad3a16";
                      }
                      if (message) this.displayMessage(message, bgColor);
                    }
                    if (
                      checkInTime.getHours() >= 12 &&
                      checkInTime.getHours() < 17
                    ) {
                      this.displayMessage(
                        `Cannot calculate exactly (max time has been set)`
                      );
                    }
                    const interval = setInterval(() => {
                      const currentTime = new Date();
                      const millisecondsDiff =
                        timeOff.getTime() - currentTime.getTime();
                      if (millisecondsDiff < 0) {
                        this.getGoHomeMessage().then((message) => {
                          clearInterval(interval);
                          container.style.height = "20px";
                          container.innerHTML = this.getInnerHtml(
                            constance_1.INNER_HTML_TYPE.MESSAGE,
                            { message }
                          );
                        });
                        return;
                      }
                      const tle = document.getElementById("timeLeft");
                      if (!tle) {
                        clearInterval(interval);
                        return;
                      }
                      const timeLeft = (0, utils_1.convertMsToTime)(
                        millisecondsDiff
                      );
                      tle.innerHTML = timeLeft;
                    }, 1000);
                  }
                );
                this.onClassChange(container, collapsedContainer);
              }
            }
          );
        }
        setStyle(element, style) {
          for (const property in style) {
            element.style[property] = style[property];
          }
        }
        getTimeOff(checkInTime) {
          let timeOff = new Date();
          timeOff.setHours(checkInTime.getHours() + 9);
          timeOff.setMinutes(checkInTime.getMinutes() + 30);
          timeOff.setSeconds(checkInTime.getSeconds());
          timeOff = (0, utils_1.normalizeTime)(timeOff);
          return timeOff;
        }
        getLatestExceptTime() {
          const latestExceptTime = new Date();
          latestExceptTime.setHours(9);
          latestExceptTime.setMinutes(0);
          latestExceptTime.setSeconds(0);
          return latestExceptTime;
        }
        getInnerHtml(type, data) {
          let content = "";
          if (type === constance_1.INNER_HTML_TYPE.TIME_INFO) {
            content = `<div style="width: inherit; box-sizing: border-box; margin-right: 16px"; display: fixed">
                  <div id="tlcd_message" style="width: fit-content; background-color: #df4c1d; font-weight: bold;; color: white; font-size: 10px; border-radius: 4px; display: none; padding: 2px 10px; margin-bottom: 2px"></div>
                  <div style="width: inherit;">
                      <div style="display: flex">
                          <div style="width: 40%; padding: 3px 2px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; background-color: #6086a1; border-radius: 2px 0 0 0; display: flex; align-items: center; justify-content: center; color: white">Check in</div>
                          <div style="width: 60%; padding: 3px 2px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; background-color: #e7e7e7; border-radius: 0 2px 0 0; display: flex; align-items: center; justify-content: center">${data.checkIn}</div>
                      </div>
                  </div>
                  <div style="width: inherit; margin-top: 1px">
                      <div style="display: flex">
                          <div style="width: 40%; padding: 3px 2px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; background-color: #6086a1; border-radius: 0 0 0 2px; display: flex; align-items: center; justify-content: center; color: white">Time left</div>
                          <div id="timeLeft" style="width: 60%; padding: 3px 2px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; background-color: #e7e7e7; border-radius: 0 0 2px 0; display: flex; align-items: center; justify-content: center">${data.timeLeft}</div>
                      </div>
                  </div>
                </div>`;
          }
          if (type === constance_1.INNER_HTML_TYPE.MESSAGE) {
            content = `<div style="width: inherit; background-color: #6086a1; border-radius: 2px; display: block; text-align: center; padding: 3px 2px; color: white">${data.message}</div>`;
          }
          return content;
        }
        displayMessage(message, bgColor) {
          const tlcd_message = document.getElementById("tlcd_message");
          if (tlcd_message) {
            tlcd_message.style.display = "block";
            tlcd_message.innerHTML = message;
            if (bgColor) {
              tlcd_message.style.backgroundColor = bgColor;
            }
          }
        }
        onClassChange(container, collapsedContainer) {
          const panel = Array.from(
            document.getElementsByClassName("oy8Mbf nn")
          )[0];
          this.switchView(panel, container, collapsedContainer);
          const observer = new MutationObserver((mutationList) => {
            for (const mutation of mutationList) {
              if (
                mutation.type === "attributes" &&
                mutation.attributeName === "class"
              ) {
                this.switchView(mutation.target, container, collapsedContainer);
              }
            }
          });
          observer.observe(panel, { attributes: true });
        }
        switchView(panel, expand, collapsed) {
          if (
            panel.classList.contains("bhZ") &&
            !panel.classList.contains("bym")
          ) {
            expand.style.display = "none";
            collapsed.style.display = "block";
          } else {
            expand.style.display = "block";
            collapsed.style.display = "none";
          }
        }
        getGoHomeMessage() {
          return __awaiter(this, void 0, void 0, function* () {
            const todayGoHomeMessage = yield new Promise((resolve, reject) => {
              chrome.storage.local.get("go_home_message", (data) => {
                var _a, _b;
                if (
                  ((_a = data.go_home_message) === null || _a === void 0
                    ? void 0
                    : _a.date) === new Date().getDate()
                ) {
                  resolve(
                    (_b = data.go_home_message) === null || _b === void 0
                      ? void 0
                      : _b.message
                  );
                } else {
                  resolve("");
                }
              });
            });
            if (!todayGoHomeMessage.length) {
              const listGoHomeMessage = [
                "Working hours are over &nbsp;&#128536;",
                `It's time to go home &nbsp;&#127969; &nbsp;&#127939;`,
              ];
              const weekendMessage = [
                "Happy weekend &nbsp;&#127881; &nbsp;&#127881; &nbsp;&#127881;",
                "Today is Friday &nbsp;&#128561;",
                "Two days for party &nbsp;&#129782;",
              ];
              const radomMessage =
                new Date().getDay() === 5
                  ? weekendMessage[
                      Math.floor(Math.random() * listGoHomeMessage.length)
                    ]
                  : listGoHomeMessage[
                      Math.floor(Math.random() * listGoHomeMessage.length)
                    ];
              yield chrome.storage.local.set({
                go_home_message: {
                  date: new Date().getDate(),
                  message: radomMessage,
                },
              });
              return radomMessage;
            }
            return todayGoHomeMessage;
          });
        }
      }
      new Injector();
      exports["default"] = Injector;

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
          normalizeTime.setHours(9);
          normalizeTime.setMinutes(0);
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
  /******/ var __webpack_exports__ = __webpack_require__(189);
  /******/
  /******/
})();
