const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    createUser: (message) => ipcRenderer.send('createUser', message),
    onUserCreated: (callback) => ipcRenderer.on('userCreated', (event, response) => callback(response)),
    

    getUsersBack: (message) => ipcRenderer.send('getUsersBack', message),
    getUsersBacked: (callback) => ipcRenderer.on('getUsersBacked', (event, response) => callback(response)),

    getUsers: (message) => ipcRenderer.send('getUsers', message),
    sendUserList: (callback) => ipcRenderer.on('sendUserList', (event, response) => callback(response)),


    
    createCard: (message) => ipcRenderer.send('createCard', message),
    cardCreated: (callback) => ipcRenderer.on('cardCreated', (event, response) => callback(response)),


    getcard: (message) => ipcRenderer.send('getcard', message),
    sendcardList: (callback) => ipcRenderer.on('sendcardList', (event, response) => callback(response)),

    deletecard: (message) => ipcRenderer.send('deletecard', message),
    oncardDeleted: (callback) => ipcRenderer.on('oncardDeleted', (event, response) => callback(response)),
    
    deleteUser: (message) => ipcRenderer.send('deleteUser', message),
    userDeleted: (callback) => ipcRenderer.on('userDeleted', (event, response) => callback(response)),
    
    deleteque: (message) => ipcRenderer.send('deleteque', message),


    
    cikarsira: (message) => ipcRenderer.send('cikarsira', message),
    stopqueue: (message) => ipcRenderer.send('stopqueue', message),


    deleteAllCustomer: (message) => ipcRenderer.send('deleteAllCustomer', message),
    allUsersDeleted: (callback) => ipcRenderer.on('allUsersDeleted', (event, response) => callback(response)),


    updateStarted: (message) => ipcRenderer.send('updateStarted', message),
   // updateStartedResponse: (callback) => ipcRenderer.on('updateStartedResponse', (event, response) => callback(response)),

    getStartedStatus: (message) => ipcRenderer.send('getStartedStatus', message),
    sendStartedStatus: (callback) => ipcRenderer.on('sendStartedStatus', (event, response) => callback(response)),

    

    start: (message) => ipcRenderer.send('start', message),
    stopque: (message) => ipcRenderer.send('stopque', message),


    getAllQueue: (message) => ipcRenderer.send('getAllQueue', message),
    addQueue: (message, creditcard) => ipcRenderer.send('addQueue', message, creditcard),
    cancelQueue: (message) => ipcRenderer.send('cancelQueue', message),
    addQueueCallback: (callback) => ipcRenderer.on('addQueueCallback', (event, response) => callback(response)),
    sendAllQueue: (callback) => ipcRenderer.on('sendAllQueue', (event, response) => callback(response)),
    

});