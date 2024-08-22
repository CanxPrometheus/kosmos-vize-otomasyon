const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const {startAppointmentCheck, stopAppointmentCheck } = require("./puppeteer");
const {ExecuteSql} = require("./db");


function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
        icon: path.join(__dirname, 'images/logo.png')
    });

    win.loadFile('index2.html');
  //  win.webContents.openDevTools();
    Menu.setApplicationMenu(null);
}

app.on('ready', () => {
    updateStartedStatus(false);

    createWindow();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

function updateStartedStatus(newStatus) {
    try {
        const config = readConfig(); 
        config.TELEGRAM.started = newStatus; 
        writeConfig(config); 
    } catch (error) {
        console.error('Error updating started status:', error);
    }
}

ipcMain.on('createUser', async function(event, message) {
    const data = JSON.parse(message);
    const query = await ExecuteSql("SELECT * FROM users WHERE tckn IN (?)", [data.tckns]);
    if (query[0]) {
        return event.sender.send('userCreated', {status: false, message: "ZATEN BÖYLE BİR KULLANICI VAR"});
    }
    await ExecuteSql("INSERT INTO users (name, basvuru_il, basvuru_sekli, basvuru_tipi, tckn, basvurumerkez) VALUES (?, ?, ?, ?, ?, ?)", [data.name, data.basvuru_il, data.basvuru_sekli, data.basvuru_tipi, JSON.stringify(data.tckns), data.basvurumerkez]);
    
    const query2 = await ExecuteSql("SELECT * FROM users");
    event.sender.send('sendUserList', {status: true, users: query2});
    return event.sender.send('userCreated', {status: true, message: "Kullanıcı başarıyla oluşturuldu!"});
});




ipcMain.on('getUsers', async function(event, message) {
    const query = await ExecuteSql("SELECT * FROM users");
    return event.sender.send('sendUserList', {status: true, users: query});
});


ipcMain.on('deleteUser', async function(event, userId) {
    try {
        console.log(userId)
        await ExecuteSql("DELETE FROM users WHERE id = ?", [userId]);
        const query = await ExecuteSql("SELECT * FROM users");
        event.sender.send('sendUserList', {status: true, users: query});
        event.sender.send('userDeleted', {status: true, message: "Kullanıcı Silindi!"});
    } catch (error) {
        event.sender.send('userDeleted', {status: false, message: error.message});
    }
});

ipcMain.on('deleteque', async function(event, userId) {
    try {
        await ExecuteSql("DELETE FROM queue WHERE id = ?", [userId]);
 
    } catch (error) {
     //   event.sender.send('userDeleted', {status: false, message: error.message});
    }
});




ipcMain.on('cikarsira', async function(event, userId) {
    try {
        await ExecuteSql("DELETE FROM queue WHERE id = ?", [userId]);
        event.sender.send('sendAllQueue', {status: true, queue: allQueue});

    } catch (error) {
   //     event.sender.send('userDeleted', {status: false, message: error.message});
    }
});


ipcMain.on('deleteAllCustomer', async (event) => {
    try {
        await ExecuteSql("DELETE FROM users");
        const query = await ExecuteSql("SELECT * FROM users");
        event.sender.send('sendUserList', {status: true, users: query});
        
        event.sender.send('sendAllQueue', {status: true, queue: allQueue});
        event.sender.send('allUsersDeleted', { status: true, message: "Tüm Kullanıcılar Silindi" });
    } catch (err) {
       // event.sender.send('allUsersDeleted', { status: false, message: "Silinecek Kullanıcı Bulunamadı" });
    }
});




ipcMain.on('createCard', async (event, message) => {
    const data = JSON.parse(message);
    const query = await ExecuteSql("SELECT * FROM credit_card WHERE number = ?", [data.number]);
    if (query.length > 0) {
        return event.sender.send('cardCreated', { status: false, message: "ZATEN BÖYLE BİR KART VAR" });
    }

    await ExecuteSql("INSERT INTO credit_card (name, surname, number, month, year, cvc) VALUES (?, ?, ?, ?, ?, ?)", 
        [data.name, data.surname, data.number, data.expiryMonth, data.expiryYear, data.cvc]);
    
    const query2 = await ExecuteSql("SELECT * FROM credit_card");
    event.sender.send('sendcardList', { status: true, users: query2 });
    return event.sender.send('cardCreated', { status: true, message: "Kart başarıyla oluşturuldu!" });
});



ipcMain.on('getcard', async (event) => {
    try {
        const query = await ExecuteSql("SELECT * FROM credit_card");
        event.sender.send('sendcardList', { status: true, cards: query });
    } catch (error) {
        console.error("Kartlar alınırken bir hata oluştu:", error);
        event.sender.send('sendcardList', { status: false, message: "Kartlar alınırken bir hata oluştu!" });
    }
});

ipcMain.on('deletecard', async function(event, cardId) {
    try {
        await ExecuteSql("DELETE FROM credit_card WHERE id = ?", [cardId]);
        const query = await ExecuteSql("SELECT * FROM credit_card");
        event.sender.send('sendcardList', {status: true, cards: query});
        event.sender.send('oncardDeleted', {status: true});
    } catch (error) {
        event.sender.send('oncardDeleted', {status: false, message: error.message});
    }
});


ipcMain.on('addQueue', async function(event, message, creditcardid) {
    try {
        await ExecuteSql("DELETE FROM queue");

        const data = JSON.parse(message);

        const cardInfo = await ExecuteSql('SELECT name, surname, number, month, year, cvc FROM credit_card WHERE id = ?', [creditcardid]);

        if (cardInfo.length === 0) {
            throw new Error('Credit card not found');
        }

        const card = cardInfo[0];

        const maxSiraResult = await ExecuteSql('SELECT MAX(sira) AS maxSira FROM queue');
        let nextSira = maxSiraResult[0].maxSira || 0;

        for (const entry of data) {
            const existingEntry = await ExecuteSql('SELECT * FROM queue WHERE id = ?', [entry.id]);

            if (existingEntry.length === 0) {
                nextSira += 1;

                await ExecuteSql('INSERT INTO queue (id, name, basvuru_il, basvuru_sekli, basvuru_tipi, tckn, cardnumber, card_name, card_surname, card_month, card_year, card_cvv, sira, basvurumerkez) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                    [
                        entry.id || 'Unknown', 
                        entry.name || 'Unknown', 
                        entry.basvuru_il || 'Unknown', 
                        entry.basvuru_sekli || 'Unknown', 
                        entry.basvuru_tipi || 'Unknown', 
                        JSON.stringify(entry.tckn) || '[]', 
                        card.number, 
                        card.name, 
                        card.surname, 
                        card.month, 
                        card.year, 
                        card.cvc,
                        nextSira,
                        entry.basvurumerkez,

                    ]
                );
                console.log(entry.basvurumerkez)
            } else {
                console.log(`Entry with id ${entry.id} already exists. Skipping...`);
            }
        }

        event.reply('addQueue-response', { status: 'success', message: 'Queue updated successfully' });
        startAppointmentCheck()
    } catch (error) {
        console.error('Error adding to queue:', error);
        event.reply('addQueue-response', { status: 'error', message: error.message });
    }
});
ipcMain.on('getAllQueue', async function(event, message) {
    const allQueue = await ExecuteSql("SELECT * FROM queue");
    event.sender.send('sendAllQueue', {status: true, queue: allQueue});
});

ipcMain.on('stopqueue', async function(event, message) {
    stopAppointmentCheck()
});





const fs = require('fs');

const configPath = path.join(__dirname, 'config.json');

function readConfig() {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function writeConfig(data) {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 4), 'utf8');
}



ipcMain.on('updateStarted', async function(event, newStatus) {
    try {
        const config = readConfig(); 
        config.TELEGRAM.started = newStatus; 
        writeConfig(config); 

    //    event.reply('updateStartedResponse', { status: 'success', started: newStatus });
    } catch (error) {
        console.error('Error updating started status:', error);
    //    event.reply('updateStartedResponse', { status: 'error', message: error.message });
    }
});


function getStartedStatus() {
    try {
        const config = readConfig(); 
        return config.TELEGRAM.started; 
    } catch (error) {
        console.error('Error reading started status:', error);
        return null;
    }
}


ipcMain.on('getStartedStatus', (event) => {
    const startedStatus = getStartedStatus();
    event.sender.send('sendStartedStatus', { started: startedStatus });
});

