const puppeteer = require('puppeteer-extra');
const proxyPlugin = require('puppeteer-extra-plugin-proxy');
const { default: RecaptchaPlugin, BuiltinSolutionProviders } = require("puppeteer-extra-plugin-recaptcha");
const CapMonsterProvider = require("puppeteer-extra-plugin-recaptcha-capmonster");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require("path");
const fs = require("fs")
puppeteer.use(StealthPlugin());
const proxyHost = 'server3.livaproxy.com'; //server4
const proxyPort = 40406;
const proxyUsername = 'XTZA4ETM';
const proxyPassword = 'XTZA4ETM';
puppeteer.use(
  proxyPlugin({
    address: proxyHost,
    port: proxyPort,
    credentials: {
      username: proxyUsername,
      password: proxyPassword,
    }
  })
);
CapMonsterProvider.use(BuiltinSolutionProviders);
puppeteer.use(
	RecaptchaPlugin({
		provider: {
			id: "capmonster",
			token: "fbb3d029c2690bdcc1819d060b84e315"
		},
		visualFeedback: true
	})
);

const {TelegramLog} = require('../telegram');
const {ExecuteSql} = require('../db');

function delay(time) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

async function waitForLoading(page) {
  await page.waitForSelector("div > div.position-absolute.bg-light.rounded-sm");
  await page.waitForSelector("div > div.position-absolute.bg-light.rounded-sm", { hidden: true });
}

const axios = require("axios");
let proxyattempt = 2;
async function tryAppointment(user, card) {
  if (proxyattempt >= 2) {
    var options = {
      method: 'POST',
      url: 'https://livacloud.com/api/v2/rotate.php',
      params: {
        PROXY: 'server3.livaproxy.com:40406',
        API_KEY: '776c6ad0c70444af9c4fde1429a4b92e'
      }
    };
    try {
      const response = await axios.request(options);
      if (response.data.status) {
        proxyattempt = 0;
        console.log("Proxy yenilendi");
      }
    } catch (error) {
      console.error("Proxy yenileme hatası:", error);
    }
  }
  proxyattempt = proxyattempt + 1
  let browser = null;
  const {id, basvuru_il, basvuru_sekli, basvuru_tipi, tckn, basvurumerkez} = user;
  const sekilid = (basvuru_sekli == "Standart") ? "16" : "18";
  const tipid = (basvuru_tipi == "Bireysel") ? "1" : "2";
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        
        '--no-zygote',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-webrtc',
        '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0"'
      ],
      protocolTimeout: 1200000,
      ignoreDefaultArgs: ['--enable-automation'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0');
    // await page.setExtraHTTPHeaders({
    //   'X-Forwarded-For': '',
    //   'Via': '',
    //   'Forwarded': ''
    // });

    const width = 1920;
    const height = 1080;
    await page.setViewport({ width, height });

    await page.setRequestInterception(true);
    const filePath = path.resolve(__dirname, 'newjs.js');

    // Dosya içeriğini oku
    const modifiedBody = fs.readFileSync(filePath, 'utf8');


    page.on('request', async (request) => {
        if (request.url().includes('chunk-7769216c.7608c881')) {
            const response = await fetch(request.url());
            const body = await response.text();

            request.respond({
                status: 200,
                contentType: 'application/javascript',
                body: modifiedBody
            });
        } else {
            // Diğer istekleri normal şekilde devam ettir
            request.continue();
        }
    });




    await page.goto('https://basvuru.kosmosvize.com.tr/appointmentform', {
      waitUntil: 'networkidle2',
    });


    const result = await page.evaluate(() => {
      change(1289387, "13904437674", "1410409")
    });

    await page.waitForSelector('#cities');
  
    const selectOptionByText = async (page, selector, text) => {
      const result = await page.evaluate((selector, text) => {
        const options = Array.from(document.querySelector(selector).options);
        const option = options.find(option => option.text.trim() === text.trim());
        if (option) {
          option.selected = true;
          return true;
        } else {
          return false;
        }
      }, selector, text);
    
      if (result) {
        await page.evaluate((selector) => {
          const event = new Event('change', { bubbles: true });
          document.querySelector(selector).dispatchEvent(event);
        }, selector);
      } else {
        throw new Error(`Option with text "${text}" not found.`);
      }
    };
    await selectOptionByText(page, '#cities', basvuru_il);
    await page.waitForSelector("#buttonContainer .col-12.col-lg-8 .sp-double-buttons");
    const buttons = await page.$$("#buttonContainer .col-12.col-lg-8 .sp-double-buttons .sp-selectable-button");
    
    let clicked = false;
    for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent.trim());
        if (basvurumerkez === 'Unknown') {
          if (text.includes(basvuru_il)) {
              await button.click();
              clicked = true;
              break;
          }
      } else {
          if (text.includes(basvurumerkez)) {
              await button.click();
              clicked = true;
              break;
          }
      }

    }
    
    if (!clicked && buttons.length > 0) {
      await page.waitForSelector("#buttonContainer > div.col-12.col-lg-4 > div > div");
      await page.click("#buttonContainer > div.col-12.col-lg-4 > div > div");
    }
    await page.click("#app > div.horizontal-layout.horizontal-menu.navbar-floating.footer-static > div.app-content.content.pt-0 > div > div > div > div:nth-child(3) > div > div > div.wizard-card-footer.clearfix > div.wizard-footer-right > span > button")

    await delay(1500);

    if (tipid != "1") {
      const tcnumaralar = JSON.parse(user.tckn); 
      await page.evaluate(() => {
        const formDiv = document.querySelector('#BilgileriniziGirin1 > form > div');
        const selects = formDiv.querySelectorAll('select');
        selects[0].value = '2';
        selects[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
      await delay(1000);
      await page.evaluate((tcnumaralar, sekilid) => {
        const formDiv = document.querySelector('#BilgileriniziGirin1 > form > div');
        
        const inputs = formDiv.querySelectorAll('input');
        const selects = formDiv.querySelectorAll('select');
        selects[2].value = sekilid;
        selects[2].dispatchEvent(new Event('change', { bubbles: true }));
        selects[3].value = tcnumaralar.length;
        selects[3].dispatchEvent(new Event('change', { bubbles: true }));
      }, tcnumaralar, sekilid);
      await delay(1000);

      
      const fillInputs = async (tcnumaralar, page) => {
        const inputs = await page.$$('#BilgileriniziGirin1 > form > div:nth-child(2) input');
        for (let index = 0; index < tcnumaralar.length; index++) {
          const element = tcnumaralar[index];
          await inputs[index].click();
          await inputs[index].focus();
          await page.keyboard.type(element);
          await page.click("#BilgileriniziGirin1 > form > div:nth-child(2)");
          await delay(3000);
          const divforclose = await page.$$("body > div:nth-child(5) > div:nth-child(3) > div > div > div.Vue-Toastification__toast-component-body > div > div > div > span");
          for (let index = 0; index < divforclose.length; index++) {
            const element = divforclose[index];
            element.click();
          }
        }
      };
      await fillInputs(tcnumaralar, page);
      

      

      await page.waitForSelector("body > div:nth-child(5) > div:nth-child(3) > div > div > div.Vue-Toastification__toast-component-body > div > div > div > span");
      await page.click("body > div:nth-child(5) > div:nth-child(3) > div > div > div.Vue-Toastification__toast-component-body > div > div > div > span");

      await delay(1000)
    } else {
      const tcnumaralar = JSON.parse(user.tckn);

      const tckn = tcnumaralar[0]; 
      await page.evaluate((tckn, sekilid) => {
        const formDiv = document.querySelector('#BilgileriniziGirin1 > form > div');
        
        const inputs = formDiv.querySelectorAll('input');
        const selects = formDiv.querySelectorAll('select');
    
        inputs[0].value = tckn;
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        
        selects[0].value = '1';
        selects[0].dispatchEvent(new Event('change', { bubbles: true }));
        selects[2].value = sekilid;
        selects[2].dispatchEvent(new Event('change', { bubbles: true }));
      }, tckn, sekilid);

      await page.focus('#BilgileriniziGirin1 > form input:nth-of-type(1)');
      await page.click("#BilgileriniziGirin1 > form > div");

      await delay(1000)
    }



    const { captchas, solutions, solved } = await page.solveRecaptchas();

    if (solved[0] && solved[0].isSolved) {

    } else {
      // console.log("CAPTCHA FAILED")
      // await browser.close();
      // return false
    }
    
    await delay(2000);
    await page.click("div.wizard-footer-right > span > button");
    await delay(2000);
    await waitForLoading(page);
    // await waitForLoading(page);
    await delay(1000);
    async function checkCalendarAndClick() {
      const availableDays = await page.$$(".cell.day:not(.disabled):not(.blank)");
      console.log(availableDays.length);
      if (availableDays.length > 0) {
        await delay(100);
        const randomIndex = Math.floor(Math.random() * availableDays.length);
        await availableDays[randomIndex].click();
        return true;
      } else {
        return false;
      }
    }
    
    
    let dayFound = false;
    
    while (!dayFound) {
      dayFound = await checkCalendarAndClick();
      if (!dayFound) {
        let nextPageExists = await page.$('.vdp-datepicker__calendar .next:not(.disabled)');
        if (nextPageExists) {
          await page.click('.vdp-datepicker__calendar .next');
          await delay(100);
        } else {
          break;
        }
      }
    }
    

    if (!dayFound) {
      TelegramLog("GENEL", `BOŞLUK BULUNAMADI`);
      await browser.close();
      return false;
    } else {
      // const daysString = allAvailableDays.join(', ');
   //   TelegramLog("GENEL", `BOŞLUK BULUNDU, SAAT BAKILIYOR`);
    }
    await waitForLoading(page);
    await delay(500); // Gecikmeyi arttırın
    const button = await page.$('.demo-inline-spacing > button.isActive');
    if (button) {
      await button.scrollIntoView();  // Görünür kılmak için
      await button.click();
      await delay(2000);
   //   TelegramLog("SUCCESS", `BOŞLUK BULUNDU, SAAT SEÇİLDİ`);
      await page.click("div.wizard-footer-right > span > button");
    } else {
      TelegramLog("GENEL", `SAAT BULUNAMADI`);
      await browser.close();
      return false;
    }
    


    await page.waitForSelector("#RandevunuzuOnaylayın3 > form > div.row.mt-5.mb-2 > div:nth-child(2)");

    let divSelector = "#RandevunuzuOnaylayın3 > form > div.row.mt-5.mb-2 > div:nth-child(2)"
    await page.evaluate((divSelector) => {
      const div = document.querySelector(divSelector);
      if (div) {
        div.scrollTop = div.scrollHeight;
      }
    }, divSelector);
    
    let divSelector2 = "#RandevunuzuOnaylayın3 > form > div:nth-child(5) > div:nth-child(2)"
    await page.evaluate((divSelector2) => {
      const div = document.querySelector(divSelector2);
      if (div) {
        div.scrollTop = div.scrollHeight;
      }
    }, divSelector2);
    let divSelector3 = "#RandevunuzuOnaylayın3 > form > div:nth-child(6) > div:nth-child(2)"
    await page.evaluate((divSelector3) => {
      const div = document.querySelector(divSelector3);
      if (div) {
        div.scrollTop = div.scrollHeight;
      }
    }, divSelector3);

    

    // Checkbox'ları işaretleme
    await page.evaluate((divSelector) => {
      const div = document.querySelector(divSelector);
      if (div) {
        const checkboxes = div.querySelectorAll('.mb-2.custom-control.custom-checkbox .custom-control-input');
        checkboxes.forEach(checkbox => {
          if (!checkbox.checked) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    }, '#RandevunuzuOnaylayın3');

    await delay(4000);
    page.on('dialog', async dialog => {
      console.log('here');
      await dialog.accept();
    });

    try {
      await page.click("div.wizard-footer-right > span > button");
    } catch (error) {
      
    }

    console.log("SMS ONAY EKRANI GELİNDİ");
    await page.waitForSelector("#İşlemiDoğrulayın4 > button");
    await page.click("#İşlemiDoğrulayın4 > button");
    // await waitForLoading(page);
   // TelegramLog("SUCCESS", "SMS KOD BEKLENIYOR");

    // await waitForSelector("#İşlemiDoğrulayın4 > div.row > div > div > input")


    await delay(4000);
    const iframeElement = await page.waitForSelector('iframe.credit-card-form-box', {timeout: 60000*20});
    const iframe = await iframeElement.contentFrame();
    page.on('dialog', dialog => dialog.accept());
    console.log(card)
    await iframe.waitForSelector("#CreditCardNumber")
    await typeWithDelay(page, await iframe.$('#CreditCardNumber'), card.card_number);
    await typeWithDelay(page, await iframe.$('#CardholderName'), card.card_name);
    await typeWithDelay(page, await iframe.$('#CreditCardCvv2'), card.card_cvv);
    await typeWithDelay(page, await iframe.$('#Email'), "mrtcnozvlk2@gmail.com");
    await typeWithDelay(page, await iframe.$('#Phone'), "05438285521");
    await iframe.select('#CreditCardExpireMonth', card.card_month);
    await iframe.select('#CreditCardExpireYear', card.card_year);

    // await delay(3000);

    // await iframe.click("#payment-form > div > button");

    let now = 0;
    while (now < 4) {
      now = now+1
    //  await TelegramLog("SUCCESS", "ODEME SAYFASI AÇILDI BEKLENIYORSUNUZ!!!");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await ExecuteSql("DELETE FROM queue WHERE id = ?", [id]);

    checkAppointment();

    let keepRunning = true;

    browser.on('disconnected', () => {
      console.log('Browser closed');
      keepRunning = false;
    });

    // setTimeout(async() => {
    //   console.log('2 minutes have passed');
    //   await browser.close();
    //   keepRunning = false;
    // }, 1000*60*2);

    while (keepRunning) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;

  } catch (error) {
    console.error('Failed to load the page:', error);
    
    try {
      await browser.close();
      return false;
    } catch (closeError) {
      console.error('Failed to close the browser:', closeError);
      return false;
    }
    
    return false;
  }
}

async function typeWithDelay(page, element, text, delayt = 200) {
  try {
    for (const char of text) {
        await element.type(char);
        await delay(delayt); // Gecikme süresi
    }
    return true;
  } catch (error) {
    return false;
  }
}

let isRunning = false; // Flag to control the execution

const checkAppointment = async () => {
  try {
    if (!isRunning) return; // Check if execution should continue

    const queue = await ExecuteSql("SELECT id, name, basvuru_il, basvuru_sekli, basvuru_tipi, tckn, cardnumber, card_name, card_surname, card_month, card_year, card_cvv, sira, basvurumerkez FROM queue ORDER BY sira ASC");

    if (queue.length === 0) {
      return;
    }

    const appointment = queue[0];

    await tryAppointment(appointment, {
      card_number: appointment.cardnumber,
      card_name: appointment.card_name + " " + appointment.card_surname,
      card_month: appointment.card_month,
      card_year: appointment.card_year,
      card_cvv: appointment.card_cvv
    });

  } catch (error) {
    console.error('An error occurred while trying to make an appointment:', error);
  } finally {
    if (isRunning) {
      setImmediate(checkAppointment); 
    }
  }
};

module.exports.startAppointmentCheck = () => {
  if (!isRunning) {
    isRunning = true;
    checkAppointment();
  }
};

module.exports.stopAppointmentCheck = () => {
  isRunning = false;
};



